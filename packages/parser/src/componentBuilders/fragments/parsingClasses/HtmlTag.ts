import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { BxmlTextNodeSchema } from "../../../types/bxmlNodes";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { RawFragmentSchema } from "@b5x/types";

// Markup -----------------------------------------------------------

export const exampleHtmlTagMarkup = `
<html>
<iframe src="https://player.vimeo.com/video/15069551?h=d7a440a3ca" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
<p><a href="https://vimeo.com/15069551">The Unseen Sea</a> from <a href="https://vimeo.com/simonchristen">Simon Christen</a> on <a href="https://vimeo.com">Vimeo</a>.</p>
</html>
`;

// Types ------------------------------------------------------------

const HtmlBxmlTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("html"),
    attribs: z.object({}).strict(),
    children: z.array(BxmlTextNodeSchema).length(1),
  })
  .strict();

type HtmlBxmlTag = z.infer<typeof HtmlBxmlTagSchema>;

export const HtmlTagApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("HtmlTag"),
  contents: z.string(),
  data: z.object({}).strict(),
  isRequired: z.literal(false),
  isStateful: z.literal(false),
  childUris: z.array(z.any()).length(0),
}).strict();

// Class ------------------------------------------------------------

/**
 * A fragment that contains raw HTML inputted directly by the topic author,
 * to be rendered verbatim in the browser.
 */
export class HtmlTag extends FragmentViaBxmlTag {
  bxmlNode: HtmlBxmlTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super({ ...params, contentType: "HtmlTag" });
    this.bxmlNode = HtmlBxmlTagSchema.parse(params.bxmlNode);
    this.contents = this.bxmlNode.children[0].data.trim();
    this.childBxmlNodes = [];
  }
}

export const manifest = {
  contentType: "HtmlTag",
  tagName: "html",
  parsingClass: HtmlTag,
  exampleMarkupStrings: [exampleHtmlTagMarkup],
  tagSchema: HtmlBxmlTagSchema,
  apiDataSchema: HtmlTagApiDataSchema,
};
