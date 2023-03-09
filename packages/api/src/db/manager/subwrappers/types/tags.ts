import { z } from "zod";

export const UserTagSearchCriteriaSchema = z
  .object({
    key: z.string().optional(),
    value: z.any().optional(),
    userId: z.number(),
  })
  .strict();

export const UserTagRemovalParamsSchema = UserTagSearchCriteriaSchema.extend({
  confirmRemoveAll: z.boolean().optional(),
})
  .strict()
  .refine((val) => {
    // If a value is provided, a key should also be provided
    if ("value" in val && !("key" in val)) {
      return false;
    }
    // If a key is not provided, the confirmRemoveAll flag must be set
    if (!("key" in val) && !val.confirmRemoveAll) {
      return false;
    }
    return true;
  });

export type UserTagRemovalParams = z.infer<typeof UserTagRemovalParamsSchema>;
export type UserTagSearchCriteria = z.infer<typeof UserTagSearchCriteriaSchema>;
