# Create your own topic

Any Boombox LMS user can become an author. Topics published by the user community appear under the "available" category.

You can easily publish your own topic _right now_. Click the button below to get started.

<user-reply>Start publishing flow</user-reply>

<checklist>

<step title='Install the Boombox CLI'>
The Boombox CLI helps you create and publish content.

Install the Boombox CLI on your computer:
<code-block>
npm install -g @b5x/cli
</code-block>

Verify that the installation worked:
<code-block>
b5x help
</code-block>

You should see a list of available `b5x` commands.
</step>

<step title='Install the Boombox VSCode extension'>
This doesn't exist yet, but it will. For now, just mark this step as done.
</step>

<step title='Log into the Boombox CLI'>
On the command line, initialize the login flow:

<code-block>
b5x login
</code-block>

You'll be prompted for a key.

To generate the key:

1. Go to your user profile by clicking on the person icon in the top left menu.
2. Click **Generate key** button.
3. Click **Copy key**.

Paste the key into your terminal and press Enter.

You should see a message that you have logged in successfully.
</step>

<step title='Create your new topic'>
Navigate to the directory where you'd like your project to be created. `b5x` will create the entire project for you, including the project folder.

From the desired parent directory, initialize your topic:

<code-block>
b5x init
</code-block>

You'll be asked to provide the following information:

- Your topic's identifier, used for its URL. For this one, let's use `my-demo-topic`.
- Your topic's title. Keep it short and sweet.
- Your topic's subtitle. This is a sentence summarizing what your topic is about.
  </step>

<step title="Edit your topic's documents">
To change your topic's documents, open the topic folder in VSCode:

<code-block>
code my-demo-topic
</code-block>

Spend some time exploring the contents of this folder, especially `my-demo-topic/documents`. Make some small changes to the document files.
</step>

<step title='Publish and view your topic'>
It's time to push your topic from your computer to the Boombox server in the cloud:

<code-block>
b5x publish my-demo-topic
</code-block>

You'll receive a URL you can use to view your topic. Congrats, you're now a published Boombox author!
</step>

</checklist>
