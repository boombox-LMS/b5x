const COMPONENT_TEMPLATE_DIR = __dirname + "/../templates/components";
import fs from "fs";

export const displayComponentUsage = (componentName: string) => {
  if (!componentName) {
    printAvailableComponentList();
  } else {
    printComponentInfo(componentName);
  }
};

function printAvailableComponentList() {
  console.log("\nAvailable components are:");
  const availableComponents = getAvailableComponentList();
  availableComponents.forEach((componentName) => {
    console.log(`- ${componentName}`);
  });
  console.log(
    "\nTo view usage instructions, use the command `b5x usage <componentName>`.\n\nEXAMPLE:\nb5x usage short-text-question\n"
  );
}

function getAvailableComponentList() {
  return fs.readdirSync(COMPONENT_TEMPLATE_DIR).filter(function (file) {
    return fs.statSync(COMPONENT_TEMPLATE_DIR + "/" + file).isDirectory();
  });
}

function getComponentDoc(componentName: string) {
  const docsFilename = COMPONENT_TEMPLATE_DIR + `/${componentName}/README.txt`;
  return fs.readFileSync(docsFilename).toString();
}

function getComponentTemplate(componentName: string) {
  const templateFilename =
    COMPONENT_TEMPLATE_DIR + `/${componentName}/template.txt`;
  return fs.readFileSync(templateFilename).toString();
}

function printComponentInfo(componentName: string) {
  const componentDoc = getComponentDoc(componentName);
  const componentTemplate = getComponentTemplate(componentName);
  console.log("\r");
  console.log(componentDoc);
  console.log("\nTEMPLATE\n");
  console.log(componentTemplate);
  console.log(
    `\nTo copy the above template to your clipboard, use \`b5x copy ${componentName}\`.\n`
  );
}

export const copyComponentTemplateToClipboard = (componentName: string) => {
  var proc = require("child_process").spawn("pbcopy");
  proc.stdin.write(getComponentTemplate(componentName));
  proc.stdin.end();
  console.log(`Template for ${componentName} copied to clipboard.`);
};
