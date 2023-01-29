// Get all the filenames in the parsingClasses directory
const fs = require("fs");
const path = require("path");
const parsingClassFolderFilenames = fs.readdirSync(path.resolve(__dirname, "../../../dist/componentBuilders/fragments/parsingClasses"));
const parsingClassFiles = parsingClassFolderFilenames.filter(filename => new RegExp(/.*.js/).test(filename));

describe("placeholder", () => { 
  parsingClassFiles.forEach(filename => {
    const { manifest } = require(`../../../dist/componentBuilders/fragments/parsingClasses/${filename}`);
    if (!manifest) {
      console.warn(`No manifest found for ${filename}, skipping parsing test for this fragment.`)
    } else {
      // parse each example markup string and test it against its api data schema
      manifest.exampleMarkupStrings.forEach((exampleMarkupString, index) => {
        test(`The example ${manifest.tagName} markup string at index ${index} matches the corresponding api data schema`, () => {
          const parsedMarkup = global.buildFragmentFromMarkupString(exampleMarkupString).packageForApi();
          const validator = () => { manifest.apiDataSchema.parse(parsedMarkup) };
          expect(validator).not.toThrowError();
          expect(parsedMarkup).toMatchSnapshot();
        });
      })
    }
  })
});