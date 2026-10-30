import { z } from 'zod';
import {
  CONSENT_TYPES,
  IMPORT_REASON_CODES,
  IMPORT_SOURCE_SYSTEMS,
  PLAN_SOURCES,
  PLAN_STATUSES,
  SESSION_SOURCES,
} from './constants';
import {
  DateText,
  IncrementKg,
  Name,
  Reps,
  Rpe,
  Timestamp,
  Uuid,
  WeightKg,
  adelaideDate,
  isTimestamp,
  nullableCol,
} from './primitives';

// Field names, nullability and units follow ADR-0002 D2 to D5, D9 and D11 exactly.
// Strict objects: an unknown key is an error, never silently dropped.

/** D2 common columns. `updated_at` is server-assigned on write; clients send their clock, the server overwrites. */
const common = {
  id: Uuid,
  user_id: Uuid,
  created_at: Timestamp,
  updated_at: Timestamp,
};
const tombstone = { deleted_at: nullableCol(Timestamp) };

export const ExerciseSchema = z.strictObject({
  ...common,
  name: Name,
  muscle_group: nullableCol(z.string()),
  equipment_increment_kg: nullableCol(IncrementKg),
  ...tombstone,
});

export const VariantSchema = z.strictObject({ ...common, name: Name, ...tombstone });

export const GymSchema = z.strictObject({ ...common, name: Name, ...tombstone });

export const SessionSchema = z
  .strictObject({
    ...common,
    started_at: Timestamp,
    ended_at: nullableCol(Timestamp),
    session_date: DateText,
    gym_id: nullableCol(Uuid),
    plan_day_id: nullableCol(Uuid),
    strava_activity_id: nullableCol(z.number().int().positive().max(Number.MAX_SAFE_INTEGER)),
    source: z.enum(SESSION_SOURCES),
    ...tombstone,
  })
  // Refines may run after a field failed, so they only judge valid timestamps and never throw.
  .refine(
    (s) =>
      s.ended_at === null ||
      !isTimestamp(s.ended_at) ||
      !isTimestamp(s.started_at) ||
      Date.parse(s.ended_at) >= Date.parse(s.started_at),
    {
      path: ['ended_at'],
      message: 'ended_at must not be before started_at',
    },
  )
  .refine((s) => !isTimestamp(s.started_at) || s.session_date === adelaideDate(s.started_at), {
    path: ['session_date'],
    message: 'session_date must equal the Australia/Adelaide date of started_at',
  });

export const SetSchema = z.strictObject({
  ...common,
  session_id: Uuid,
  exercise_id: Uuid,
  variant_id: nullableCol(Uuid),
  set_order: z.number().int().min(1),
  weight_kg: nullableCol(WeightKg),
  reps: Reps,
  rpe: nullableCol(Rpe),
  completed_at: nullableCol(Timestamp),
  ...tombstone,
});

/**
 * Envelope only. The full plan JSON (exercises, sets, rep ranges, load guidance) is defined with the
 * MCP plan tools and in-app import (later story); `version` is the migration hook (ADR-0002 D11).
 */
export const PlanPrescriptionSchema = z.looseObject({ version: z.number().int().min(1) });

export const PlanSchema = z
  .strictObject({
    ...common,
    name: Name,
    status: z.enum(PLAN_STATUSES).default('draft'),
    approved_at: nullableCol(Timestamp),
    source: z.enum(PLAN_SOURCES),
    ...tombstone,
  })
  .refine((p) => p.status !== 'approved' || p.approved_at !== null, {
    path: ['approved_at'],
    message: 'approved_at is required when status is approved',
  });

export const PlanDaySchema = z.strictObject({
  ...common,
  plan_id: Uuid,
  day_index: z.number().int().min(1),
  label: nullableCol(z.string()),
  prescription: PlanPrescriptionSchema,
  ...tombstone,
});

/** Append-only evidence (D11): no `deleted_at`. */
export const ConsentSchema = z
  .strictObject({
    ...common,
    type: z.enum(CONSENT_TYPES),
    policy_version: z.string().min(1),
    granted_at: Timestamp,
    withdrawn_at: nullableCol(Timestamp),
  })
  .refine(
    (c) => c.withdrawn_at === null || Date.parse(c.withdrawn_at) >= Date.parse(c.granted_at),
    {
      path: ['withdrawn_at'],
      message: 'withdrawn_at must not be before granted_at',
    },
  );

/**
 * Server-only provenance (D9), no `deleted_at`. Raw text is never trimmed or normalised.
 * `raw_sets`: null = cell absent, '' = present and empty (distinct).
 */
export const ImportEntrySchema = z.strictObject({
  ...common,
  import_batch_id: Uuid,
  source_system: z.enum(IMPORT_SOURCE_SYSTEMS),
  source_row_id: z.string().min(1),
  raw_date: nullableCol(z.string()),
  raw_sets: nullableCol(z.string()),
  raw_fields: z.record(z.string(), z.string().nullable()),
  parsed_set_count: z.number().int().min(0),
  session_id: nullableCol(Uuid),
  exercise_id: nullableCol(Uuid),
  needs_review: z.boolean().default(false),
  review_reasons: z.array(z.enum(IMPORT_REASON_CODES)).default([]),
  reviewed_at: nullableCol(Timestamp),
});

export type Exercise = z.infer<typeof ExerciseSchema>;
export type Variant = z.infer<typeof VariantSchema>;
export type Gym = z.infer<typeof GymSchema>;
export type Session = z.infer<typeof SessionSchema>;
/** Named `WorkoutSet` to avoid shadowing the global `Set`. */
export type WorkoutSet = z.infer<typeof SetSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type PlanDay = z.infer<typeof PlanDaySchema>;
export type Consent = z.infer<typeof ConsentSchema>;
export type ImportEntry = z.infer<typeof ImportEntrySchema>;
