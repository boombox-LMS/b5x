import {
  FragmentViaArgsParams,
  FragmentViaArgsParamsSchema,
} from "../../../types/fragments";
import { Fragment } from "../abstractClasses/Fragment";

/**
 * This class allows a fragment to be created solely via parameters,
 * with no markup tag involved. This is useful in cases when
 * the content-compiling logic requires the programmatic insertion of content,
 * such as automatically inserting an NPS input at the end of a topic
 * when desired.
 */
export class FragmentViaArgs extends Fragment {
  /**
   *  Child fragments should call this constructor function as well
   *  even if they also have their own constructor logic.
   */
  constructor(params: FragmentViaArgsParams) {
    params = FragmentViaArgsParamsSchema.parse(params);
    super(params);
    if (params.isStateful !== undefined) {
      this.isStateful = params.isStateful;
      // require any stateful fragments by default
      if (params.isRequired !== undefined) {
        this.isRequired = params.isRequired;
      } else {
        this.isRequired = true;
      }
      // assume fragment is not stateful by default
    } else {
      this.isStateful = false;
      this.isRequired = false;
    }
  }
}

// TODO: Write dedicated test for FragmentViaArgs
export const manifest = {
  exampleMarkupStrings: [],
};
