import { z } from "zod";

export const StatSchema = z.object({
  id: z.string(),
  label: z.string(),
  min: z.number(),
  max: z.number(),
  base: z.number(),
  baseRange: z.tuple([z.number(), z.number()]).optional(),
  group: z.string(),
});

export const ConfigSchema = z.object({
  version: z.number(),
  ageStart: z.number(),
  ageEnd: z.number(),
  initialPoints: z.number(),
  defaultEndingId: z.string(),
  stats: z.array(StatSchema),
});

export const AgeEntrySchema = z.object({
  age: z.number(),
  events: z.array(
    z.object({
      id: z.string(),
      weight: z.number(),
    })
  ),
  talents: z.array(z.string()),
});

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
  postText: z.string().optional(),
  grade: z.number(),
  include: z.string().optional(),
  exclude: z.string().optional(),
  noRandom: z.boolean().optional(),
  effects: z
    .object({
      stats: z.record(z.string(), z.number()).optional(),
      flagsAdd: z.array(z.string()).optional(),
      flagsRemove: z.array(z.string()).optional(),
      tagsAdd: z.array(z.string()).optional(),
      tagsRemove: z.array(z.string()).optional(),
    })
    .optional(),
  branch: z
    .array(
      z.object({
        condition: z.string(),
        next: z.string(),
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
});

export const TalentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  grade: z.number(),
  condition: z.string().optional(),
  maxTriggers: z.number().optional(),
  effects: z
    .object({
      stats: z.record(z.string(), z.number()).optional(),
      flagsAdd: z.array(z.string()).optional(),
      flagsRemove: z.array(z.string()).optional(),
    })
    .optional(),
  status: z.number().optional(),
  exclude: z.array(z.string()).optional(),
  replacement: z
    .object({
      common: z.array(z.object({ id: z.string(), weight: z.number() })).optional(),
      grade: z.array(z.union([z.string(), z.number()])).optional(),
      talent: z.array(z.union([z.string(), z.number()])).optional(),
    })
    .optional(),
  exclusive: z.boolean().optional(),
});

export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  grade: z.number(),
  hide: z.boolean().optional(),
  opportunity: z.enum(["START", "TRAJECTORY", "SUMMARY", "END"]),
  condition: z.string(),
});

export const CareerTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  color: z.string(),
});

export const CareerNodeSchema = z.object({
  id: z.string(),
  trackId: z.string(),
  tier: z.number(),
  title: z.string(),
  requires: z
    .object({
      ageMin: z.number().optional(),
      stats: z.record(z.string(), z.number()).optional(),
      flags: z.array(z.string()).optional(),
      achievements: z.array(z.string()).optional(),
    })
    .optional(),
  effects: z
    .object({
      stats: z.record(z.string(), z.number()).optional(),
      flagsAdd: z.array(z.string()).optional(),
      tagsAdd: z.array(z.string()).optional(),
    })
    .optional(),
});

export const CareersSchema = z.object({
  tracks: z.array(CareerTrackSchema),
  nodes: z.array(CareerNodeSchema),
});

export const EndingSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  grade: z.number(),
  priority: z.number(),
  condition: z.string(),
  category: z.enum(["career", "family", "risk", "honor", "fate"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const EndingsSchema = z.object({
  defaultEndingId: z.string(),
  list: z.array(EndingSchema),
});

export type Stat = z.infer<typeof StatSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type AgeEntry = z.infer<typeof AgeEntrySchema>;
export type Event = z.infer<typeof EventSchema>;
export type Talent = z.infer<typeof TalentSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type CareerTrack = z.infer<typeof CareerTrackSchema>;
export type CareerNode = z.infer<typeof CareerNodeSchema>;
export type Careers = z.infer<typeof CareersSchema>;
export type Ending = z.infer<typeof EndingSchema>;
export type Endings = z.infer<typeof EndingsSchema>;
