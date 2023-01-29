import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { RawFragmentSchema } from "@b5x/types";

// Markup -----------------------------------------------------------

export const exampleFiveStarRatingMarkup = `
<five-star-rating>
Please rate Boombox:
</five-star-rating>
`;

// Types ------------------------------------------------------------

const FiveStarRatingTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("five-star-rating"),
    attribs: z.object({ id: z.string().optional() }).strict(),
    // TODO: Convert to just allowing plain Markdown? Leaving it for now so the snapshot tests stay useful during refactor.
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])).min(1),
  })
  .strict();

type FiveStarRatingTag = z.infer<typeof FiveStarRatingTagSchema>;

export const FiveStarRatingApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("FiveStarRating"),
  contents: z.literal(""),
  isStateful: z.literal(true),
  childUris: z.array(z.string()).min(1),
  data: z.object({}).strict(),
}).strict();

// Class ------------------------------------------------------------

/**
 * A fragment that renders as a five-star rating.
 */
export class FiveStarRating extends FragmentViaBxmlTag {
  bxmlNode: FiveStarRatingTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = FiveStarRatingTagSchema.parse(params.bxmlNode);
    this.convertToStatefulFragment();
  }
}

export const manifest = {
  contentType: "FiveStarRating",
  tagName: "five-star-rating",
  exampleMarkupStrings: [exampleFiveStarRatingMarkup],
  parsingClass: FiveStarRating,
  apiDataSchema: FiveStarRatingApiDataSchema,
  tagSchema: FiveStarRatingTagSchema,
};
