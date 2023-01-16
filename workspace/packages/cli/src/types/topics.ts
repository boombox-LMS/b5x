import { z } from "zod";

export const NewTopicConfigSchema = z.object({
  slug: z.string(),
  title: z.string(),
  subtitle: z.string(),
  coverImageUrl: z.string(),
  // tags: z.array(z.string()).optional(),
  groupAccessLevels: z.object({
    assigned: z.array(z.string()).optional(),
    recommended: z.array(z.string()).optional(),
    available: z.array(z.string()).optional(),
  }),
});

export type NewTopicConfig = z.infer<typeof NewTopicConfigSchema>;

export const ParsedTopicConfigSchema = NewTopicConfigSchema.extend({
  coverImageUrl: z.string().optional(),
});

export type ParsedTopicConfigSchema = z.infer<typeof ParsedTopicConfigSchema>;
