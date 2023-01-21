#! /usr/bin/env node
import { program } from "commander";
import { initTopic } from "./commands/init";
import { buildTopic } from "./commands/build";

program.command("init").description("Create a new topic.").action(initTopic);

program
  .command("build <topicSlug>")
  .description("Build the topic's data and copy it to the clipboard.")
  .action(buildTopic);

program.parse();
