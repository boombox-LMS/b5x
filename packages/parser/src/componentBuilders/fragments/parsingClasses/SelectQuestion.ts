import { BxmlTextNodeSchema } from "../../../types/bxmlNodes";
import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { RawFragmentSchema } from "@b5x/types";

// Markup -----------------------------------------------------------

/**
 * Example markup for the `single-select-question` tag.
 *
 * TODOs:
 * - Does it work just as well with line breaks
 *   to make the choice text more human-readable?
 */
export const exampleSingleSelectQuestionMarkup = `
<single-select-question id='user-region'>
Where are you from?
<choice value="midwest">the Midwest</choice>
<choice value="south">the South</choice>
<choice value="east-coast">the East Coast</choice>
<choice value="west-coast">the West Coast</choice>
</single-select-question>
`;

/**
 * Example markup for the `multi-select-question` tag.
 *
 * TODOs:
 * - Does it work just as well with line breaks
 *   to make the choice text more human-readable?
 */
export const exampleMultiSelectQuestionMarkup = `
<multi-select-question id='user-colors'>
Which colors do you like?
<choice value="pink">Pink</choice>
<choice value="green">Green</choice>
<choice value="blue">Blue</choice>
<choice value="purple">Purple</choice>
<choice value="yellow">Yellow</choice>
<choice value="orange">Orange</choice>
</multi-select-question>
`;

// Types ------------------------------------------------------------

const ChoiceTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("choice"),
    attribs: z
      .object({
        value: z.string(),
      })
      .strict(),
    children: z.array(BxmlTextNodeSchema).length(1),
  })
  .strict();

type ChoiceTag = z.infer<typeof ChoiceTagSchema>;

const SelectQuestionTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.union([
      z.literal("multi-select-question"),
      z.literal("single-select-question"),
    ]),
    attribs: z
      .object({
        id: z.string().optional(),
      })
      .strict(),
    children: z.array(z.union([BxmlTextNodeSchema, ChoiceTagSchema])),
  })
  .strict()
  .refine((selectQuestionTag) => {
    let leadingTextNodeOnly = true;
    selectQuestionTag.children.forEach((node, i) => {
      if (i > 0 && node.type === "text") {
        leadingTextNodeOnly = false;
      }
    });
    return leadingTextNodeOnly;
  });

type SelectQuestionTag = z.infer<typeof SelectQuestionTagSchema>;

export const SelectQuestionDataSchema = z
  .object({
    choices: z
      .array(
        z
          .object({
            value: z.string(),
            contents: z.string(),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

type SelectQuestionData = z.infer<typeof SelectQuestionDataSchema>;

export const SelectQuestionApiDataSchema = RawFragmentSchema.extend({
  contentType: z.enum(["SingleSelectQuestion", "MultiSelectQuestion"]),
  data: SelectQuestionDataSchema,
  childUris: z.array(z.string()).min(1),
  isStateful: z.literal(true),
  contents: z.literal(''),
}).strict();

// Class ------------------------------------------------------------

const CHOICE_TAG_NAME = "choice";

/**
 * The class responsible for processing both the `<single-select-question>`
 * tag and the `<multi-select-question>` tag, which have the same internal
 * tags and data, but different rendering behavior.
 */
export class SelectQuestion extends FragmentViaBxmlTag {
  bxmlNode: SelectQuestionTag;
  data: SelectQuestionData;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = SelectQuestionTagSchema.parse(params.bxmlNode);
    this.childBxmlNodes = this.bxmlNode.children.filter((node) => {
      return node.type === "text";
    });
    this.data = this.#buildData();
    this.convertToStatefulFragment();
  }

  #buildData() {
    let choiceTags = this.bxmlNode.children.filter((node) => {
      return node.type === "tag" && node.name === "choice";
    });
    const result = {
      choices: choiceTags.map((tag) => this.parseChoiceTag(tag as ChoiceTag)),
    };
    return SelectQuestionDataSchema.parse(result);
  }

  /**
   * Converts a `<choice>` tag into React-renderable data.
   */
  parseChoiceTag(tag: ChoiceTag) {
    return {
      value: tag.attribs.value,
      contents: tag.children[0].data,
    };
  }
}

// TODO: This is an unusual case (one parsing class supporing two tags), 
// and the standard manifest format
// doesn't apply here. Does the manifest format need to change to
// accommodate cases like this? The manifests may move to their own file
// anyway, in which case we could just import vars from this file
// in order to create two manifests that point to this parsing class
// and extend its apiData schema.
export const manifest = {
  exampleMarkupStrings: [exampleSingleSelectQuestionMarkup, exampleMultiSelectQuestionMarkup],
  tagSchema: SelectQuestionTagSchema,
  apiDataSchema: SelectQuestionApiDataSchema,
};
