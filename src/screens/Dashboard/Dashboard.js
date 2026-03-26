import React, { useEffect, useState, useRef } from "react";
import { Text, View, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, Platform } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as IntentLauncher from 'expo-intent-launcher';
// Redux 
import http from '../../services/http';
import { startTimeTrack, stopTimeTrack, isTracking } from '../../redux/actions/TimeTracks/timeTracks.actions';
// Redux 

// Components
import HeaderDashboard from './components/HeaderDashboard'
import Pagination from "../../components/Pagination";
import Search from "../../components/Search";
import ModalCreateProject from "../Project/components/ModalCreateProject";
import ModalQRCheckin from "../../components/Modal/ModalQRCheckin";
import ModalQRScanner from "../../components/Modal/ModalQRScanner";
// Components
import { globalStyles } from "../../asset/style/globalStyles"
import ItemProject from "../Project/components/ItemProject/ItemProject";
import HelloStiker from "./components/HelloStiker";
import { generateUUID } from "../../utils/variousHelpers";
import AppContainerClean from "../../components/AppContainerClean";
import UpdateBanner from "../../components/UpdateBanner";
import PingPongDebugPanel from "../../components/PingPongDebugPanel";
import GPS from "../GPSTracks/Gps";
import Colors from "../../constants/Colors";
import { isInsideAnyGeofenceLive, onLocationPermissionError, retryLocationPermission, openAppSettings } from "../../utils/locationModule";
import * as SharedTrackingState from '../../utils/sharedTrackingState';

import TodayTimeTracks from "./components/TodayTimeTracks";


