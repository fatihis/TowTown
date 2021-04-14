import * as React from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Login from './Login';
import CallHelp from './CallHelp';
import SignUp from './SignUp';
import TowOperation from './TowOperation';

const Stack = createStackNavigator();

function Router() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" headerMode="none">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="CallHelp" component={CallHelp} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="TowOperation" component={TowOperation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Router;
