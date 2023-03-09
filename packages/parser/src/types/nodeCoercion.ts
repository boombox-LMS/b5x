/**
 * The nodes created by htmlparser2 have circular references in them,
 * which are incompatible with Zod and make logging verbose.
 *
 * For Boombox's purposes, it's helpful to narrow each instance
 * of AnyNode into a tag (BxmlTagNode) or text (BxmlTextNode).
 * Once each piece of data is narrowed (removing circular references),
 * it can be properly validated by Zod, allowing for simpler,
 * more typesafe code throughout @b5x/cli's logic.
 *
 * It also allows for extensive validation of user markup,
 * since Zod allows us to define and validate *exactly* what we expect
 * to encounter inside the parsed markup of a given tag
 * (and more importantly what we never expected!).
 */

import {
  // Avoiding confusing type names /
  // naming clashes with the local Document class
  Document as DomHandlerDocument,
  Element as DomHandlerElement,
  Text as DomHandlerText,
  AnyNode as DomHandlerAnyNode,
} from "domhandler";

import {
  BxmlNode,
  BxmlNodeSchema,
  BxmlRootNode,
  BxmlRootNodeSchema,
  BxmlChildNode,
  BxmlTagNode,
  BxmlTagNodeSchema,
  BxmlTextNode,
  BxmlTextNodeSchema,
} from "./bxmlNodes";

import domSerializer from "dom-serializer";

const removeWhitespaceBetweenTags = (bxmlNode: BxmlNode) => {
  let filteredChildren: BxmlChildNode[] = [];

  // text nodes don't have any tag children,
  // so they have no whitespace that needs to be removed
  if (bxmlNode.type === "text") {
    return bxmlNode;
  }

  bxmlNode.children.forEach((childBxmlNode, i) => {
    // if it's a tag node, recursively remove the white space between it child tags,
    // then add it to the filtered children
    if (childBxmlNode.type === "tag") {
      // @ts-ignore  TODO: Some kind of issue with recognizing a BxmlChildNode as a BxmlNode,
      // maybe something is off with the Zod types?
      filteredChildren.push(removeWhitespaceBetweenTags(childBxmlNode));
      return;
    }

    // otherwise, if it's white space sitting between two tags,
    // or leading/trailing whitespace next to a beginning/ending tag,
    // skip adding it to the processed BxmlNode
    const prevNode = bxmlNode.children[i - 1];
    const nextNode = bxmlNode.children[i + 1];
    const isBetweenTags =
      prevNode &&
      prevNode.type === "tag" &&
      nextNode &&
      nextNode.type === "tag";
    const isOnlyChild = !prevNode && !nextNode;
    const isLeadingOrTrailingWhitespace =
      (!nextNode && prevNode && prevNode.type === "tag") ||
      (!prevNode && nextNode && nextNode.type === "tag");
    const isWhitespaceOnlyContent = childBxmlNode.data.trim() === "";
    if (
      (isBetweenTags || isLeadingOrTrailingWhitespace || isOnlyChild) &&
      isWhitespaceOnlyContent
    ) {
      return;
    }

    // otherwise, preserve the text node in the content tree
    filteredChildren.push(childBxmlNode);
  });

  bxmlNode.children = filteredChildren;
  return bxmlNode;
};

/**
 * Creates a narrowed version of DomElement that has been validated against
 * the appropriate Zod schema, so it can safely be parsed
 * by that schema later if desired.
 */
export const coerceToBxmlTextNode = (
  textNode: DomHandlerText
): BxmlTextNode => {
  // transform it
  const parsedTextNode = {
    data: textNode.data,
    type: textNode.type,
  };
  // validate and return it
  return BxmlTextNodeSchema.parse(parsedTextNode);
};

/**
 * Creates a narrowed version of DomElement that has been validated against
 * the appropriate Zod schema, so it can safely be parsed
 * by that schema later if desired.
 */
export const coerceToBxmlRootNode = (
  element: DomHandlerDocument
): BxmlRootNode => {
  let bxmlRootNode: BxmlRootNode = {
    attribs: {}, // TODO: Remove this entirely, since DomHandlerDocuments don't have attribs. Also, for simplicity, maybe eventually just wrap everything in a root tag and pop it back off to parse?
    type: "root",
    children: [],
  };

  // validate and reattach the DomElement's children, if any
  if (element.children) {
    element.children.forEach((childNode) => {
      const coercedChildNode = coerceToBxmlNode(
        childNode as DomHandlerAnyNode
      ) as BxmlChildNode;
      bxmlRootNode.children.push(coercedChildNode);
    });
  }

  bxmlRootNode = removeWhitespaceBetweenTags(bxmlRootNode) as BxmlRootNode;
  return BxmlRootNodeSchema.parse(bxmlRootNode);
};

/**
 * Creates a narrowed version of DomElement that has been validated against
 * the appropriate Zod schema, so it can safely be parsed
 * by that schema later if desired.
 */
export const coerceToBxmlTagNode = (
  element: DomHandlerElement
): BxmlTagNode => {
  if (element.type !== "tag") {
    throw new Error(`Unsupported element type: ${element.type}`);
  }

  let bxmlTagNode: BxmlTagNode = {
    attribs: element.attribs || {},
    type: element.type,
    name: element.name,
    children: [],
  };

  // if it's a code block, compress its children to one
  // child node containing the entire code block's content,
  // no recursive parsing needed
  if ("name" in element && element.name === "code-block") {
    bxmlTagNode.children.push({
      type: "text",
      data: domSerializer(element.childNodes),
    });
  }
  // validate and reattach the DomElement's children, if any
  else if (element.children) {
    element.children.forEach((childElement) => {
      const childNode = coerceToBxmlNode(childElement) as BxmlChildNode;
      bxmlTagNode.children.push(childNode);
    });
  }

  // validate and return the final result
  bxmlTagNode = removeWhitespaceBetweenTags(bxmlTagNode) as BxmlTagNode;
  return BxmlTagNodeSchema.parse(bxmlTagNode);
};

/**
 * Recursively validate, simplify, and rebuild
 * an htmlparser2-parsed item,
 * narrowing it to a BxmlNode.
 */
export const coerceToBxmlNode = (node: DomHandlerAnyNode): BxmlNode => {
  if (node.type === "text") {
    const result = coerceToBxmlTextNode(node);
    return BxmlNodeSchema.parse(result);
  } else if (node.type === "tag") {
    const result = coerceToBxmlTagNode(node);
    return BxmlNodeSchema.parse(result);
  } else if (node.type === "root") {
    const result = coerceToBxmlRootNode(node);
    return BxmlNodeSchema.parse(result);
  } else {
    console.log(node);
    throw new Error(
      `Cannot coerce above node: the node has an unrecognized type`
    );
  }
};
