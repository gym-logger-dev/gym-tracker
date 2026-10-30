import { StyleSheet, Text, View } from 'react-native';

import { useShellColors } from './shellColors';

type Props = { icon: string; heading: string; body: string };

export function EmptyState({ icon, heading, body }: Props) {
  const c = useShellColors();
  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Text
        style={[styles.icon, { color: c.muted }]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {icon}
      </Text>
      <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
        {heading}
      </Text>
      <Text style={[styles.body, { color: c.muted }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  icon: { fontSize: 40, marginBottom: 12 },
  heading: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  body: { fontSize: 16, textAlign: 'center' },
});
