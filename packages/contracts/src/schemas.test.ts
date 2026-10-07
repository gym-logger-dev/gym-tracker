import { z } from 'zod';
import {
  ConsentSchema,
  ExerciseSchema,
  GymSchema,
  IMPORT_REASON_CODES,
  ImportEntrySchema,
  PlanDaySchema,
  PlanSchema,
  SessionSchema,
  SetSchema,
  VariantSchema,
  adelaideDate,
} from './index';
import { ID, common, importEntry, session, set } from './fixtures';

const ok = (schema: z.ZodType, v: unknown) => expect(schema.safeParse(v).success).toBe(true);
const bad = (schema: z.ZodType, v: unknown) => expect(schema.safeParse(v).success).toBe(false);

describe('set (AC2)', () => {
  it('accepts a set derived from `45x10, 9, 8` and defaults nullable columns to null', () => {
    const parsed = SetSchema.parse(set);
    expect(parsed).toMatchObject({ weight_kg: 45, reps: 10, rpe: null, variant_id: null });
    expect(parsed.completed_at).toBeNull();
    expect(parsed.deleted_at).toBeNull();
  });

  it.each([
    ['weight < 0', { weight_kg: -0.001 }],
    ['weight above 999.999', { weight_kg: 1000 }],
    ['weight with 4 decimals', { weight_kg: 45.0001 }],
    ['reps below 0', { reps: -1 }],
    ['reps above 1000', { reps: 1001 }],
    ['non-integer reps', { reps: 8.5 }],
    ['rpe below 0', { rpe: -0.5 }],
    ['rpe above 10', { rpe: 10.5 }],
    ['rpe with 2 decimals', { rpe: 8.25 }],
    ['set_order 0', { set_order: 0 }],
  ])('rejects %s', (_label, patch) => bad(SetSchema, { ...set, ...patch }));

  it.each([
    { weight_kg: 0 },
    { weight_kg: 1.25 },
    { weight_kg: 999.999 },
    { weight_kg: null },
    { reps: 0 },
    { reps: 1000 },
    { rpe: 0 },
    { rpe: 8.5 },
    { rpe: 10 },
    { rpe: null },
  ])('accepts boundary %j', (patch) => ok(SetSchema, { ...set, ...patch }));

  it('rejects unknown keys instead of dropping them', () => bad(SetSchema, { ...set, extra: 1 }));
  it('rejects uppercase and non-uuid ids', () => {
    bad(SetSchema, { ...set, id: ID(30).toUpperCase() });
    bad(SetSchema, { ...set, id: 'not-a-uuid' });
  });
  it('requires UTC millisecond timestamps with Z', () => {
    bad(SetSchema, { ...set, created_at: '2026-10-04T10:00:00Z' });
    bad(SetSchema, { ...set, created_at: '2026-10-04T10:00:00.000+09:30' });
  });
});

describe('session (AC2, AC10)', () => {
  it('accepts a historical entry: no gym, no end time, no plan day', () => {
    const parsed = SessionSchema.parse(session);
    expect(parsed).toMatchObject({ gym_id: null, ended_at: null, plan_day_id: null });
    expect(parsed.strava_activity_id).toBeNull();
  });

  it('rejects a session_date that differs from the Adelaide date of started_at', () => {
    bad(SessionSchema, { ...session, session_date: '2026-10-03' }); // the UTC date
    bad(SessionSchema, { ...session, session_date: '2026-10-05' });
  });

  it('computes the Adelaide date across daylight saving (ACST +09:30, ACDT +10:30)', () => {
    // DST starts 4 Oct 2026 at 02:00 ACST (16:30Z on 3 Oct); midnight before it is still +09:30.
    expect(adelaideDate('2026-10-03T14:29:59.999Z')).toBe('2026-10-03'); // 23:59:59.999 on 3 Oct
    expect(adelaideDate('2026-10-03T14:30:00.000Z')).toBe('2026-10-04'); // 00:00 on 4 Oct
    expect(adelaideDate('2026-10-04T13:29:59.999Z')).toBe('2026-10-04'); // 23:59:59.999 (+10:30)
    expect(adelaideDate('2026-10-04T13:30:00.000Z')).toBe('2026-10-05'); // 00:00 on 5 Oct
  });

  it('accepts a winter session whose UTC date is the day before', () => {
    ok(SessionSchema, {
      ...session,
      started_at: '2026-06-30T14:30:00.000Z',
      session_date: '2026-07-01',
    });
  });

  it('rejects ended_at before started_at and unknown sources', () => {
    bad(SessionSchema, { ...session, ended_at: '2026-10-03T14:29:59.999Z' });
    ok(SessionSchema, { ...session, ended_at: session.started_at });
    bad(SessionSchema, { ...session, source: 'strava' });
  });
});