const Dashboard = ({ navigation }) => {

    const state = useSelector(state => state)
    const favoriteProject = state.favoriteProject
    const dispatch = useDispatch();
    const projectState = state.project
    const muteUnMuteNotifications = state.muteUnMuteNotifications
    const userId = state.userDataRole?.userId || null;
    const gpsEnabled = state.userDataModule?.gpsEnabled
    const userData = state.userData;
    const firstName = userData?.firstName || null;
    const lastName = userData?.lastName || null;
    // Real tracking state from Redux — updated by geofence engine AND manual actions
    const isTrackingState = state.isTimeTracks?.isTracking || false;
    const trackingData = state.timeTracks?.data;
    const [dataResponse, setDataResponse] = useState([]);
    const [search, setSearch] = useState("");
    const [dataLength, setDataLength] = useState(false);
    const [requestApi, setRequestApi] = useState(true);

    const [pageIndex, setPageIndex] = useState(null);
    const [totalPages, setTotalPages] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setpagination] = useState(0);

    // Loading state while QR-triggered API call is in flight
    const [trackingLoading, setTrackingLoading] = useState(false);

    // QR Check-in Modal State
    const [showQRCheckinModal, setShowQRCheckinModal] = useState(false);
    
    // QR Scanner Modal State
    const [showQRScannerModal, setShowQRScannerModal] = useState(false);
    
    // Flag to track if we should show checkin after scanner closes
    const [shouldShowCheckin, setShouldShowCheckin] = useState(false);

    // Error mode: user scanned QR but is not at a company location
    const [isNotInLocation, setIsNotInLocation] = useState(false);

    // Location permission error state
    const [locationPermissionError, setLocationPermissionError] = useState(false);
    // Battery optimization reminder (Android only)
    const [showBatteryOptimization, setShowBatteryOptimization] = useState(false);

    // Ref so the async QR timer always reads the latest tracking state
    const isTrackingRef = useRef(isTrackingState);
    useEffect(() => { isTrackingRef.current = isTrackingState; }, [isTrackingState]);

    // Subscribe to location permission errors
    useEffect(() => {
        const unsubscribe = onLocationPermissionError((hasError) => {
            setLocationPermissionError(hasError);
        });
        return unsubscribe;
    }, []);

    // Check if should show battery optimization reminder (Android only)
    useEffect(() => {
        if (Platform.OS === 'android' && isTrackingState) {
            // Check if user has been prompted before
            AsyncStorage.getItem('@texxano:battery_dismissed').then(dismissed => {
                if (!dismissed) {
                    setShowBatteryOptimization(true);
                }
            });
        } else {
            setShowBatteryOptimization(false);
        }
    }, [isTrackingState]);

    // Ref to TodayTimeTracks for manual refresh
    const todayTracksRef = useRef(null);
    const [refreshing, setRefreshing] = useState(false);

    // Whether the QR checkin modal should show after the API call returns
    const pendingQRCheckinRef = useRef(false);
    // Captures whether we were checking OUT (true) or IN (false) at scan time
    const [qrCheckinIsCheckout, setQrCheckinIsCheckout] = useState(false);
    const loadingTimeoutRef = useRef(null);

    // Reset loading + show checkin modal once the API call completes
    useEffect(() => {
        setTrackingLoading(false);
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
        }
        if (pendingQRCheckinRef.current) {
            pendingQRCheckinRef.current = false;
            // Determine if this is checkout based on NEW tracking state (after API completed)
            const isNowTracking = trackingData?.isTracking || isTrackingState;
            setQrCheckinIsCheckout(!isNowTracking); // If now tracking → was START (checkin), if not tracking → was STOP (checkout)
            setShowQRCheckinModal(true);
        }
    }, [trackingData, isTrackingState]);

    useEffect(() => {
        if (!showQRScannerModal && shouldShowCheckin) {
            const timer = setTimeout(async () => {
                setShouldShowCheckin(false);

                // ============================================
                // 1. Verify user is inside a company location
                // ============================================
                const insideLocation = await isInsideAnyGeofenceLive();

                if (!insideLocation) {
                    // User is NOT in location - show error
                    // Determine what action user was trying to do based on current tracking state
                    const wasAttemptingStop = SharedTrackingState.isWorkActuallyStarted();
                    setQrCheckinIsCheckout(wasAttemptingStop); // If trying to stop, show "Good bye" error
                    setIsNotInLocation(true);
                    setShowQRCheckinModal(true);
                    return;
                }

                // User IS in location - proceed
                setIsNotInLocation(false);
                
                // ============================================
                // 2. Check tracking state (LOCAL FIRST for speed)
                // ============================================
                const localStateIsTracking = SharedTrackingState.isWorkActuallyStarted();
                
                if (localStateIsTracking) {
                    // ─────────────────────────────────────────
                    // STOP: Already tracking → Call STOP API immediately
                    // No server verification needed - user wants to stop NOW
                    // ─────────────────────────────────────────
                    console.log('🛑 QR STOP - Immediate (local state confirms tracking)');
                    setQrCheckinIsCheckout(true);
                    setTrackingLoading(true);
                    pendingQRCheckinRef.current = true;
                    
                    // Safety timeout
                    loadingTimeoutRef.current = setTimeout(() => {
                        console.log('⚠️ STOP API timeout - clearing loading state');
                        setTrackingLoading(false);
                        pendingQRCheckinRef.current = false;
                    }, 10000);
                    
                    dispatch(stopTimeTrack());
                    
                } else {
                    // ─────────────────────────────────────────
                    // START: Not tracking locally
                    // Make ONE server call to check and get details
                    // ─────────────────────────────────────────
                    try {
                        const response = await http.get("/timetracker/tracks?page=1&PageSize=5");
                        const tracks = response?.data?.list || response?.list || [];
                        const activeTrack = tracks.find(t => t.isTracking === true);
                        
                        if (activeTrack) {
                            // Server has active track - sync local state (no START API call)
                            console.log('✅ QR: Already tracking on server - syncing local state');
                            
                            SharedTrackingState.syncFromAPI(
                                activeTrack.id,
                                activeTrack.start,
                                activeTrack.companyLocationId || null
                            );
                            dispatch(isTracking(true));
                            
                            // Show success immediately
                            setQrCheckinIsCheckout(false);
                            setShowQRCheckinModal(true);
                            
                        } else {
                            // Not tracking - call START API
                            console.log('🚀 QR START - Calling API');
                            setQrCheckinIsCheckout(false);
                            setTrackingLoading(true);
                            pendingQRCheckinRef.current = true;
                            
                            loadingTimeoutRef.current = setTimeout(() => {
                                console.log('⚠️ START API timeout - clearing loading state');
                                setTrackingLoading(false);
                                pendingQRCheckinRef.current = false;
                            }, 10000);
                            
                            dispatch(startTimeTrack());
                        }
                        
                    } catch (e) {
                        // Network error - assume not tracking and call START
                        console.log('⚠️ QR START: Server check failed, calling START API');
                        setQrCheckinIsCheckout(false);
                        setTrackingLoading(true);
                        pendingQRCheckinRef.current = true;
                        
                        loadingTimeoutRef.current = setTimeout(() => {
                            console.log('⚠️ START API timeout - clearing loading state');
                            setTrackingLoading(false);
                            pendingQRCheckinRef.current = false;
                        }, 10000);
                        
                        dispatch(startTimeTrack());
                    }
                }
            }, 300); // Reduced from 600ms to 300ms

            return () => clearTimeout(timer);
        }
    }, [showQRScannerModal, shouldShowCheckin]);
    
    // Handle closing QR Check-in Modal
    const handleCloseQRCheckinModal = () => {
        setShowQRCheckinModal(false);
        setShouldShowCheckin(false);
        setIsNotInLocation(false);
        // Clear navigation params if they exist
        if (navigation.state?.params?.showQRCheckinModal) {
            navigation.setParams({ showQRCheckinModal: false });
        }
    };

    // Handle opening QR Scanner
    const handleOpenQRScanner = () => {
        setShowQRScannerModal(true);
    };

    // Handle QR code scanned from scanner (UI toggle only - no API calls)
    const handleQRCodeScanned = (data) => {
        setShouldShowCheckin(true);
        setShowQRScannerModal(false);
    };

    // Handle closing QR Scanner
    const handleCloseQRScanner = () => {
        setShouldShowCheckin(false);
        setShowQRScannerModal(false);
    };

    // Clear all AsyncStorage and cache
    const handleClearCache = async () => {
        Alert.alert(
            'Clear All Data?',
            'This will clear ALL stored data including active tracks, geofences, and settings. The app will restart.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const keys = await AsyncStorage.getAllKeys();
                            await AsyncStorage.clear();
                            alert('Cache cleared! Please close and reopen the app.');
                        } catch (error) {
                            console.error('❌ Error clearing cache:', error);
                            alert('Failed to clear cache: ' + error.message);
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        if (projectState || muteUnMuteNotifications) {
            http.get(`/projects?page=${currentPage}&search=${search}`)
                .then((data) => {
                    if (data && data.list) {
                        setPageIndex(data.pageIndex)
                        setTotalPages(data.totalPages)
                        setRequestApi(false)
                        setDataResponse(data.list);
                        setDataLength(data.list.length === 0);
                    } else {
                        console.error('Dashboard: Invalid API response format:', data);
                        setRequestApi(false)
                        setDataResponse([]);
                        setDataLength(true);
                    }
                })
                .catch((error) => {
                    console.error('Dashboard: API call failed:', error);
                    setRequestApi(false)
                    setDataResponse([]);
                    setDataLength(true);
                })
        }

    }, [ projectState, favoriteProject, currentPage, search, muteUnMuteNotifications ]);


    useEffect(() => {
        if (dataLength && currentPage > 1) {
            setCurrentPage(null)
        }
    }, [dataLength, currentPage]);



    return (
        <AppContainerClean location={'Dashboard'}  pagination={pagination} >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

                {/* {gpsEnabled ? (<><GPS /></>) : (<></>)} */}
                        <HelloStiker />
            
            {/* Location Permission Error Banner */}
            {locationPermissionError && (
                <TouchableOpacity 
                    style={styles.locationErrorBanner}
                    onPress={async () => {
                        const success = await retryLocationPermission();
                        if (!success) {
                            Alert.alert(
                                'Location Permission Required',
                                'Please enable location permissions in your device settings to use time tracking.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Open Settings', onPress: () => openAppSettings() }
                                ]
                            );
                        }
                    }}
                >
                    <Ionicons name="warning" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.locationErrorText}>
                        <FormattedMessage id="dashboard.locationPermissionError" defaultMessage="Location permission required" />
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            )}

            {/* Battery Optimization Banner (Android only) */}
            {showBatteryOptimization && (
                <TouchableOpacity 
                    style={styles.batteryOptimizationBanner}
                    onPress={async () => {
                        try {
                            // Open battery optimization settings directly
                            await IntentLauncher.startActivityAsync(
                                IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
                                { data: 'package:texxano.v1.android' }
                            );
                        } catch (error) {
                            // Fallback to general settings if specific intent fails
                            Alert.alert(
                                '⚡ Enable Unrestricted Battery',
                                'For reliable background tracking, disable battery optimization:\n\n' +
                                '1. Find "Battery" in the settings\n' +
                                '2. Select "Unrestricted" or "Not optimized"\n\n' +
                                'This prevents tracking from stopping when your screen is locked.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Open Settings', onPress: () => Linking.openSettings() }
                                ]
                            );
                        }
                    }}
                    onLongPress={() => {
                        // Long press to dismiss permanently
                        Alert.alert(
                            'Hide This Reminder?',
                            'You can always enable unrestricted battery mode in your device settings.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { 
                                    text: 'Hide', 
                                    style: 'destructive',
                                    onPress: async () => {
                                        await AsyncStorage.setItem('@texxano:battery_dismissed', 'true');
                                        setShowBatteryOptimization(false);
                                    }
                                }
                            ]
                        );
                    }}
                >
                    <Ionicons name="battery-charging" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.batteryOptimizationText}>
                        Tap to enable unrestricted battery mode (long press to hide)
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            )}
            
            {/* Refresh button for time tracker and scan button status */}
            <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => {
                    setRefreshing(true);
                    todayTracksRef.current?.refresh();
                    setTimeout(() => setRefreshing(false), 500);
                }}
                disabled={refreshing}
            >
                <Ionicons 
                    name="reload-outline" 
                    size={24} 
                    color={refreshing ? Colors.gray_300 : Colors.blue_200} 
                />
                <Text style={styles.refreshButtonText}>
                    <FormattedMessage id="dashboard.refresh" defaultMessage="Refresh Status" />
                </Text>
            </TouchableOpacity>
            
            {/* QR Scan button — single entry point for start/stop */}
            <TouchableOpacity
                style={[
                    styles.qrButton,
                    { backgroundColor: isTrackingState ? Colors.error_100 : Colors.success_100 },
                    trackingLoading && styles.qrButtonLoading,
                ]}
                onPress={handleOpenQRScanner}
                disabled={trackingLoading}
            >
                {trackingLoading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                    <Ionicons name="qr-code-outline" size={28} color={Colors.white} />
                )}
                <Text style={styles.qrButtonText}>
                    <FormattedMessage id={isTrackingState ? "dashboard.scan.stopWork" : "dashboard.scan.startWork"} />
                </Text>
            </TouchableOpacity>
            
            {/* Clear Cache Button - DEV MODE */}
            {/*}
            <TouchableOpacity 
                style={[styles.scanButton, { backgroundColor: '#5c96d3', marginTop: 10 }]}
                onPress={handleClearCache}
            >
                <Ionicons name="trash-outline" size={24} color={Colors.white} />
                <Text style={styles.scanButtonText}>Clear Cache & Storage</Text>
            </TouchableOpacity>
            */}
            {/* Geofence Test Button - TEMPORARY */}
            {/* <TouchableOpacity
            
            {/* Geofence Test Button - TEMPORARY */}
              
            {/* <TouchableOpacity 
                style={styles.geofenceTestButton}
                onPress={() => navigation.navigate('GeofenceTest')}
            >
                <Text style={styles.geofenceTestButtonText}>🗺️ Geofence Test</Text>
            </TouchableOpacity> */}
            
        
            <TodayTimeTracks ref={todayTracksRef} />
            <UpdateBanner />
            
            {/* Ping-Pong Debug Panel - Shows notification logs when app is killed */}
            <PingPongDebugPanel />
            </ScrollView>
            {/* <View style={globalStyles.box}>
                <FlatList
                    data={dataResponse}
                    renderItem={({ item }) => {
                        return (
                            <View  >
                                <ItemProject data={item} navigateFrom={"Dashboard"} />
                            </View>
                        )
                    }}
                    keyExtractor={() => generateUUID(43)}
                />
                {requestApi ? (<ActivityIndicator size="large" color="#6c757d" />) : (<></>)}
                {dataLength ? (<Text style={globalStyles.dataLength}><FormattedMessage id="projects.list.noItems" /> </Text>) : (<></>)}
            </View>
            {!dataLength ? (
                <Pagination
                    onPageChange={page => setCurrentPage(page)}
                    currentPage={pageIndex}
                    total={totalPages}
                    checkTokenExpPagination={e => setpagination(e)}
                />
            ) : (<></>)} */}
            
            {/* QR Scanner Modal */}
            <ModalQRScanner 
                visible={showQRScannerModal}
                onClose={handleCloseQRScanner}
                onQRScanned={handleQRCodeScanned}
            />
            
            {/* QR Check-in Modal */}
            <ModalQRCheckin 
                showModal={showQRCheckinModal}
                onConfirm={handleCloseQRCheckinModal}
                isCheckout={qrCheckinIsCheckout}
                firstName={firstName}
                lastName={lastName}
                errorMode={isNotInLocation}
            />
            
            {/* Heartbeat Debugger - Shows background task logs */}
            {/* <HeartbeatDebugger /> */}

        </AppContainerClean>
    )
}

const styles = StyleSheet.create({
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 8,
        gap: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.blue_200,
    },
    refreshButtonText: {
        color: Colors.blue_200,
        fontSize: 16,
        fontWeight: '600',
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 12,
        gap: 10,
        padding: 16,
        borderRadius: 12,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    qrButtonLoading: {
        opacity: 0.7,
    },
    qrButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    geofenceTestButton: {
        backgroundColor: Colors.warning_500,
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 8,
        alignItems: 'center',
    },
    geofenceTestButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    locationErrorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dc3545',
        marginHorizontal: 16,
        marginBottom: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    locationErrorText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    batteryOptimizationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff9800',
        marginHorizontal: 16,
        marginBottom: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    batteryOptimizationText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
});

export default Dashboard
