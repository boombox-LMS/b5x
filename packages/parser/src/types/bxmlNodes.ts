import { z } from "zod";

// BxmlTextNode -----------------------------------------------------

export const BxmlTextNodeSchema = z.object({
  type: z.literal("text"),
  data: z.string(),
});

/**
 * A subset of domhandler's Text type,
 * for simpler typesafe processing of B-XML text nodes,
 * which contain Markdown or plain text.
 */
export type BxmlTextNode = z.infer<typeof BxmlTextNodeSchema>;

// BxmlRootNode -----------------------------------------------------

/**
 * A subset of domhandler's Document type,
 * for simpler typesafe processing of B-XML root nodes.
 * Root nodes are the top-level tag of a snippet of B-XML.
 */
export interface BxmlRootNode {
  type: "root";
  children: BxmlChildNode[];
  attribs: { [key: string]: string };
}

export const BxmlRootNodeSchema: z.ZodType<BxmlRootNode> = z.lazy(() =>
  z.object({
    type: z.literal("root"),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])),
    attribs: z.record(z.string()),
  })
);

// BxmlTagNode ------------------------------------------------------

/**
 * A subset of domhandler's Element type,
 * for simpler typesafe processing of B-XML tag nodes,
 * which are named tags containing configuration attributes
 * and nested child tags (such as the rubric tag).
 */
export interface BxmlTagNode {
  type: "tag";
  children: BxmlChildNode[];
  attribs: { [key: string]: string | boolean };
  name: string;
}

export const BxmlTagNodeSchema: z.ZodType<BxmlTagNode> = z.lazy(() =>
  z.object({
    type: z.literal("tag"),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])),
    attribs: z.record(z.string()),
    name: z.string(),
  })
);

// BxmlNode / BxmlChildNode -----------------------------------------

/**
 * A B-XML tag or plaintext snippet (usually Markdown text)
 * that has been parsed into a data structure with htmlparser2,
 * then simplified/narrowed into either a BxmlTagNode or a BxmlTextNode.
 */
export type BxmlChildNode = BxmlTagNode | BxmlTextNode;

/**
 * Any possible B-XML node.
 */
export type BxmlNode = BxmlChildNode | BxmlRootNode;

export const BxmlNodeSchema = z.union([
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
  BxmlRootNodeSchema,
]);
