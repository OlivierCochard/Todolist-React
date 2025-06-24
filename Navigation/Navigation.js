import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TokenContext } from '../Context/Context';



import SignInScreen from '../Screen/SignInScreen';
import SignUpScreen from '../Screen/SignUpScreen';
import HomeScreen from '../Screen/HomeScreen';
import TodoListsScreen from '../Screen/TodoListsScreen';
import SignOutScreen from '../Screen/SignOutScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';



const Tab = createBottomTabNavigator();

export default function Navigation () {
  const [token, setToken] = useContext(TokenContext);
  return (
    <NavigationContainer theme={monTheme}>
      {token == null ? (
        <Tab.Navigator>
          <Tab.Screen name='SignIn' component={SignInScreen} />
          <Tab.Screen name='SignUp' component={SignUpScreen} />
        </Tab.Navigator>
      ) : (
        <Tab.Navigator>
          <Tab.Screen name='Home' component={HomeScreen} />
          <Tab.Screen name='TodoLists' component={NavigationTodo} />
          <Tab.Screen name='SignOut' component={SignOutScreen} />
        </Tab.Navigator>
    )}
    </NavigationContainer>
  );
};



import TodoListDetailsScreen from '../Screen/TodoListDetailsScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function NavigationTodo () {
  return (
      <Stack.Navigator initialRouteName='List'>
        <Stack.Screen name='List' component={TodoListsScreen} />
        <Stack.Screen name='Details' component={TodoListDetailsScreen} />
      </Stack.Navigator>
  )
}



const monTheme = {
  colors: {
    primary: '#93B1A6',
    card: '#183D3D',
    text: '#93B1A6',
    border: '#5C8374',
  },
};