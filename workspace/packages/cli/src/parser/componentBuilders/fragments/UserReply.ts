import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { z } from "zod";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";

// Markup -----------------------------------------------------------

export const exampleUserReplyMarkup = `
<user-reply>I'm ready. Launch the challenge!</user-reply>
`;

// Types ------------------------------------------------------------

const UserReplyTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("user-reply"),
    attribs: z.object({}).strict(),
    // TODO: Convert to just allowing plain Markdown? Leaving it for now so the snapshot tests stay useful during refactor.
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])).min(1),
  })
  .strict();

type UserReplyTag = z.infer<typeof UserReplyTagSchema>;

// Class ------------------------------------------------------------

/**
 * A fragment that renders a button blocking subsequent content from loading until the user clicks it.
 */
export class UserReply extends FragmentViaBxmlTag {
  bxmlNode: UserReplyTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = UserReplyTagSchema.parse(params.bxmlNode);
    this.convertToStatefulFragment();
  }
}
