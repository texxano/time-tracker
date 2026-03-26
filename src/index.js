import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NativeBaseProvider } from "native-base"
import { Linking } from 'react-native';
import theme from "./asset/ThemeNativeBase/index";
import { NavigatorPublic, NavigatorPrivate, NavigationService } from "./navigator";

const Index = () => {
  const state = useSelector(state => state)
  const authState = state.auth.loggedIn
  const [initialRoute, setInitialRoute] = React.useState(null);
  const [isCheckingDeepLink, setIsCheckingDeepLink] = React.useState(true);

  // Check for initial deep link before rendering navigator
  useEffect(() => {
    const checkInitialDeepLink = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url && (url.includes('texxano://chat/') || url.includes('texxano://ChatMessages/'))) {
          setInitialRoute('ChatMessages');
        } else if (url && url.includes('texxano://Report')) {
          setInitialRoute('Report');
        } else if (url && url.includes('texxano://Project/')) {
          setInitialRoute('Project');
        } else if (url && url.includes('texxano://Calendar')) {
          setInitialRoute('Calendar');
        } else if (url && url.includes('texxano://checkin')) {
          setInitialRoute('Dashboard');
        }
      } catch (error) {
        // Silent error handling
      } finally {
        setIsCheckingDeepLink(false);
      }
    };
    
    checkInitialDeepLink();
  }, []);

  // Listen for deep link events and update initial route if needed
  useEffect(() => {
    const handleDeepLinkEvent = (event) => {
      const url = event.url || event;
      if (url && (url.includes('texxano://chat/') || url.includes('texxano://ChatMessages/'))) {
        setInitialRoute('ChatMessages');
        
        // Also try to navigate immediately if navigator is ready
        setTimeout(() => {
          if (NavigationService.isReady()) {
            const chatId = url.split('/').pop();
            NavigationService.navigate('ChatMessages', { 
              chat: { id: chatId } 
            });
          }
        }, 100);
      } else if (url && url.includes('texxano://Report')) {
        // Handle Report deep links
        const parts = url.split('/');
        const macroCategoryReport = parts.length > 3 ? parseInt(parts[parts.length - 1], 10) : 20;
        
        setTimeout(() => {
          if (NavigationService.isReady()) {
            NavigationService.navigate('Report', {
              location: 'Dashboard',
              macroCategoryReport: macroCategoryReport
            });
          }
        }, 100);
      } else if (url && url.includes('texxano://Project/')) {
        // Handle Project deep links
        const parts = url.split('/');
        const projectId = parts.length > 3 ? parts[parts.length - 1] : null;
        
        setTimeout(() => {
          if (NavigationService.isReady() && projectId) {
            NavigationService.navigate('Project', {
              projectId: projectId,
              navigateFrom: 'Notifications',
            });
          }
        }, 100);
      } else if (url && url.includes('texxano://Calendar')) {
        // Handle Calendar deep links
        const parts = url.split('/');
        const eventId = parts.length > 3 ? parts[parts.length - 1] : null;
        
        setTimeout(() => {
          if (NavigationService.isReady()) {
            if (eventId) {
              // Navigate to specific event view
              NavigationService.navigate('Calendar', {
                locationActive: '3',
                id: eventId,
                update: false,
                navigateFrom: 'Notifications',
              });
            } else {
              // Navigate to Calendar main view
              NavigationService.navigate('Calendar', {
                navigateFrom: 'Notifications',
              });
            }
          }
        }, 100);
      } else if (url && url.includes('texxano://checkin')) {
        // Handle QR Check-in deep links
        setTimeout(() => {
          if (NavigationService.isReady()) {
            NavigationService.navigate('Dashboard', {
              showQRCheckinModal: true,
              navigateFrom: 'QRCheckin',
            });
          }
        }, 100);
      }
    };

    // Listen for deep link events
    const subscription = Linking.addEventListener('url', handleDeepLinkEvent);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (url) => {
      if (url && (url.includes('texxano://chat/') || url.includes('texxano://ChatMessages/'))) {
        const chatId = url.split('/').pop();
        
        // Store pending navigation to be processed when navigator is ready
        NavigationService.setPendingNavigation('ChatMessages', { chatId });
        
        // Wait for navigator to be ready
        const navigateToChat = async () => {
          if (NavigationService.isReady()) {
            try {
              // Fetch complete chat data before navigating
              const { doc, getDoc } = require("firebase/firestore");
              const { db } = require("./utils/firebase");
              
              // Get rootId from Redux store
              const { store } = require("./redux/store/store");
              const state = store.getState();
              const rootId = state.userDataRole?.rootId;
              
              if (rootId) {
                const chatRef = doc(db, "companies", rootId, "chats", chatId);
                const chatSnap = await getDoc(chatRef);
                
                if (chatSnap.exists()) {
                  const completeChatData = { id: chatId, ...chatSnap.data() };
                  NavigationService.navigate('ChatMessages', { 
                    chat: completeChatData 
                  });
                } else {
                  NavigationService.navigate('ChatMessages', { 
                    chat: { id: chatId } 
                  });
                }
              } else {
                NavigationService.navigate('ChatMessages', { 
                  chat: { id: chatId } 
                });
              }
            } catch (error) {
              // Fallback to minimal chat data
              NavigationService.navigate('ChatMessages', { 
                chat: { id: chatId } 
              });
            }
          } else {
            // Retry after a short delay
            setTimeout(navigateToChat, 100);
          }
        };
        
        navigateToChat();
      } else if (url && url.includes('texxano://Report')) {
        // Handle Report deep links with macroCategoryReport parameter
        // Format: texxano://Report/20 or texxano://Report/10
        const parts = url.split('/');
        const macroCategoryReport = parts.length > 3 ? parseInt(parts[parts.length - 1], 10) : 20; // Default to 20 if not specified
        
        // Store pending navigation to be processed when navigator is ready
        NavigationService.setPendingNavigation('Report', { 
          location: 'Dashboard',
          macroCategoryReport: macroCategoryReport 
        });
        
        // Wait for navigator to be ready
        const navigateToReport = () => {
          if (NavigationService.isReady()) {
            NavigationService.navigate('Report', {
              location: 'Dashboard',
              macroCategoryReport: macroCategoryReport
            });
          } else {
            // Retry after a short delay
            setTimeout(navigateToReport, 100);
          }
        };
        
        navigateToReport();
      } else if (url && url.includes('texxano://Project/')) {
        // Handle Project deep links with projectId parameter
        // Format: texxano://Project/{projectId}
        const parts = url.split('/');
        const projectId = parts.length > 3 ? parts[parts.length - 1] : null;
        
        if (projectId) {
          // Store pending navigation to be processed when navigator is ready
          NavigationService.setPendingNavigation('Project', { 
            projectId: projectId,
            navigateFrom: 'Notifications'
          });
          
          // Wait for navigator to be ready
          const navigateToProject = () => {
            if (NavigationService.isReady()) {
              NavigationService.navigate('Project', {
                projectId: projectId,
                navigateFrom: 'Notifications',
              });
            } else {
              // Retry after a short delay
              setTimeout(navigateToProject, 100);
            }
          };
          
          navigateToProject();
        }
      } else if (url && url.includes('texxano://Calendar')) {
        // Handle Calendar deep links with optional eventId parameter
        // Format: texxano://Calendar/{eventId} or texxano://Calendar
        const parts = url.split('/');
        const eventId = parts.length > 3 ? parts[parts.length - 1] : null;
        
        // Store pending navigation to be processed when navigator is ready
        NavigationService.setPendingNavigation('Calendar', { 
          ...(eventId ? { locationActive: '3', id: eventId, update: false } : {}),
          navigateFrom: 'Notifications'
        });
        
        // Wait for navigator to be ready
        const navigateToCalendar = () => {
          if (NavigationService.isReady()) {
            if (eventId) {
              // Navigate to specific event view
              NavigationService.navigate('Calendar', {
                locationActive: '3',
                id: eventId,
                update: false,
                navigateFrom: 'Notifications',
              });
            } else {
              // Navigate to Calendar main view
              NavigationService.navigate('Calendar', {
                navigateFrom: 'Notifications',
              });
            }
          } else {
            // Retry after a short delay
            setTimeout(navigateToCalendar, 100);
          }
        };
        
        navigateToCalendar();
      } else if (url && url.includes('texxano://checkin')) {
        // Handle QR Check-in deep links
        // Format: texxano://checkin
        
        // Store pending navigation to be processed when navigator is ready
        NavigationService.setPendingNavigation('Dashboard', { 
          showQRCheckinModal: true,
          navigateFrom: 'QRCheckin'
        });
        
        // Wait for navigator to be ready
        const navigateToCheckin = () => {
          if (NavigationService.isReady()) {
            NavigationService.navigate('Dashboard', {
              showQRCheckinModal: true,
              navigateFrom: 'QRCheckin',
            });
          } else {
            // Retry after a short delay
            setTimeout(navigateToCheckin, 100);
          }
        };
        
        navigateToCheckin();
      }
    };

    // Handle initial URL (app opened from deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URL changes (app already running)
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Don't render navigator until we've checked for deep links
  if (isCheckingDeepLink) {
    return null; // or a loading screen
  }

  return (
    <NativeBaseProvider theme={theme}>
      {authState === false ? (
        <NavigatorPublic hideNavBar={true}
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }} />) : (
        <NavigatorPrivate 
          hideNavBar={true}
          initialRouteName={initialRoute}
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }} />
      )}
    </NativeBaseProvider>
  )
}

export default Index
