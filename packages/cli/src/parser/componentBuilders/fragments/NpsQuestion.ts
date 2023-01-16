import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { z } from "zod";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";

// Markup -----------------------------------------------------------

export const exampleNpsQuestionMarkup = `
<nps-question>
How likely are you to recommend Boombox to a friend or colleague?
</nps-question>
`;

// Types ------------------------------------------------------------

const NpsQuestionTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("nps-question"),
    attribs: z.object({ id: z.string().optional() }).strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])).min(1),
  })
  .strict();

type NpsQuestionTag = z.infer<typeof NpsQuestionTagSchema>;

// Class ------------------------------------------------------------

/**
 * A fragment that renders a 0-10 scale, along with whatever
 * question content the author provided inside the `<nps-question>` tag.
 */
export class NpsQuestion extends FragmentViaBxmlTag {
  bxmlNode: NpsQuestionTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = NpsQuestionTagSchema.parse(params.bxmlNode);
    this.convertToStatefulFragment();
  }
}
