import { render } from "dom-serializer";
import {
  FragmentViaBxmlTagParams,
  FragmentCombinationResult,
} from "../../../types/fragments";
import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { BxmlTextNodeSchema } from "../../../types/bxmlNodes";
import { Fragment } from "../abstractClasses/Fragment";
import { z } from "zod";
import { RawFragmentSchema } from "@b5x/types";

// Markup -----------------------------------------------------------

export const exampleEchoMarkup = `
<echo>my-user-inputted-value</echo>
`;

// Types ------------------------------------------------------------

const EchoTagSchema = z
  .object({
    name: z.literal("echo"),
    type: z.literal("tag"),
    attribs: z.object({}).strict(),
    children: z.array(BxmlTextNodeSchema).length(1),
  })
  .strict();

type EchoTag = z.infer<typeof EchoTagSchema>;

export const EchoDataSchema = z
  .object({
    fragmentUrisByAlias: z
      .record(z.union([z.string(), z.null()]))
      .refine((val) => {
        return Object.keys(val).length === 1;
      }),
  })
  .strict();

type EchoData = z.infer<typeof EchoDataSchema>;

export const EchoApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("Echo"),
  contents: z.string().min(1),
  isRequired: z.literal(false),
  isStateful: z.literal(false),
  childUris: z.array(z.string()).length(0),
  data: EchoDataSchema,
}).strict();

// Class ------------------------------------------------------------

/**
 * The class responsible for processing Markdown that contains
 * a templated value tag.
 */
export class Echo extends FragmentViaBxmlTag {
  bxmlNode: EchoTag;
  data: EchoData;

  // TODO: Figure out which fragments actually require a tag
  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = EchoTagSchema.parse(params.bxmlNode);
    this.data = this.#buildData(this.bxmlNode);

    this.combinesWith = {
      MarkdownContent: {
        combinationCallback: function (
          externalFragment: Fragment,
          fragmentCombinationResult: FragmentCombinationResult
        ): FragmentCombinationResult {
          const result = fragmentCombinationResult;
          return {
            ...result,
            data: { ...result.data, isTemplated: true },
            contentType: "MarkdownContent",
          };
        },
      },
    };

    // @ts-ignore
    this.contents = render(this.bxmlNode);
    this.childBxmlNodes = [];
  }

  #buildData(bxmlNode: EchoTag) {
    const fragmentAlias = bxmlNode.children[0].data;
    let result: any = {
      fragmentUrisByAlias: {},
    };
    result.fragmentUrisByAlias[fragmentAlias] = null;
    return EchoDataSchema.parse(result);
  }
}

export const manifest = {
  contentType: "Echo",
  tagName: "echo",
  exampleMarkupStrings: [exampleEchoMarkup],
  parsingClass: Echo,
  tagSchema: EchoTagSchema,
  apiDataSchema: EchoApiDataSchema,
};
