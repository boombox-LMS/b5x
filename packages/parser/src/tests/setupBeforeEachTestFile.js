const {
  FragmentBuilder,
} = require("../../dist/componentBuilders/FragmentBuilder");
const htmlparser2 = require("htmlparser2");
const { coerceToBxmlNode } = require("../../dist/types/nodeCoercion");

global.buildFragmentFromMarkupString = (
  markupStr,
  uri = "test-fragment-uri"
) => {
  // prep + parse markup string
  const markup = markupStr.trim();
  const domElement = htmlparser2.parseDocument(markup, { xmlMode: true });
  let bxmlNode = coerceToBxmlNode(domElement);

  // pop off automatically added root tag
  bxmlNode = bxmlNode.children[0];

  // mock the document properties required by the fragment builder
  const mockDocument = {
    uri: "mock-document-uri",
    topic: { uri: "mock-topic-uri" },
  };
  
  // recursively build the fragment
  return buildFragment(uri, bxmlNode, mockDocument);
};

function buildFragment(uri, bxmlNode, document) {
  const fragment = new FragmentBuilder({
    uri,
    bxmlNode,
    document,
  }).build();
  fragment.childBxmlNodes.forEach(childBxmlNode => {
    fragment.childFragments.push(buildFragment(uri, childBxmlNode, document))
  })
  return fragment;
}