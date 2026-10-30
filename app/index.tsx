import { EmptyState } from '@/ui/EmptyState';

export default function LogScreen() {
  return (
    <EmptyState
      icon="+"
      heading="Nothing logged yet"
      body="Your sets will appear here once you start a session."
    />
  );
}
