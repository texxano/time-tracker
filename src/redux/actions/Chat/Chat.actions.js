import { chatTypes } from "../../type/Chat/Chat.types";
import { chatService } from "../../../services/Chat/Chat.services";
import { doc, updateDoc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../utils/firebase";

export function AddProfileImage(payload) {
  return (dispatch, getState) => {
    dispatch(request(payload.userId));
   
    // Get user email from Redux state
    const state = getState();
    const userEmail = state.userData?.email;
    const rootId = state.userDataRole?.rootId;
    
    
    // Validate required data
    if (!userEmail || !rootId || !payload.userId) {
      dispatch(failure({ 
        message: "Missing required data: email, rootId, or userId",
        userMessage: "Unable to update profile image. Please try again."
      }));
      return;
    }
  
    chatService
      .AddProfileImage(payload)
      .then(async (data) => {
        // Check if data exists first
        if (!data) {
          dispatch(failure({ message: "No response from server" }));
          return;
        }
        
        // Then check if it's an error response (status should be falsy for success)
        if (data.status && data.status !== 200 && data.status !== 201) {
          dispatch(failure(data));
        } else {
          // Update Firestore with the new avatar URL
          try {
            // 1. Check if user document exists, create if it doesn't
            const userRef = doc(db, "companies", rootId, "users", payload.userId);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
              // User document doesn't exist, create it
              // Try to get user data from multiple possible Redux state locations
              const firstName = state.userData?.firstName || 
                               state.userData?.first_name || 
                               state.user?.firstName || 
                               state.user?.first_name || 
                               "Unknown";
              const lastName = state.userData?.lastName || 
                              state.userData?.last_name || 
                              state.user?.lastName || 
                              state.user?.last_name || 
                              "User";
              
              const userData = {
                id: payload.userId,
                firstName,
                lastName,
                email: userEmail,
                avatar: data.logoUrl,
                isActive: true,
                lastSeen: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              await setDoc(userRef, userData);

            } else {
              // User document exists, check if it has required fields and update
              const existingUserData = userSnap.data();
              const updateData = {
                avatar: data.logoUrl,
                updatedAt: new Date().toISOString(),
              };
              
                             // Check if required fields are missing and add them
               if (!existingUserData.id) {
                 updateData.id = payload.userId;
               }
               if (!existingUserData.firstName && !existingUserData.first_name) {
                 updateData.firstName = state.userData?.firstName || 
                                       state.userData?.first_name || 
                                       state.user?.firstName || 
                                       state.user?.first_name || 
                                       "Unknown";
               }
               if (!existingUserData.lastName && !existingUserData.last_name) {
                 updateData.lastName = state.userData?.lastName || 
                                      state.userData?.last_name || 
                                      state.user?.lastName || 
                                      state.user?.last_name || 
                                      "User";
               }
               if (!existingUserData.email) {
                 updateData.email = userEmail;
               }
               if (!existingUserData.isActive) {
                 updateData.isActive = true;
               }
               if (!existingUserData.lastSeen) {
                 updateData.lastSeen = new Date().toISOString();
               }
               if (!existingUserData.createdAt) {
                 updateData.createdAt = new Date().toISOString();
               }
              
              await updateDoc(userRef, updateData);
            
            }
           // User avatars are fetched dynamically from the users collection

            dispatch(success(data));
          } catch (firestoreError) {
            console.error('AddProfileImage: Firestore error:', firestoreError);
            // Still dispatch success since the backend API worked, but log the error
            dispatch(success(data));
          }
        }
      })
      .catch((error) => {

        
        // Check if it's a file size error (HTTP 500 with specific message)
        if (error.message && error.message.includes("HTTP 500") && error.message.includes("exceeds the allowed size")) {
          const sizeError = {
            ...error,
            userMessage: "The uploaded image is too large. Please select an image smaller than 200 KB."
          };
          dispatch(failure(sizeError));
        } else {
          dispatch(failure(error));
        }
      });
  };

  function request(data) {
    return { type: chatTypes.ADD_PROFILE_IMAGE_REQUEST, data };
  }
  function success(data) {
    return { type: chatTypes.ADD_PROFILE_IMAGE_SUCCESS, data };
  }
  function failure(data) {
    return { type: chatTypes.ADD_PROFILE_IMAGE_FAILURE, data };
  }

}

export function clearChatState() {
  return { type: chatTypes.CLEAR_CHAT_STATE };
}

export function setUnreadCount(count) {
  return { type: chatTypes.SET_UNREAD_COUNT, payload: count };
}

export function updateUnreadCount(chatId, count) {
  return { type: chatTypes.UPDATE_UNREAD_COUNT, payload: { chatId, count } };
}

export function resetUnreadCount() {
  return { type: chatTypes.RESET_UNREAD_COUNT };
}

export function getUploadUrl(payload) {
  return (dispatch, getState) => {
    dispatch(request(payload));
    chatService.getUploadUrl(payload).then(data => {
      dispatch(success(data));
    }).catch(error => {
      dispatch(failure(error));
    });
  }

  function request(data) {
    return { type: chatTypes.UPLOAD_CHAT_FILE_REQUEST, data };
  }
  function success(data) {
    return { type: chatTypes.UPLOAD_CHAT_FILE_SUCCESS, data };
  }
  function failure(data) {
    return { type: chatTypes.UPLOAD_CHAT_FILE_FAILURE, data };
  }
}


