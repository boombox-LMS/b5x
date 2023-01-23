import { Topic } from "./componentBuilders/Topic";
import fs from "fs";
import path from "path";

const TOPIC_CONFIG_FILENAME = "topic-config.yaml";
const SEEDFILE_DIR = path.resolve(
  __dirname,
  "../../../api/src/db/manager/subwrappers/seeder/defaultTopicFiles"
);

export class BoomboxParser {
  topic: Topic;
  targetDir: string;
  topicDir: string;

  constructor(params: {
    commandDir: string;
    topicSlug: string;
    targetDir?: string;
    topicVersion?: string;
  }) {
    this.topicDir = this.#locateTopicDir({
      commandDir: params.commandDir,
      topicSlug: params.topicSlug,
    });
    if (params.targetDir) {
      this.targetDir = params.targetDir;
    } else {
      this.targetDir = `${this.topicDir}/cli-data/shipped`;
    }
    const topicVersion = params.topicVersion || this.#getNextTopicVersion();
    this.topic = new Topic({
      slug: params.topicSlug,
      version: topicVersion,
      dir: this.topicDir,
    });
  }

  #locateTopicDir(params: { commandDir: string; topicSlug: string }) {
    const splitPath = params.commandDir.split("/");

    // If the topic slug is not in the path, check whether the command was run from the topic's parent directory
    if (!splitPath.includes(params.topicSlug)) {
      if (
        fs.existsSync(
          params.commandDir +
            "/" +
            params.topicSlug +
            "/" +
            TOPIC_CONFIG_FILENAME
        )
      ) {
        return params.commandDir + "/" + params.topicSlug;
        // Otherwise, display an error and exit
        // TODO: Is this the correct approach? Should I actually throw an error instead?
        // It's less cluttered for the user to print than to actually throw.
      } else {
        console.log(
          `ERROR: Cannot find topic directory for slug ${params.topicSlug}. Please only run 'b5x publish ${params.topicSlug}' from within the topic's directory or its parent directory.`
        );
        process.exit();
      }
    }

    // If the topic slug is in the path, trim the path to the topic directory
    const slugIndex = splitPath.indexOf(params.topicSlug);
    return splitPath.slice(0, slugIndex + 1).join("/");
  }

  // TODO: Call the app to get the current version
  // and use input to calculate from there,
  // for now this is just a timestamp to avoid collisions during testing.
  // Actual return value would be a semantic version string, like '1.0.4'.
  #getNextTopicVersion() {
    // TODO: Catch whether anything has changed, if not, do not ship the topic.
    return Math.floor(Date.now() / 1000).toString();
  }

  /**
   *  Write the .b5x file to the appropriate place.
   */
  writeTopicFile() {
    const b5xFilename = `${this.targetDir}/${this.topic.uri}.b5x`;
    const topicDataStr = JSON.stringify(this.topic.packageForApi(), null, 4);
    fs.writeFileSync(b5xFilename, topicDataStr);
  }
}

// for jest
module.exports = {
  BoomboxParser,
};
