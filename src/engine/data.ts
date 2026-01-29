import rawAchievements from "../data/achievements.json";
import rawAge from "../data/age.json";
import rawCareers from "../data/careers.json";
import rawConfig from "../data/config.json";
import rawEndings from "../data/endings.json";
import rawEvents from "../data/events.json";
import rawTalents from "../data/talents.json";
import {
  AchievementSchema,
  AgeEntrySchema,
  CareersSchema,
  ConfigSchema,
  EndingsSchema,
  EventSchema,
  TalentSchema,
} from "./schema";

export const config = ConfigSchema.parse(rawConfig);
export const age = AgeEntrySchema.array().parse(rawAge);
export const events = EventSchema.array().parse(rawEvents);
export const talents = TalentSchema.array().parse(rawTalents);
export const achievements = AchievementSchema.array().parse(rawAchievements);
export const careers = CareersSchema.parse(rawCareers);
export const endings = EndingsSchema.parse(rawEndings);

export const dataBundle = {
  config,
  age,
  events,
  talents,
  achievements,
  careers,
  endings,
};
