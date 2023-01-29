# Boombox LMS

Boombox LMS allows you to build interactive learning experiences using plain text.

For example, this markup:

```
<short-text-question>
What is your name?
</short-text-question>
```

... will display a one-line text input in the user's browser below the prompt "What is your name?".

Boombox LMS can store the user's response, execute conditional logic based on the response content, and more.

# Key advantages

- **Speed**. Teach as fast as you can type. (Or use the built-in VSCode snippets to teach even faster.)
- **Ease of maintenance**. Search for anything, it's all there in the markup. Quickly change any content you want. Ship it with a single command in Terminal. Repeat.
- **Collaboration**. The markup is designed to be as explicit as possible, so subject-matter experts can contribute without needing to learn an LMS.
- **Observability**. Easily monitor the health of a given piece of content. When was it last updated? What issues have been reported? How highly is it rated? How many learners have completed it?
- **Customization**. Display content conditionally based on a learner's answer to a question.
- **Content quality**. Boombox automates the production of fun interactions that would take a long time to build by hand.

# The markup format: B-XML

Boombox markup is just XML markup that upholds four key conventions:

- Interactive, animated, or visual components can be achieved by the supported proprietary XML tags, such as `diagram`, `slideshow`, and `multi-select-question`. Only the supported XML tags are allowed in the markup.
- Markdown is allowed inside of any XML tags that would logically contain user-facing verbiage/images/links etc. This both drastically reduces visual clutter in the file and drastically increases content production speed.
- Each file has an implicit root `<document>` XML tag. Thanks to that implied root tag, a pure Markdown file is valid B-XML. This flattens the content-creation learning curve: start with Markdown, then learn as you go.
- Because HTML is considered valid Markdown, HTML tags are also allowed anywhere Markdown is allowed. In other words: build whatever you want, even if B-XML doesn't have a dedicated XML tag for it.

# WARNING

Boombox authors are the admins of their content; the platform intentionally does not sanitize authored content. Empowering trusted authors is the entire point of the platform.

While Boombox is versatile enough to be used in a wide range of contexts, it was created for the specific use case of internal corporate knowledge-sharing. It's designed for use by the employees of a company, and other contexts involving trust, administrative oversight, and accountability.

**<span style='color: red'>When deployed in a public context with broad authoring permissions, Boombox has major security vulnerabilities _by design_. Simply put: Don't do that.</span>**

# Architecture summary

## Content abstractions

Content is delivered in three layers of abstraction:

- **Topics** are modular units of content. All content is delivered within a topic, even if it's a very short topic.
  - Topics aim to cover an individual subject area, such as "Intro to SQL".
  - Each topic should function independently of other topics, avoiding brittle dependencies such as continuing a particular storyline.
  - Topics can be chained into a series using **prerequisites**, but dependencies are still avoided, since a learner may have existing knowledge that prompts them to skip or skim a prerequisite.
- **Documents** are individual pages (or chapters, if you like) within a topic. They function as modules to break the topic into more manageable pieces.
  - Each document has its own link in the topic's sidebar nav, which serves as the topic's table of contents.
  - Each document has access to data from the other documents in the same topic.
    - For example, document B can be configured to only be shown if the user makes a specific multiple-choice selection in document A. This is true regardless of which one comes first, though it is logically more common for later documents to depend on earlier ones.
- **Fragments** are the most granular level of content; each document is made up of one or more fragments.
  - The number of fragments in a document is largely determined by how many different content types it contains.
    - A short-text question is an individual fragment, as is a multiple-choice question. Each of these fragment types has its own compiling and rendering logic.
  - Fragments are intended to be displayable on their own, independently of the document they belong to. This would be useful in grading flows, analytical dashboards, or other facilitation/administrative contexts that don't exist quite yet.

## Components/packages and their high-level responsibilities

Boombox LMS (invoked in programmatic commands as `b5x`) is a monorepo that contains several Node packages.

Each of the packages below is written in TypeScript, unless otherwise noted.

### @b5x/api

An Express app responsible for receiving, storing, and retrieving content.

