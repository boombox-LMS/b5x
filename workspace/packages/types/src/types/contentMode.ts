import { z } from "zod";

// ContentMode ------------------------------------------------------

export const ContentModeSchema = z.enum(["documentation", "tutorial"]);

/**
 * The style in which content should be delivered (tutorial, documentation, etc.)
 * For example, the content mode impacts whether documents are displayed gradually or all at once.
 */
export type ContentMode = z.infer<typeof ContentModeSchema>;
