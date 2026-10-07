// Constants from ADR-0002. Enums live here, not in database checks, where D4/D9 say so.

/** UUIDv5 namespace for deterministic ids (ADR-0002 D1). Frozen: changing it orphans every imported id. */
export const UUID_V5_NAMESPACE = '20448473-4ce0-4b10-a84a-4ab62677ea3a';

/** Display timezone and the zone that defines `session_date` (ADR-0002 D5). Storage is always UTC. */
export const ADELAIDE_TZ = 'Australia/Adelaide';

export const SESSION_SOURCES = ['app', 'quick_log', 'notion_import'] as const;
export const PLAN_STATUSES = ['draft', 'approved'] as const;
export const PLAN_SOURCES = ['manual', 'claude_mcp', 'app_import'] as const;
export const CONSENT_TYPES = ['health_data', 'strava', 'ai_sharing'] as const;
/** `import_entry.source_system`. Not the same value as `session.source` (`notion_import`); see ADR-0002 errata 4. */
export const IMPORT_SOURCE_SYSTEMS = ['notion_csv'] as const;

/** `import_entry.review_reasons` codes (ADR-0002 D9). */
export const IMPORT_REASON_CODES = [
  'missing_date',
  'missing_exercise',
  'unknown_exercise',
  'empty_sets',
  'unparsed_token',
  'no_weight',
  'duplicate_source_row',
] as const;

/** Suggested `exercise.muscle_group` values (ADR-0002 D4). Free text in storage; this list only seeds pickers. */
export const SUGGESTED_MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'core',
] as const;

export type SessionSource = (typeof SESSION_SOURCES)[number];
export type PlanStatus = (typeof PLAN_STATUSES)[number];
export type PlanSource = (typeof PLAN_SOURCES)[number];
export type ConsentType = (typeof CONSENT_TYPES)[number];
export type ImportSourceSystem = (typeof IMPORT_SOURCE_SYSTEMS)[number];
export type ImportReasonCode = (typeof IMPORT_REASON_CODES)[number];
