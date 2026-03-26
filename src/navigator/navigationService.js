import { NavigationActions } from "react-navigation";

let navigator;
let pendingNavigation = null;

const setTopLevelNavigator = navigatorRef => {
  navigator = navigatorRef;
  
  // Process pending navigation if navigator is now ready
  if (pendingNavigation && isReady()) {
    navigate(pendingNavigation.routeName, pendingNavigation.params);
    pendingNavigation = null;
  }
};

const navigate = (routeName, params) => {
  if (isReady()) {
    navigator.dispatch(
      NavigationActions.navigate({
        routeName,
        params
      })
    );
  } else {
    // Store pending navigation if navigator is not ready
    pendingNavigation = { routeName, params };
  }
};

const setPendingNavigation = (routeName, params) => {
  pendingNavigation = { routeName, params };
};

const isReady = () => {
  return navigator && navigator.state && navigator.state.nav;
};

export default {
  navigate,
  setTopLevelNavigator,
  isReady,
  setPendingNavigation
};
