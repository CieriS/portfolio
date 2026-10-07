import { z } from 'zod';

/** ISO calendar date, `YYYY-MM-DD`, that actually exists (no 2024-02-31). */
const isoDate = z.iso.date();
const id = z.string().regex(/^[a-z][a-z0-9-]*$/, 'ids are lowercase kebab-case');

export const ContactSchema = z.object({ id, label: z.string().min(1), handle: z.string().min(1), url: z.url() });

/** One run of a thread. `end: null` means it is still running. */
export const SegmentSchema = z
  .object({ start: isoDate, end: isoDate.nullable() })
  .refine((segment) => segment.end === null || segment.end > segment.start, 'a segment must end after it starts');

/** `start` is optional: without it the phase is spread over the thread's active time. */
export const PhaseSchema = z.object({ id, start: isoDate.optional(), stack: z.array(z.string().min(1)) });

export const THREAD_KINDS = ['work', 'education'] as const;

/** A thread runs over one or more segments, so an interruption is part of the model. */
export const ThreadSchema = z.object({
  id,
  kind: z.enum(THREAD_KINDS),
  entity: z.string().min(1).nullable(),
  segments: z.array(SegmentSchema).min(1),
  phases: z.array(PhaseSchema),
});

/** Where a project's code lives: a public repository, or private code shown on request. */
export const ProjectSourceSchema = z.discriminatedUnion('visibility', [
  z.object({ visibility: z.literal('public'), url: z.url() }),
  z.object({ visibility: z.literal('private') }),
]);

export const ProjectSchema = z.object({
  id,
  name: z.string().min(1),
  source: ProjectSourceSchema,
  stack: z.array(z.string().min(1)).min(1),
  layers: z.array(z.object({ id, tech: z.string().min(1) })).min(1),
});

export const SessionSchema = z.object({ id: z.string().min(1), focus: z.string().min(1), patterns: z.array(z.string().min(1)) });

/** Language-independent data: links, dates, stacks, metrics. */
export const SharedSchema = z.object({
  name: z.string().min(1),
  handle: z.string().min(1),
  /** Other spellings and handles the same person is searched by; published as `alternateName`. */
  alternateNames: z.array(z.string().min(1)),
  /** `country` is an ISO 3166-1 alpha-2 code. */
  address: z.object({ locality: z.string().min(1), country: z.string().regex(/^[A-Z]{2}$/, 'country is a two-letter ISO code') }),
  contacts: z.array(ContactSchema),
  timeline: z.object({ threads: z.array(ThreadSchema).min(1) }),
  projects: z.array(ProjectSchema),
  discipline: z.object({
    biological: z.object({
      heightCm: z.number().positive().nullable(),
      weightKg: z.number().positive().nullable(),
      daysPerWeek: z.number().int().min(1).max(7),
      sessions: z.array(SessionSchema),
    }),
    acoustic: z.object({ formats: z.array(z.string().min(1)), pipeline: z.array(z.string().min(1)) }),
  }),
});

export type Contact = z.infer<typeof ContactSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type ThreadKind = (typeof THREAD_KINDS)[number];
export type Thread = z.infer<typeof ThreadSchema>;
export type ProjectSource = z.infer<typeof ProjectSourceSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectLayer = Project['layers'][number];
export type Session = z.infer<typeof SessionSchema>;
export type SharedData = z.infer<typeof SharedSchema>;
