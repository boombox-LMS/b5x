import { BoomboxParser } from "@b5x/parser";
import path from "path";
import fs from "fs";
import rimraf from "rimraf";
import { publishTopicAssets } from "../commands/build";

const SEEDFILES_DIR = path.resolve(
  __dirname,
  "../../../api/src/db/manager/subwrappers/seeder/defaultTopicFiles"
);
const EXAMPLE_TOPICS_DIR = path.resolve(__dirname, "../../example-topics");

async function syncSeedFiles() {
  const topicDirNames = fs.readdirSync(EXAMPLE_TOPICS_DIR);

  topicDirNames.forEach((topicDirName) => {
    const topicDirPath = `${EXAMPLE_TOPICS_DIR}/${topicDirName}`;
    const parser = new BoomboxParser({
      commandDir: topicDirPath,
      topicSlug: topicDirName,
      targetDir: SEEDFILES_DIR,
      topicVersion: "seed",
    });
    publishTopicAssets(parser.topic.uri, parser.topicDir + "/images");
    parser.writeTopicFile();
  });
}

rimraf(`${SEEDFILES_DIR}/*`, function () {
  syncSeedFiles();
});
