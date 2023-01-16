import { z } from "zod";
import { PublicCatalogTopicSchema } from "./topic";

// Catalog ----------------------------------------------------------

export const CatalogSchema = z
  .object({
    topics: z.array(PublicCatalogTopicSchema),
  })
  .strict();

/**
 * The collection of topics that are available to the user.
 */
export type Catalog = z.infer<typeof CatalogSchema>;

// PublicCatalog ----------------------------------------------------

export const PublicCatalogSchema = CatalogSchema.extend({
  filters: z.object({
    priorityLevel: z.object({
      available: z.boolean(),
      recommended: z.boolean(),
      assigned: z.boolean(),
    }),
    completionStatus: z.object({
      "not started": z.boolean(),
      "in progress": z.boolean(),
      completed: z.boolean(),
    }),
  }),
}).strict();

/**
 * A filterable version of the Catalog.
 */
export type PublicCatalog = z.infer<typeof PublicCatalogSchema>;
