import { pascalcase } from "stringcase";
import { render } from "dom-serializer";
import { marked } from "marked";
import { Fragment } from "./Fragment";
import { BxmlNode, BxmlTagNode } from "../../../types/bxmlNodes";
import {
  FragmentViaBxmlTagParams,
  FragmentViaBxmlTagParamsSchema,
} from "../../../types/fragments";
import { FragmentContentType, FragmentContentTypeSchema } from "@b5x/types";

/**
 * The abstract class for building a content fragment
 * from a B-XML tag. It usually won't be instantiated directly,
 * since B-XML fragments tend to have their own unique build step.
 */
export class FragmentViaBxmlTag extends Fragment {
  bxmlNode: BxmlTagNode;
  contentType: FragmentContentType;

  /**
   *  Child fragments should call this constructor function as well
   *  even if they also have their own constructor logic.
   */
  constructor(params: FragmentViaBxmlTagParams) {
    params = FragmentViaBxmlTagParamsSchema.parse(params);
    super(params);
    this.contents = "";
    this.bxmlNode = params.bxmlNode;
    this.contentType = params.contentType || this.#detectContentType();
    this.bxmlNode.children.forEach((childBxmlNode) => {
      if (!("name" in childBxmlNode) || childBxmlNode.name !== "config") {
        // TODO: Hoist config later, or just kill it at the fragment level
        this.childBxmlNodes.push(childBxmlNode);
      }
    });
  }

  #detectContentType(): FragmentContentType {
    return FragmentContentTypeSchema.parse(pascalcase(this.bxmlNode.name));
  }

  // TODO: Is this actually getBxmlNodeAsMarkupString? (in which case the param should be bxmlNode?)
  // Is it also supposed to work for HTML, or is that rendered separately?
  // does it belong in the top level fragment?
  // should the top level fragment have a tag property of DomElement | undefined?
  getTagAsHtmlString(node: BxmlNode) {
    let contents = "";

    // Base case 1: Childless tag
    if (node.type !== "text" && node.children.length === 0) {
      return contents;
    }

    // Base case 2: Plain Markdown text
    if (node.type === "text") {
      contents += marked.parse(node.data);
    }

    // Recursive case: Tag with children
    if ("name" in node) {
      contents += `<${node.name}>`;
      node.children.forEach((childTag) => {
        contents += this.getTagAsHtmlString(childTag);
      });
      contents += `</${node.name}>`;
    }

    return contents;
  }

  get rawContents() {
    // @ts-ignore TODO: a B5xTagElement is a valid AnyNode,
    // but need to find the AnyNode datatype to import, and then cast to it here,
    // so TS will be happy
    return render(this.bxmlNode);
  }
}
