import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#09090b' }}>
        <StatusBar style="light" backgroundColor="#09090b" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#09090b' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}
