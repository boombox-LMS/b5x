import { ConditionsListSchema, ContentModeSchema } from "@b5x/types";
import { Document } from "../parser/componentBuilders/Document";
import { z } from "zod";

export const CliTopicConfigSchema = z
  .object({
    title: z.string(),
    subtitle: z.string(),
    slug: z.string(),
    coverImageUrl: z.string(),
    contentMode: ContentModeSchema,
  })
  .strict();

export type CliTopicConfig = z.infer<typeof CliTopicConfigSchema>;

export const AuthorCredentialsSchema = z
  .object({
    apiUrl: z.string().url(),
    username: z.string(),
    apiKey: z.string(), // TODO: Use regex
  })
  .strict();

export type AuthorCredentials = z.infer<typeof AuthorCredentialsSchema>;
