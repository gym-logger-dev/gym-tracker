import { useColorScheme } from 'react-native';

// Interim system-style colours until src/ui/theme tokens land (design spec section 1).
// Dark-first: dark unless the system says light. Text >= 4.5:1 on background.
export function useShellColors() {
  const light = useColorScheme() === 'light';
  return light
    ? {
        background: '#FFFFFF',
        text: '#111111',
        muted: '#4A4A4A',
        active: '#0B5FD1',
        action: '#0B5FD1',
        onAction: '#FFFFFF',
      }
    : {
        background: '#000000',
        text: '#F2F2F2',
        muted: '#B8B8B8',
        active: '#6CA8FF',
        action: '#0B5FD1',
        onAction: '#FFFFFF',
      };
}
