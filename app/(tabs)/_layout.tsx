import React from 'react';
import { Tabs } from 'expo-router';
import { Calendar, BookOpen, CheckSquare, MoreHorizontal } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 16);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#818cf8', // indigo-400
        tabBarInactiveTintColor: '#71717a', // zinc-500
        tabBarStyle: {
          backgroundColor: '#09090b',
          borderTopColor: '#27272a',
          borderTopWidth: 1,
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Deadlines',
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={20} />,
        }}
      />
    </Tabs>
  );
}
