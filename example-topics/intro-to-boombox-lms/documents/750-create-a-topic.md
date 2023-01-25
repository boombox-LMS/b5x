# Create your own topic

Any Boombox LMS user can become an author. Topics published by the user community appear under the "available" category.

You can easily publish your own topic _right now_. Click the button below to get started.

<continue-button>Start publishing flow</continue-button>

<checklist>

<step title='Install the b5x VS Code extension'>
This extension lets you create and compile content inside of VS Code.

There would be a link here, but right now the extension is only available locally.
</step>

<step title='Create your new topic'>
In VS Code, navigate to the directory where you'd like your topic to be created. (The `b5x` extension will create the entire topic for you, including its folder.)

Right-click on the file explorer pane and choose "Create new Boombox LMS topic". Follow the provided prompts to configure your topic with an identifier (used in URLs), title, etc.

You'll know this step has succeeded if ...
- A new folder has been created in the VS Code explorer view.
- You see a "Topic folder created" notification.
- The new folder contains two subfolders, `documents` and `images`, and a `topic-config.yaml` file.
</step>

<step title="Edit your topic's documents">
Make some small changes to the contents of the `documents` folder and save your changes.
</step>

<step title="Compile your topic data">
In VS Code, right-click the topic folder and choose "Build Boombox LMS topic data."

If this step succeeds, you'll see a notification that the topic data has been placed on your clipboard.
</step>

<step title='Publish and view your topic'>
Navigate to [the Publish page](/publish), click the dropzone, and paste your data.

You'll see some options for viewing your topic from there.
</step>
</checklist>
