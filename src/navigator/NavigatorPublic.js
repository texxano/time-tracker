import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import Login from "../screens/Authentications/Login";
import ForgotPassword from "../screens/Authentications/ForgotPassword"
import Overview from "../screens/MoreInfo/Overview"
import Presentation from "../screens/MoreInfo/Presentation"
import Privacy from "../screens/MoreInfo/Privacy"

const NavigatorPublic = createStackNavigator({
  Login: Login,
  ForgotPassword: ForgotPassword,
  Overview: Overview,
  Presentation: Presentation,
  Privacy: Privacy,
}, {
  defaultNavigationOptions: {
    headerShown: null,
    animationEnabled: false,
  },
}
);

export default createAppContainer(NavigatorPublic);
