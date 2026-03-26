import { chatTypes } from "../../type/Chat/Chat.types";

export function chatReducers(state = { unreadCount: 0, chatUnreadCounts: {} }, action) {
  switch (action.type) {
    case chatTypes.ADD_PROFILE_IMAGE_REQUEST:
      return {
        ...state,
        request: "request",
      };
    case chatTypes.ADD_PROFILE_IMAGE_SUCCESS:
      return {
        ...state,
        data: action.data,
      };
    case chatTypes.ADD_PROFILE_IMAGE_FAILURE:
      return {
        ...state,
        data: action.data,
      };
    case chatTypes.CLEAR_CHAT_STATE:
      return state;
    case chatTypes.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload,
      };
    case chatTypes.UPDATE_UNREAD_COUNT:
      const { chatId, count } = action.payload;
      const newChatUnreadCounts = {
        ...state.chatUnreadCounts,
        [chatId]: count,
      };
      const totalUnreadCount = Object.values(newChatUnreadCounts).reduce((sum, count) => sum + count, 0);
      return {
        ...state,
        chatUnreadCounts: newChatUnreadCounts,
        unreadCount: totalUnreadCount,
      };
    case chatTypes.RESET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: 0,
        chatUnreadCounts: {},
      };
    default:
      return state;
  }
}
