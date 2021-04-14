/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import CallHelp from './CallHelp';
import Login from './Login';
import SignUp from './SignUp';
import Router from './Router';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => Router);
