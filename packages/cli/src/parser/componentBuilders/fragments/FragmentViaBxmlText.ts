import { Fragment } from "./Fragment";
import { render } from "dom-serializer";
const htmlparser2 = require("htmlparser2");
import { marked } from "marked";
import { BxmlChildNode } from "../../../types/bxmlNodes";
import { FragmentCombinationResult } from "../../../types/fragments";
const _ = require("lodash");

const COMPATIBLE_FRAGMENT_TYPES = [
  "HtmlContent",
  "TemplatedHtmlContent",
  "Echo",
];

/**
 * The class responsible for parsing vanilla Markdown content
 * into HTML. To reduce the complexity of a topic's content,
 * adjacent FragmentViaMarkdown/TemplatedHtmlContent fragments
 * can be combined with one another as long as they are compatible
 * (identical display conditions, etc).
 */
export class FragmentViaBxmlText extends Fragment {
  contentType: "HtmlContent" | "MarkdownContent"; // MarkdownContent initially, HtmlContent with final processing
  bxmlNode: BxmlChildNode;

  // @ts-ignore
  constructor(params) {
    super(params);
    this.bxmlNode = params.bxmlNode;
    this.contentType = "MarkdownContent";
    /**
     * Whether the contents include a templated-value tag.
     */
    if (params.data && "isTemplated" in params.data) {
      this.data.isTemplated = params.data.isTemplated;
    } else {
      this.data.isTemplated = false;
    }

    this.contents = this.#buildContents(params);

    this.combinesWith = {
      MarkdownContent: {
        combinationCallback: function (
          externalFragment: Fragment,
          thisFragment: Fragment,
          fragmentCombinationResult: FragmentCombinationResult
        ): FragmentCombinationResult {
          const result = fragmentCombinationResult;
          return {
            ...result,
            data: {
              ...result.data,
              isTemplated:
                externalFragment.data.isTemplated ||
                thisFragment.data.isTemplated ||
                externalFragment.contentType === "Echo",
            },
            contentType: "MarkdownContent",
          };
        },
      },
      Echo: {
        combinationCallback: function (
          externalFragment: Fragment,
          thisFragment: Fragment,
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
  }

  // @ts-ignore
  #buildContents(params) {
    if (params.contents) {
      return params.contents;
    }

    let contents = "";

    if (this.bxmlNode.type === "text") {
      return this.bxmlNode.data;
    }

    this.bxmlNode.children.forEach((childBxmlNode) => {
      if (childBxmlNode.type === "text") {
        contents += childBxmlNode.data;
        // keep the templated-value tag intact if it's there
      } else if (childBxmlNode.type === "tag") {
        // @ts-ignore
        contents += render(childBxmlNode);
      }
    });

    return contents;
  }

  /**
   * Converts any Markdown contents to the final HTML in order to ship to the API.
   */
  get finalizedContents() {
    // Replace simple image urls with full API image urls.
    // Some of this logic is temporary, since this will eventually be an S3 bucket.
    const globalMarkdownImageRegex = /!\[.*\]\((.*)\)/gm;
    const singleMarkdownImageRegex = /!\[.*\]\((.*)\)/;
    const matches = this.contents.match(globalMarkdownImageRegex);
    if (matches) {
      matches.forEach((markdownImageText) => {
        const match = markdownImageText.match(singleMarkdownImageRegex);
        // @ts-ignore, already validated by the global regex
        const imageUrl = match[1];
        if (!/http/.test(imageUrl)) {
          const newMarkdownImageText = markdownImageText.replace(
            imageUrl,
            `http://localhost:8080/topic-assets/${this.document.topic.uri}/images/${imageUrl}`
          );
          // @ts-ignore
          this.contents = this.contents.replace(
            markdownImageText,
            newMarkdownImageText
          );
        }
      });
    }
    // convert Markdown to HTML
    const html = marked.parse(this.contents);
    this.contentType = "HtmlContent";
    return html;
  }
}

// for jest
module.exports = {
  FragmentViaBxmlText,
};
