import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StartScreen from './screens/StartScreen.tsx';
import RulesScreen from './screens/RulesScreen.tsx';
import AddPlayerScreen from './screens/AddPlayerScreen.tsx';
import AddRolesScreen from './screens/AddRolesScreen.tsx';
import MorningScreen from './screens/MorningScreen.tsx';
import RoleDoingScreen from './screens/RoleDoingScreen.tsx';
import FirstNightScreen from './screens/FirstNightScreen.tsx';
import FirstMorningScreen from './screens/FirstMorningScreen.tsx';

export type RootStackParamList = {
  Start: undefined;
  Rules: undefined;
  AddPlayer: undefined;
  AddRoles: undefined;
  Morning: undefined;
  RoleDoing: undefined;
  FirstNight: undefined;
  FirstMorning: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
      initialRouteName="Start"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#333',
        },
        headerTintColor: '#eaeaea',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      >
        <Stack.Screen name="Start" component={StartScreen} options={{ title: 'Başla' }} />
        <Stack.Screen name="Rules" component={RulesScreen} options={{ title: 'Kurallar' }} />
        <Stack.Screen name="AddPlayer" component={AddPlayerScreen} options={{ title: 'Oyuncu Ekle' }} />
        <Stack.Screen name="AddRoles" component={AddRolesScreen} options={{ title: 'Rolleri Ayarla' }} />
        <Stack.Screen name="Morning" component={MorningScreen}
        options={{ title: 'Sabah',
            headerBackVisible: false,
            gestureEnabled: false,}} />
        <Stack.Screen name="RoleDoing" component={RoleDoingScreen}
        options={{ title: 'Gece Roller',
            headerBackVisible: false,
            gestureEnabled: false,}} />
        <Stack.Screen name="FirstNight" component={FirstNightScreen}
        options={{ title: 'İlk Gece',
            headerBackVisible: false,
            gestureEnabled: false,}} />
        <Stack.Screen name="FirstMorning" component={FirstMorningScreen}
        options={{ title: 'İlk Sabah',
            headerBackVisible: false,
            gestureEnabled: false,}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}