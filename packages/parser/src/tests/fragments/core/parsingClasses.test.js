// Get all the filenames in the parsingClasses directory
const fs = require("fs");
const path = require("path");
const parsingClassFolderFilenames = fs.readdirSync(
  `${global.DIST_PATH}/componentBuilders/fragments/parsingClasses`
);
const parsingClassFiles = parsingClassFolderFilenames.filter((filename) =>
  new RegExp(/.*.js/).test(filename)
);

describe("Each parsing class parses its own example markup correctly", () => {
  parsingClassFiles.forEach((filename) => {
    const {
      manifest,
    } = require(`${global.DIST_PATH}/componentBuilders/fragments/parsingClasses/${filename}`);
    if (!manifest) {
      console.warn(
        `No manifest found for ${filename}, skipping parsing test for this fragment.`
      );
    } else {
      // parse each example markup string and test it against its api data schema
      manifest.exampleMarkupStrings.forEach((exampleMarkupString, index) => {
        test(`The example ${manifest.tagName} markup string at index ${index} matches the corresponding api data schema`, () => {
          const parsedMarkup = global
            .buildFragmentFromMarkupString(exampleMarkupString)
            .packageForApi();
          const validator = () => {
            manifest.apiDataSchema.parse(parsedMarkup);
          };
          expect(validator).not.toThrowError();
        });
      });
    }
  });
});
