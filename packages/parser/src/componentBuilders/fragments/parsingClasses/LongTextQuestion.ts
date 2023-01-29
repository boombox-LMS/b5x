import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { ConditionsHelper } from "@b5x/conditions-manager";
import { RawFragmentSchema } from "@b5x/types";

// Markup -----------------------------------------------------------

export const exampleLongTextQuestionMarkup = `
<long-text-question>
Tell me more about yourself.
</long-text-question>
`;

// Types ------------------------------------------------------------

const LongTextQuestionTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("long-text-question"),
    attribs: z
      .object({
        id: z.string().optional(),
        "show-if": z.string().optional(), // TODO: Define at a higher level and spread here?
      })
      .strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])),
  })
  .strict();

type LongTextQuestionTag = z.infer<typeof LongTextQuestionTagSchema>;

export const LongTextQuestionApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("LongTextQuestion"),
  contents: z.literal(""),
  isStateful: z.literal(true),
  data: z.object({}).strict(),
  childUris: z.array(z.string()).min(1),
}).strict();

// Class ------------------------------------------------------------

/**
 * A fragment that renders as a long text question,
 * providing an expandable rich-text editor that allows
 * the user to share links, format lists, etc.
 */
export class LongTextQuestion extends FragmentViaBxmlTag {
  bxmlNode: LongTextQuestionTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = LongTextQuestionTagSchema.parse(params.bxmlNode);
    // TODO: This should be handled at a higher level
    if (this.bxmlNode.attribs["show-if"]) {
      // @ts-ignore
      this.displayConditions = ConditionsHelper.buildConditions(
        this.bxmlNode.attribs["show-if"]
      );
    }
    this.convertToStatefulFragment();
  }
}

export const manifest = {
  contentType: "LongTextQuestion",
  tagName: "long-text-question",
  exampleMarkupStrings: [exampleLongTextQuestionMarkup],
  parsingClass: LongTextQuestion,
  apiDataSchema: LongTextQuestionApiDataSchema,
  tagSchema: LongTextQuestionTagSchema,
};