[View test coverage report](https://boombox-lms.github.io/b5x/coverage/api)

### @b5x/parser

A library for translating B-XML to topic data.

[View test coverage report](https://boombox-lms.github.io/b5x/coverage/parser)

### @b5x/cli (soon to be deprecated in favor of the VS Code extension)

A command-line tool for creating and compiling topics. This tool is gradually being deprecated, but it's still used for generating seed files for the api (which will be moved to the api),
for populating topic assets into the api, and for debugging the parser (since its output is still more verbose than the VS Code extension).

It doesn't have test coverage, as its code has become minimal and all of its tests were moved to the parser package.

### The `b5x` VS Code extension

This extension is still in development, but it currently allows the user to

- Create a new topic folder containing helpful templates
- Compile topics into data that can be uploaded to the API

It does not yet have test coverage.

### @b5x/viewer

*Note: 'Viewer' is now a bit of misnomer, as the viewer app became responsible for helping users publish content as well. At some point, when the v1 features have settled, this will be renamed.*

A React app that renders content, receives user interactions, and ships updates to the backend (@b5x/api).

The viewer app is written in JavaScript. It will be migrated to TypeScript eventually, but since the viewer's entire purpose is to fetch and render API data, it's most efficient to wait until the fragment designs have fully settled in the other packages.

It does not yet have test coverage.

### @b5x/types - shared by the other components

A module of type definitions that are shared by the other components.

### @b5x/conditions-manager - shared by the other components

A module responsible for creating, modifying, and checking conditions. Conditions can be used to determine whether a user has access to content, how the content should be rendered, etc.

[View test coverage report](https://boombox-lms.github.io/b5x/coverage/conditions-manager)

# Putting it all together: The story of a topic build

*This isn't meant to be a tutorial, just a quick overview of the content-publishing flow. Also, v1 of Boombox LMS doesn't exist yet, so while the vast majority of this functionality exists today, it's still being refactored for launch.*

Let's say that Jen wants to create a new topic, "Intro to Boombox LMS." At a high level, here's how that would happen.

## Initializing a topic

If Jen has the `b5x` VS Code extension installed, she can just right-click in the file explorer and choose "Create new Boombox LMS topic," and follow the prompts to create a new topic folder that contains the correct file structure.

## Editing a topic

From here, Jen has two main tasks:

- Add files to the `documents` folder, one `.md` file per document. The files will be written in XML-enhanced Markdown (aka B-XML). Plain Markdown is fine, or Jen can add tags like `short-text-question` to enhance the content.
- Edit the topic configuration to set access permissions, prerequisites, the cover image, etc.

To see what the final edited result might look like, view the [*Intro to Boombox LMS* example topic directory](code/b5x-cli/example-topics/intro-to-boombox-lms/).

## Publishing a topic

To publish a topic, Jen uses the VS Code extension (right-click the topic folder and choose "Build topic data").

Jen can then paste the topic data into the dropzone at /publish on the viewer app to create a new topic or update an existing one.

## Viewing a topic

Once the topic is published, it can be found in the topic catalog, and also navigated to directly at /topics/intro-to-boombox-lms in the viewer app.

Either way, when the learner launches the topic, they are auto-enrolled in it; the enrollment represents their individual relationship to the topic, and a way to store their challenge responses and other data related to the topic.

A React component has been defined to render each fragment type (example: [the React component that renders the `SingleSelectQuestion` fragment type](code/b5x-viewer/src/features/fragment/SingleSelectQuestion.js)). The viewer app displays each document by rendering one fragment at a time, looking up the appropriate React component for each fragment it encounters.

## Analyzing a topic

The admin dashboards in `@b5x/viewer` are still rudimentary, but eventually, an author should be able to view a full report of topic stats in the viewer app, such as

- How many people enrolled in the topic
- How many people completed the topic (and where everyone else stopped)
- The topic's average NPS score
- The average time taken to complete the topic
- Etc.

## Transitioning from learner to author

On Boombox, every user is an author! Anyone can publish a topic from the /publish page in the viewer app. Learning team members and other leaders can have elevated permissions (such as the ability to assign a topic to someone who reports to them), but anyone can publish to the broader "available" category.