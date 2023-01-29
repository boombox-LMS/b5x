import * as fs from "fs";
import * as path from "path";

export function listTopicFolders(dir: string) {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = dir + "/" + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(listTopicFolders(file));
    } else {
      let fileName = file.split(/(\\|\/)/g).pop();
      if (fileName === "topic-config.yaml") {
        results.push(dir);
      }
    }
  });
  return [...new Set(results)];
}

// Thanks, Simon Zyx on Stack Overflow:
// https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
export const copyFileSync = (source: string, target: string) => {
  let targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
};

export const copyFolderRecursiveSync = (source: string, target: string) => {
  let files = [];

  // Check if folder needs to be created or integrated
  let targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file: string) {
      let curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
};
