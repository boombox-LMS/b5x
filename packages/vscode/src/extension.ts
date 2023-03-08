import * as vscode from "vscode";
import { buildTopicConfig, createTopicFolder } from "./topicCreation";
import { listTopicFolders } from "./fsHelpers";
import { BoomboxParser } from "@b5x/parser";

/**
 * Return an array of folder URIs
 * representing all of the topic folders in the workspace.
 */
function scanWorkspaceForTopicFolders() {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }
  const rootFolderUri = vscode.workspace.workspaceFolders[0].uri;
  const topicFolders = listTopicFolders(rootFolderUri.fsPath);
  vscode.commands.executeCommand(
    "setContext",
    "b5x.topicFolders",
    topicFolders
  );
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  scanWorkspaceForTopicFolders();

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  let createNewTopic = vscode.commands.registerCommand(
    "b5x.createNewTopic",
    async (resourceUri) => {
      const topicConfig = await buildTopicConfig().catch((e: any) => {
        throw e;
      });
      createTopicFolder(resourceUri.fsPath, topicConfig);
      scanWorkspaceForTopicFolders();
      vscode.window.showInformationMessage("Topic folder created.");
    }
  );

  let buildTopic = vscode.commands.registerCommand(
    "b5x.buildTopicData",
    (resourceUri: vscode.Uri) => {
      const topicSlug = resourceUri.fsPath.split("/").slice(-1)[0];
      // TODO: How to handle syntax errors? Should those be validated before this runs?
      // The parser could have a validation function that returns friendly errors,
      // but ultimately it would be best to show those errors live in the editor.
      const parser = new BoomboxParser({
        topicDir: resourceUri.fsPath,
        topicSlug,
      });
      const topicDataStr = JSON.stringify(
        parser.topic.packageForApi(),
        null,
        2
      );
      vscode.env.clipboard.writeText(topicDataStr).then(() => {
        vscode.window.showInformationMessage(
          "Topic data compiled and copied to clipboard."
        );
      });
    }
  );

  context.subscriptions.push(createNewTopic);
  context.subscriptions.push(buildTopic);
}

// This method is called when your extension is deactivated
export function deactivate() {}
