import { Topic } from "./componentBuilders/Topic";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { AuthorCredentials } from "../types";
import path from "path";
import axios from "axios";
import Conf from "conf";
import { globals } from "../config/globals";

const TOPIC_CONFIG_FILENAME = "topic-config.yaml";
const SEEDFILE_DIR = path.resolve(
  __dirname,
  "../../../api/src/db/manager/subwrappers/seeder/defaultTopicFiles"
);

export class BoomboxParser {
  topic: Topic;
  credentials?: AuthorCredentials;
  targetDir: string;
  topicDir: string;

  constructor(params: {
    commandDir: string;
    topicSlug: string;
    credentials?: AuthorCredentials;
    targetDir?: string;
    topicVersion?: string;
  }) {
    this.credentials = params.credentials; // apiUrl, authorEmail, authorKey
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
   *  Send the parsed topic to the API.
   */
  publishTopic() {
    const topic = this.topic;
    // TODO: Mix in credentials, for now API is just unlocked
    const config = new Conf();
    const apiUrl = config.get(globals.API_URL_STORAGE_KEY) + "/topics.publish";
    axios
      .post(apiUrl, topic.packageForApi())
      .then(function (response) {
        console.log("Topic should now be available at:");
        console.log(`http://localhost:3000/topics/${topic.uri}`);
      })
      .catch(function (error) {
        console.log(error);
      });
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

/*

What jobs do we need the parser or some other part of the CLI to do?

- Compare the requested slug to the current directory to make sure they match
- Set the 

*/