describe('untrusted input is rejected, never thrown on', () => {
  const garbage = ['garbage', '', '2026-13-45T99:00:00.000Z', null, 5, undefined, {}, [], true];
  const consent = {
    ...common,
    type: 'health_data',
    policy_version: 'v1',
    granted_at: '2026-10-04T10:00:00.000Z',
  };

  it.each(garbage)('session started_at %j', (value) => {
    const run = () => SessionSchema.safeParse({ ...session, started_at: value });
    expect(run).not.toThrow();
    expect(run().success).toBe(false);
  });

  it.each(garbage)('session ended_at %j', (value) => {
    const run = () => SessionSchema.safeParse({ ...session, ended_at: value });
    expect(run).not.toThrow();
    // null and undefined mean "no end time" (valid); everything else is rejected.
    expect(run().success).toBe(value === null || value === undefined);
  });

  it.each(garbage)('session session_date %j', (value) => {
    const run = () => SessionSchema.safeParse({ ...session, session_date: value });
    expect(run).not.toThrow();
    expect(run().success).toBe(false);
  });

  it('session with several bad fields at once', () => {
    const run = () =>
      SessionSchema.safeParse({
        ...session,
        started_at: 'garbage',
        ended_at: 'garbage',
        session_date: 'garbage',
      });
    expect(run).not.toThrow();
    expect(run().success).toBe(false);
  });

  it.each(['garbage', '', '2026-13-45T99:00:00.000Z', 5, {}])('consent timestamps %j', (value) => {
    for (const patch of [{ granted_at: value }, { withdrawn_at: value }]) {
      const run = () => ConsentSchema.safeParse({ ...consent, ...patch });
      expect(run).not.toThrow();
      expect(run().success).toBe(false);
    }
  });

  it('SessionSchema.parse throws a ZodError (not RangeError) on bad started_at', () => {
    expect(() => SessionSchema.parse({ ...session, started_at: 'garbage' })).toThrow(z.ZodError);
  });
});

describe('import_entry (AC5)', () => {
  it('keeps raw_sets null (cell absent) distinct from empty string (present and empty)', () => {
    const absent = ImportEntrySchema.parse({ ...importEntry, raw_sets: null });
    const omitted = ImportEntrySchema.parse(importEntry);
    const empty = ImportEntrySchema.parse({ ...importEntry, raw_sets: '' });
    expect(absent.raw_sets).toBeNull();
    expect(omitted.raw_sets).toBeNull();
    expect(empty.raw_sets).toBe('');
  });

  it('defaults needs_review to false and review_reasons to empty', () => {
    const parsed = ImportEntrySchema.parse(importEntry);
    expect(parsed.needs_review).toBe(false);
    expect(parsed.review_reasons).toEqual([]);
    expect(parsed.reviewed_at).toBeNull();
  });

  it('does not trim raw text', () => {
    expect(ImportEntrySchema.parse({ ...importEntry, raw_sets: '  45x10 , 9  ' }).raw_sets).toBe(
      '  45x10 , 9  ',
    );
  });

  it('accepts every reason code and rejects others', () => {
    ok(ImportEntrySchema, {
      ...importEntry,
      needs_review: true,
      review_reasons: [...IMPORT_REASON_CODES],
    });
    bad(ImportEntrySchema, { ...importEntry, review_reasons: ['other'] });
  });

  it('has no deleted_at', () => {
    expect(ImportEntrySchema.shape).not.toHaveProperty('deleted_at');
    bad(ImportEntrySchema, { ...importEntry, deleted_at: null });
  });
});

