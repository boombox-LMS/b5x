import { RawFragment, SavedFragment } from "@b5x/types";
import {
  NewFragmentExcerpt,
  SavedFragmentExcerpt,
  NewFragmentRef,
} from "./types/fragment";
const crypto = require("crypto");

export class FragmentsDbWrapper {
  knex: any;

  constructor(knex: any) {
    this.knex = knex;
  }

  search(criteria: Object): Promise<SavedFragment[]> {
    return this.knex("fragmentRefs")
      .leftJoin(
        "fragmentExcerpts",
        "fragmentExcerpts.id",
        "fragmentRefs.fragmentExcerptId"
      )
      .select([
        "fragmentRefs.uri AS uri",
        "fragmentExcerpts.contentType",
        "fragmentExcerpts.contents",
        "fragmentExcerpts.data",
        "fragmentExcerpts.isStateful",
        "fragmentRefs.isRequired",
        "fragmentRefs.displayConditions",
        "fragmentRefs.dependencyUris",
        "fragmentRefs.address",
        "fragmentRefs.documentUri",
      ])
      .where(criteria);
  }

  async destroy() {
    return true;
  }

  // TODO: Update to use a RawFragment, not a NewFragment,
  // to keep the stringifying logic inside the write function
  async insertAll(rawFragments: RawFragment[]): Promise<SavedFragment[]> {
    const newFragmentExcerptsToInsert: NewFragmentExcerpt[] = [];
    const rawFragmentsByUri: Record<string, RawFragment> = {};
    const fragmentContentDigests: string[] = [];

    // build the excerpts and RawFragment lookup indexes
    rawFragments.forEach((rawFragment) => {
      const newFragmentExcerpt = this.#extractExcerptFromFragment(rawFragment);
      newFragmentExcerptsToInsert.push(newFragmentExcerpt);
      fragmentContentDigests.push(newFragmentExcerpt.digest);
      rawFragmentsByUri[rawFragment.uri] = rawFragment;
    });

    // insert the excerpts
    await this.#insertMissingFragmentExcerpts(newFragmentExcerptsToInsert);

    // retrieve all relevant excerpt IDs
    const relevantExcerpts: SavedFragmentExcerpt[] = await this.knex(
      "fragmentExcerpts"
    ).whereIn("digest", fragmentContentDigests);
    const excerptIdsByDigest: Record<string, number> = {};
    relevantExcerpts.forEach((excerpt) => {
      excerptIdsByDigest[excerpt.digest] = excerpt.id;
    });

    // build the references
    const newFragmentRefsToInsert: NewFragmentRef[] = [];

    Object.keys(rawFragmentsByUri).forEach((uri) => {
      const newFragment = rawFragmentsByUri[uri];
      newFragmentRefsToInsert.push({
        uri,
        documentUri: newFragment.documentUri,
        displayConditions: JSON.stringify(newFragment.displayConditions),
        dependencyUris: JSON.stringify(newFragment.dependencyUris),
        childUris: JSON.stringify(newFragment.childUris),
        // TODO: This is a little awkward, seems like we could do better with
        // a more thoughtful data structure for storing all the stuff we need to refer back to?
        fragmentExcerptId:
          excerptIdsByDigest[
            this.#extractExcerptFromFragment(newFragment).digest
          ],
        isRequired: newFragment.isRequired,
      });
    });

    const savedFragments: SavedFragment[] = [];

    // insert the references and build the saved fragments
    await this.knex("fragmentRefs")
      .returning(["uri", "fragmentExcerptId"])
      .insert(newFragmentRefsToInsert)
      .then((rows: { uri: string; fragmentExcerptId: number }[]) => {
        rows.forEach((row) => {
          savedFragments.push({
            ...rawFragmentsByUri[row.uri],
            fragmentRefUri: row.uri,
            fragmentExcerptId: row.fragmentExcerptId,
          });
        });
      })
      .catch((e: any) => {
        console.error(e);
      });

    // return the expanded fragments
    return savedFragments;
  }

  /**
   *  Given an array of fragmentExcerpts, insert any into the database
   *  that haven't already been created
   */
  #insertMissingFragmentExcerpts(
    fragmentExcerptsToInsert: NewFragmentExcerpt[]
  ): Promise<{ id: number; digest: string }[]> {
    return this.knex
      .raw(
        `? ON CONFLICT (digest)
        DO NOTHING
        RETURNING id, digest;`,
        [this.knex("fragmentExcerpts").insert(fragmentExcerptsToInsert)]
        // The result includes more data than its assigned type shows,
        // but typically we just refer to the rows.
      )
      .then((result: { rows: { id: number; digest: string }[] }) => {
        return result.rows;
      })
      .catch((e: any) => {
        console.error(e);
      });
  }

  /**
   *  Extract the reusable content from fragments,
   *  so that fragments with identical content
   *  can save disk space by referring to the same content.
   *  This allows for efficiency in storing additional versions
   *  of the same topic (since only the diff will be re-stored).
   */
  #extractExcerptFromFragment(fragment: RawFragment) {
    // TODO: I think this digest is different than the full fragment
    // digest that is put on by the CLI, but I need to verify ...
    // I think I did the full fragment digest for verification purposes
    const digestString = `${JSON.stringify([
      fragment.isStateful,
      fragment.data,
      fragment.contentType,
      fragment.contents,
    ])}`;
    // TODO: Learn whether there's a better approach to a uniqueness digest
    const contentDigest = crypto
      .createHash("sha256")
      .update(digestString)
      .digest("base64");

    let excerpt: NewFragmentExcerpt = {
      digest: contentDigest,
      contents: fragment.contents,
      data: JSON.stringify(fragment.data),
      contentType: fragment.contentType,
      isStateful: fragment.isStateful,
    };

    return excerpt;
  }
}
