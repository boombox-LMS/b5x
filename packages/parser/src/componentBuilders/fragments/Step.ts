// TODO: Change hasState to hasValue, and StatefulFragment to FragmentWithValue
import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { z } from "zod";
import { BxmlTagNodeSchema, BxmlTextNodeSchema } from "../../types/bxmlNodes";
import { FragmentViaBxmlTagParams } from "../../types/fragments";

// Markup -----------------------------------------------------------

export const exampleStepMarkup = `
<step title='Initialize your topic'>
Create a new topic with the following command:

<code-block>
b5x init
</code-block>

If you need more help, just [Google it](https://www.google.com).
</step>
`;

// Types ------------------------------------------------------------

export const StepTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("step"),
    attribs: z.object({ title: z.string() }).strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])).min(1),
  })
  .strict();

export type StepTag = z.infer<typeof StepTagSchema>;

// Class ------------------------------------------------------------

/**
 *  A step is essentially a passive container
 *  for a list of child fragments. Steps only exist as the child
 *  fragments of checklists, and are only rendered in that context.
 */
export class Step extends FragmentViaBxmlTag {
  bxmlNode: StepTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = StepTagSchema.parse(params.bxmlNode);
    this.data = { title: this.bxmlNode.attribs.title };
    this.childBxmlNodes = this.bxmlNode.children;
  }
}
