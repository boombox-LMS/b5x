import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import md5 from "md5";
import { render } from "dom-serializer";
import { BxmlTextNodeSchema } from "../../../types/bxmlNodes";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { RawFragmentSchema } from "@b5x/types";

/**
 * Example markup for the `rubric` tag.
 */
export const exampleRubricMarkup = `
<rubric for='your-question-id'>
<answer>An answer portion goes here. It's worth 1 point by default.</answer>
<answer>Another answer portion goes here. It's also worth 1 point by default.</answer>
<answer points=2>The last answer portion goes here. It has been configured to be worth 2 points.</answer>
</rubric>
`;

const AnswerTagSchema = z
  .object({
    name: z.literal("answer"),
    type: z.literal("tag"),
    attribs: z
      .object({
        for: z.string().optional(), // TODO Make required
        points: z.string().optional(), // TODO: String attr, but it represents a number. Preprocess this to a number?
      })
      .strict(),
    children: z.array(BxmlTextNodeSchema).length(1),
  })
  .strict();

type AnswerTag = z.infer<typeof AnswerTagSchema>;

const RubricTagSchema = z
  .object({
    name: z.literal("rubric"),
    type: z.literal("tag"),
    attribs: z.object({
      for: z.string(),
      "passing-score": z.string().optional(), // Not actually implemented yet, but allowed in markup
    }),
    children: z.array(AnswerTagSchema),
  })
  .strict();

type RubricTag = z.infer<typeof RubricTagSchema>;

export const RubricDataSchema = z
  .object({
    answers: z
      .array(
        z.object({
          id: z.string(),
          points: z.number(),
          htmlContents: z.string(),
        })
      )
      .min(1),
  })
  .strict();

type RubricData = z.infer<typeof RubricDataSchema>;

export const RubricApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("Rubric"),
  data: RubricDataSchema,
  childUris: z.array(z.string()).length(0),
  isStateful: z.literal(true),
  contents: z.literal(''),
}).strict();

/**
 * The class responsible for building a self-grading interface
 * that appears below a challenge fragment (such as a long text question).
 * `<rubric>` tags contain one or more `<answer>` tags, each of which are
 * worth 1 or more points.
 */
export class Rubric extends FragmentViaBxmlTag {
  // @ts-ignore TODO: Figure out the incompatibility between the types,
  // since the shape of all children involved should still satisfy the generic BxmlNode.
  bxmlNode: RubricTag;
  data: RubricData;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = RubricTagSchema.parse(params.bxmlNode);
    this.data = this.#buildData();
    this.childBxmlNodes = [];
    this.convertToStatefulFragment();
  }

  #buildData() {
    let result: any = {
      answers: [],
    };

    this.bxmlNode.children.forEach((answerTag) => {
      let points = 1;

      if (answerTag.attribs.points !== undefined) {
        points = parseInt(answerTag.attribs.points);
      }

      let answer = {
        htmlContents: this.buildAnswerHtml(answerTag),
        points,
        // @ts-ignore
        id: md5(render(answerTag)),
      };

      result.answers.push(answer);
    });

    return RubricDataSchema.parse(result);
  }

  buildAnswerHtml(answerTag: AnswerTag) {
    let htmlStr = "";
    answerTag.children.forEach((childTag) => {
      // @ts-ignore
      htmlStr += render(childTag);
    });
    return htmlStr;
  }
}

export const manifest = {
  contentType: "Rubric",
  tagName: "rubric",
  exampleMarkupStrings: [exampleRubricMarkup],
  parsingClass: Rubric,
  apiDataSchema: RubricApiDataSchema,
  tagSchema: RubricTagSchema,
};
