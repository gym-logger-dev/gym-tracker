import { EmptyState } from '@/ui/EmptyState';

export default function HistoryScreen() {
  return (
    <EmptyState
      icon={'↻'}
      heading="No sessions yet"
      body="Past sessions will show up here when you have logged some."
    />
  );
}
