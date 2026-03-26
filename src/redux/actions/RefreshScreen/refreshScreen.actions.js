import { userAuthrefreshTypes } from '../../type/RefreshScreen/refreshScreen.types';

export const refreshScreen = refresh => ({type: userAuthrefreshTypes.REFRESH_SCREEN_SUCCESS, refresh: refresh});
