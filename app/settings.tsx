import { EmptyState } from '@/ui/EmptyState';

export default function SettingsScreen() {
  return (
    <EmptyState
      icon="⚙"
      heading="Nothing to set up yet"
      body="Preferences will live here in a later update."
    />
  );
}
