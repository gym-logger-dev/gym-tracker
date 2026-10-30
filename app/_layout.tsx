import { Tabs, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, type ColorValue } from 'react-native';

import { ErrorScreen } from '@/ui/ErrorScreen';
import { useShellColors } from '@/ui/shellColors';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorScreen onRetry={retry} />;
}

// Decorative glyphs: no icon dependency in ADR-0001 D7. Hidden from screen readers.
function glyph(symbol: string) {
  return function TabGlyph({ color }: { color: ColorValue }) {
    return (
      <Text
        style={{ color, fontSize: 22 }}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {symbol}
      </Text>
    );
  };
}

export default function RootLayout() {
  const c = useShellColors();
  return (
    <>
      <StatusBar style="auto" />
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerTitleStyle: { fontSize: 24, fontWeight: '700', color: c.text },
          headerStyle: { backgroundColor: c.background },
          tabBarStyle: { backgroundColor: c.background },
          tabBarActiveTintColor: c.active,
          tabBarInactiveTintColor: c.muted,
          tabBarLabelStyle: { fontWeight: '600' },
          tabBarItemStyle: { minHeight: 48 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Log', tabBarAccessibilityLabel: 'Log', tabBarIcon: glyph('+') }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarAccessibilityLabel: 'History',
            tabBarIcon: glyph('↻'),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarAccessibilityLabel: 'Settings',
            tabBarIcon: glyph('⚙'),
          }}
        />
      </Tabs>
    </>
  );
}
