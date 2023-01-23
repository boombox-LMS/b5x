import { Topic } from "./componentBuilders/Topic";

export class BoomboxParser {
  topic: Topic;
  topicDir: string;

  constructor(params: {
    topicDir: string;
    topicSlug: string;
    topicVersion?: string;
  }) {
    this.topicDir = params.topicDir;
    const topicVersion = params.topicVersion || this.#getNextTopicVersion();
    this.topic = new Topic({
      slug: params.topicSlug,
      version: topicVersion,
      dir: this.topicDir,
    });
  }

  // TODO: Call the app to get the current version
  // and use input to calculate from there,
  // for now this is just a timestamp to avoid collisions during testing.
  // Actual return value would be a semantic version string, like '1.0.4'.
  #getNextTopicVersion() {
    // TODO: Catch whether anything has changed, if not, do not ship the topic.
    return Math.floor(Date.now() / 1000).toString();
  }
}

// for jest
module.exports = {
  BoomboxParser,
};
