import React, { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { timeTracksServices } from '../../../services/TimeTracks/timeTracks.services';
import { isTracking as setIsTracking } from '../../../redux/actions/TimeTracks/timeTracks.actions';
import { dateFormat } from '../../../utils/dateFormat';
import FormatDateTime from '../../../components/FormatDateTime';
import TotalWorkTimeTrack from '../../TimeTracks/components/TotalWorkTimeTrack';
import Colors from '../../../constants/Colors';
import * as SharedTrackingState from '../../../utils/sharedTrackingState';
import { syncGeofenceStateFromAPI, syncGeofenceStoppedFromAPI } from '../../../utils/locationModule';

const TodayTimeTracks = forwardRef(({ onActiveTrackChange }, ref) => {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.userDataRole?.userId);
    const trackingState = useSelector((state) => state.timeTracks?.data);

    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalTodaySeconds, setTotalTodaySeconds] = useState(0);

    const fetchTodayTracks = useCallback(() => {
        if (!userId) return;

        const now = new Date();
        const from = dateFormat(now);
        const to = dateFormat(now);

        setLoading(true);
        timeTracksServices
            .getTracksByUserId(userId, from, to)
            .then((data) => {
                if (data && data.list) {
                    // Sort tracks: active (In Progress) first, then by start time descending
                    const sortedTracks = [...data.list].sort((a, b) => {
                        // Active tracks (no stop) go first
                        const aActive = !a.stop || a.isTracking;
                        const bActive = !b.stop || b.isTracking;
                        if (aActive && !bActive) return -1;
                        if (!aActive && bActive) return 1;
                        // Then sort by start time descending (newest first)
                        return new Date(b.start).getTime() - new Date(a.start).getTime();
                    });
                    
                    setTracks(sortedTracks);
                    // Calculate total seconds for completed tracks
                    // Use Math.max to prevent negative durations from corrupted entries (stop < start)
                    const total = data.list.reduce((acc, t) => {
                        if (t.stop) {
                            const duration = new Date(t.stop).getTime() - new Date(t.start).getTime();
                            return acc + Math.max(0, duration);
                        }
                        return acc;
                    }, 0);
                    setTotalTodaySeconds(Math.floor(total / 1000));

                    // Sync Redux isTracking state with real API data
                    const activeTrack = data.list.find(t => !t.stop || t.isTracking);
                    dispatch(setIsTracking(!!activeTrack));
                    
                    // Sync SharedTrackingState with API data (critical for cooldown and geofence logic)
                    if (activeTrack) {
                        // Has active track - sync SharedTrackingState
                        SharedTrackingState.syncFromAPI(
                            activeTrack.id,
                            activeTrack.start,
                            activeTrack.companyLocationId || null
                        );
                        // Also sync geofence state
                        syncGeofenceStateFromAPI(
                            activeTrack.id,
                            activeTrack.start,
                            activeTrack.companyLocationId || null
                        );
                    } else {
                        // No active track - clear SharedTrackingState
                        SharedTrackingState.syncStoppedFromAPI();
                        syncGeofenceStoppedFromAPI();
                    }

                    // Notify parent with the active track (for stop modal start time)
                    if (onActiveTrackChange) {
                        onActiveTrackChange(activeTrack || null);
                    }
                }
            })
            .catch((err) => {
                console.error('❌ [TodayTimeTracks] Fetch error:', err?.message || err);
                console.error('❌ [TodayTimeTracks] Full error:', JSON.stringify(err, null, 2));
            })
            .finally(() => setLoading(false));
    }, [userId]);

    // Expose refresh function to parent via ref
    useImperativeHandle(ref, () => ({
        refresh: fetchTodayTracks
    }));

    useEffect(() => {
        // Add 1-second delay when trackingState changes to allow backend to commit the new track
        // Without this, the API fetch races with the backend INSERT and returns empty list
        const timer = setTimeout(() => {
            fetchTodayTracks();
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [fetchTodayTracks, trackingState]);

    const formatTotalTime = (totalSec) => {
        // Ensure non-negative value for display
        const safeSec = Math.max(0, totalSec);
        const h = Math.floor(safeSec / 3600);
        const m = Math.floor((safeSec % 3600) / 60);
        return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
    };

    const renderItem = ({ item }) => (
        <View style={[styles.trackItem, item.isTracking && styles.trackItemActive]}>
            <View style={styles.trackRow}>
                <View style={styles.timeContainer}>
                    <Ionicons
                        name={item.isTracking ? 'radio-button-on' : 'time-outline'}
                        size={14}
                        color={item.isTracking ? Colors.success_100 : Colors.gray_400}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={styles.timeText}>
                        <FormatDateTime datevalue={item.start} type={0} />
                        {' - '}
                        {item.isTracking ? (
                            <Text style={styles.activeText}>
                                <FormattedMessage id="projects.form.status.progress" />
                            </Text>
                        ) : (
                            <FormatDateTime datevalue={item.stop} type={0} />
                        )}
                    </Text>
                </View>
                <Text style={[styles.duration, item.isTracking && styles.durationActive]}>
                    <TotalWorkTimeTrack startDate={item.start} stopDate={item.stop || undefined} />
                </Text>
            </View>
            {item.projectTitle ? (
                <Text style={styles.projectTitle} numberOfLines={1}>
                    <Ionicons name="briefcase-outline" size={12} color={Colors.gray_400} />{' '}
                    {item.projectTitle}
                </Text>
            ) : null}
            {item.description ? (
                <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
            ) : null}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color={Colors.blue_100} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="today-outline" size={18} color={Colors.blue_200} />
                    <Text style={styles.title}>
                        <FormattedMessage id="dashboard.todayTracks.title" defaultMessage="Today's Time Tracks" />
                    </Text>
                </View>
                {tracks.length > 0 && (
                    <Text style={styles.totalTime}>{formatTotalTime(totalTodaySeconds)}</Text>
                )}
            </View>

            {tracks.length === 0 ? (
                <Text style={styles.emptyText}>
                    <FormattedMessage id="time.list.noItems" defaultMessage="No time tracks yet" />
                </Text>
            ) : (
                <FlatList
                    data={tracks}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    scrollEnabled={false}
                />
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.gray_70,
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.gray_500,
    },
    totalTime: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.blue_200,
    },
    trackItem: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: Colors.gray_200,
    },
    trackItemActive: {
        borderLeftColor: Colors.success_100,
    },
    trackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timeText: {
        fontSize: 14,
        color: Colors.gray_500,
    },
    activeText: {
        color: Colors.success_100,
        fontWeight: '600',
    },
    duration: {
        fontSize: 13,
        color: Colors.gray_400,
        fontWeight: '500',
    },
    durationActive: {
        color: Colors.success_100,
        fontWeight: '700',
    },
    projectTitle: {
        fontSize: 12,
        color: Colors.gray_400,
        marginTop: 4,
    },
    description: {
        fontSize: 12,
        color: Colors.gray_300,
        marginTop: 2,
        fontStyle: 'italic',
    },
    emptyText: {
        fontSize: 13,
        color: Colors.gray_400,
        textAlign: 'center',
        paddingVertical: 8,
    },
});

export default TodayTimeTracks;
