import { BoomboxParser } from "@b5x/parser";
import path from "path";
import fs from "fs";
import rimraf from "rimraf";
import { publishTopicAssets } from "../commands/build";

/*
TODO: Now that the parser is its own package, the api can actually handle seeding itself
by building the example topics and then publishing them, no .b5x file required
(though the file may still be nice to have for reference / debugging purposes ... maybe
they should be generated as part of parser testing / the parser build process?).
To enable the API to seed itself independently, the example-topics folder 
should be moved up to the top of the workspace, 
and symlinked wherever it's needed (since the parser also relies on the example topics).
*/

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
      topicSlug: topicDirName,
      topicDir: topicDirPath,
      topicVersion: "seed",
    });

    // copy the images to the server's public folder
    publishTopicAssets(parser.topic.uri, topicDirPath + "/images");

    // write the topic data to a .b5x file that can be used for seeding
    const topicDataStr = JSON.stringify(parser.topic.packageForApi(), null, 4);
    const b5xFilename = `${SEEDFILES_DIR}/${parser.topic.uri}.b5x`;
    fs.writeFileSync(b5xFilename, topicDataStr);
  });
}

rimraf(`${SEEDFILES_DIR}/*`, function () {
  syncSeedFiles();
});