describe('consent (AC6)', () => {
  const consent = {
    ...common,
    type: 'health_data',
    policy_version: '2026-10-01',
    granted_at: '2026-10-04T10:00:00.000Z',
  };

  it.each(['health_data', 'strava', 'ai_sharing'])('accepts type %s', (type) =>
    ok(ConsentSchema, { ...consent, type }),
  );
  it('rejects other types', () => bad(ConsentSchema, { ...consent, type: 'marketing' }));
  it('rejects withdrawn_at earlier than granted_at, accepts equal or later', () => {
    bad(ConsentSchema, { ...consent, withdrawn_at: '2026-10-04T09:59:59.999Z' });
    ok(ConsentSchema, { ...consent, withdrawn_at: consent.granted_at });
    ok(ConsentSchema, { ...consent, withdrawn_at: '2026-10-05T00:00:00.000Z' });
  });
  it('has no deleted_at', () => expect(ConsentSchema.shape).not.toHaveProperty('deleted_at'));
});

describe('reference entities, plan and plan_day', () => {
  it('exercise: optional columns omitted, name trimmed, 1 to 100 chars', () => {
    const parsed = ExerciseSchema.parse({ ...common, name: '  Example Squat ' });
    expect(parsed).toMatchObject({
      name: 'Example Squat',
      muscle_group: null,
      equipment_increment_kg: null,
    });
    bad(ExerciseSchema, { ...common, name: '   ' });
    bad(ExerciseSchema, { ...common, name: 'x'.repeat(101) });
    ok(ExerciseSchema, { ...common, name: 'x'.repeat(100), equipment_increment_kg: 1.25 });
    bad(ExerciseSchema, { ...common, name: 'a', equipment_increment_kg: 0 });
  });

  it('variant and gym: name only', () => {
    ok(VariantSchema, { ...common, name: 'Example Paused' });
    ok(GymSchema, { ...common, name: 'Example Gym A' });
    bad(GymSchema, { ...common });
  });

  it('plan: status defaults to draft; approved requires approved_at', () => {
    const plan = { ...common, name: 'Example Plan', source: 'manual' };
    expect(PlanSchema.parse(plan).status).toBe('draft');
    bad(PlanSchema, { ...plan, status: 'approved' });
    ok(PlanSchema, { ...plan, status: 'approved', approved_at: '2026-10-04T10:00:00.000Z' });
    bad(PlanSchema, { ...plan, source: 'strava' });
  });

  it('plan_day: day_index >= 1 and a versioned prescription', () => {
    const day = {
      ...common,
      plan_id: ID(60),
      day_index: 1,
      prescription: { version: 1, anything: [] },
    };
    expect(PlanDaySchema.parse(day).label).toBeNull();
    bad(PlanDaySchema, { ...day, day_index: 0 });
    bad(PlanDaySchema, { ...day, prescription: {} });
    bad(PlanDaySchema, { ...day, prescription: undefined });
  });
});

const schemas = {
  ExerciseSchema,
  VariantSchema,
  GymSchema,
  SessionSchema,
  SetSchema,
  PlanSchema,
  PlanDaySchema,
  ConsentSchema,
  ImportEntrySchema,
};

describe('common columns (AC1)', () => {
  it('every entity has id, user_id, created_at, updated_at; deleted_at on all but consent and import_entry', () => {
    for (const [entity, schema] of Object.entries(schemas)) {
      const keys = Object.keys(schema.shape);
      expect(keys).toEqual(expect.arrayContaining(['id', 'user_id', 'created_at', 'updated_at']));
      const tombstoned = !['ConsentSchema', 'ImportEntrySchema'].includes(entity);
      expect(keys.includes('deleted_at')).toBe(tombstoned);
    }
  });
});

describe('R7: neutral names (AC9)', () => {
  it('no entity or field name implies clinical use', () => {
    const forbidden =
      /diagnos|condition|injur|disease|symptom|patient|medical|clinical|therap|pain/i;
    for (const [entity, schema] of Object.entries(schemas)) {
      expect(entity).not.toMatch(forbidden);
      for (const key of Object.keys(schema.shape)) expect(key).not.toMatch(forbidden);
    }
  });
});
