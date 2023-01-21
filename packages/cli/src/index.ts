#! /usr/bin/env node
import { program } from "commander";
import { initTopic } from "./commands/init";
import { draftTopic } from "./commands/draft";
import { publishTopic } from "./commands/publish";
import { plaintext } from "./commands/plaintext";
import {
  displayComponentUsage,
  copyComponentTemplateToClipboard,
} from "./commands/componentUsage";
import { reorderTopic } from "./commands/reorder";
import { login, logout } from "./commands/session";
import { buildTopic } from "./commands/build";

program
  .command("login")
  .description("Authenticate yourself as a Boombox user.")
  .action(login);

program.command("logout").description("Log out of Boombox.").action(logout);

program.command("init").description("Create a new topic.").action(initTopic);

program
  .command("build <topicSlug>")
  .description("Build the topic's data and copy it to the clipboard.")
  .action(buildTopic);

// TODO: Finish full functionality
program
  .command("plaintext <topicSlug>")
  .description(
    "Generate a plaintext version of a given topic. This can (for example) be uploaded into Google docs to create a review copy for nontechnical collaborators."
  )
  .action(plaintext);

// TODO: Finish full functionality
program
  .command("draft <topicSlug>")
  .description(
    "Publish a draft version of a topic for previewing by eligible users. Draft topics are not listed in the catalog."
  )
  .action(draftTopic);

program
  .command("publish <topicSlug>")
  .description(
    "Publish a live version of a topic that will be listed in the catalog for eligible users."
  )
  .action(publishTopic);

program
  .command("reorder <topicSlug>")
  .description(
    "Reorder the documents in a topic so the filenames start with '00-', '01-', '02-', etc. Useful when the repeated insertion of new documents has resulted in irregular filenames like '0010-my-doc', '00211-my-doc', etc."
  )
  .action(reorderTopic);

program
  .command("usage [componentName]")
  .description("Display usage documentation for a given component.")
  .action(displayComponentUsage);

program
  .command("copy <componentName>")
  .description(
    "Copy the template for a given content component to the clipboard."
  )
  .action(copyComponentTemplateToClipboard);

program.parse();
