import { useEffect, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Pressable, StyleSheet, Text, View } from 'react-native';

import { useShellColors } from './shellColors';

// Deliberately shows no exception text: it may contain data (design spec section 4).
export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  const c = useShellColors();
  const headingRef = useRef<Text>(null);

  useEffect(() => {
    const node = headingRef.current ? findNodeHandle(headingRef.current) : null;
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Text ref={headingRef} accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
        Something went wrong
      </Text>
      <Text style={[styles.body, { color: c.muted }]}>
        This screen couldn&apos;t load. Your logged data isn&apos;t affected.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={[styles.button, { backgroundColor: c.action }]}
      >
        <Text style={[styles.buttonText, { color: c.onAction }]}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  heading: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  body: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  button: {
    alignSelf: 'stretch',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
