import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { z } from "zod";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";

// Markup -----------------------------------------------------------

export const exampleSentimentCheckMarkup = `
<sentiment-check>
How are you feeling about Boombox so far?
</sentiment-check>
`;

// Types ------------------------------------------------------------

const SentimentCheckTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("sentiment-check"),
    attribs: z.object({ id: z.string().optional() }).strict(),
    // TODO: Convert to just allowing plain Markdown? Leaving it for now so the snapshot tests stay useful during refactor.
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])).min(1),
  })
  .strict();

type SentimentCheckTag = z.infer<typeof SentimentCheckTagSchema>;

// Class ------------------------------------------------------------

/**
 * A fragment that renders as a sentiment check (a set of faces ranging from sad to happy).
 */
export class SentimentCheck extends FragmentViaBxmlTag {
  bxmlNode: SentimentCheckTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = SentimentCheckTagSchema.parse(params.bxmlNode);
    this.convertToStatefulFragment();
  }
}
