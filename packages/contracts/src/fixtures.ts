// Synthetic fixtures only (public repo). Ids are fake; names are obviously fake.
export const U1 = '018f0000-0000-7000-8000-000000000001';
export const U2 = '018f0000-0000-7000-8000-000000000002';
export const ID = (n: number) => `018f0000-0000-7000-8000-${String(n).padStart(12, '0')}`;

const stamp = '2026-10-04T10:00:00.000Z';
export const common = { id: ID(10), user_id: U1, created_at: stamp, updated_at: stamp };

// 4 Oct 2026 00:00 in Australia/Adelaide (ACDT starts 02:00 that day, so midnight is still +09:30).
export const MIDNIGHT_ADELAIDE_4_OCT = '2026-10-03T14:30:00.000Z';

export const session = {
  ...common,
  id: ID(20),
  started_at: MIDNIGHT_ADELAIDE_4_OCT,
  session_date: '2026-10-04',
  source: 'notion_import',
};

// Derived from the Sets cell `45x10, 9, 8`: first set is weight 45, reps 10.
export const set = {
  ...common,
  id: ID(30),
  session_id: ID(20),
  exercise_id: ID(40),
  set_order: 1,
  weight_kg: 45,
  reps: 10,
};

export const importEntry = {
  ...common,
  id: ID(50),
  import_batch_id: ID(51),
  source_system: 'notion_csv',
  source_row_id: 'fake-row-0001',
  raw_fields: { exercise: 'Example Bench Press', gym: 'Example Gym A' },
  parsed_set_count: 3,
};
