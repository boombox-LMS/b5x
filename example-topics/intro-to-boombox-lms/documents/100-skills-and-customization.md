# Welcome

![Walking into the future](future.jpg)

This course will teach you all about Boombox, ✨the future of knowledge-sharing.✨

<continue-button>That's a bit dramatic, isn't it?</continue-button>

You're right. Really we just wanted to demonstrate how to include an image.

## Introduce yourself

<short-text-question id='user-team'>
What is the name of your team?
</short-text-question>

We're excited that the <echo>user-team</echo> team is interested in using Boombox!

## Customize your experience

### Role

<single-select-question id='user-group'>
Which best describes you?
<choice value='ics'>Independent contributor</choice>
<choice value='managers'>Manager</choice>
<choice value='leaders'>Director and above</choice>
</single-select-question>

<show if='user-group is managers or user-group is leaders'>
Resources for <echo>user-group</echo> have been added to your course.
</show>

<show if='user-group is ics'>
Got it, we'll focus on the Boombox features that are most helpful for ICs.
</show>

### Skills

<multi-select-question id='known-skills'>
Which technologies are you already comfortable with? You can select more than one.
<choice value='markdown'>Markdown</choice>
<choice value='vscode'>Visual Studio Code</choice>
<choice value='tags'>HTML tags and attributes</choice>
<choice value='none'>None of the above</choice>
</multi-select-question>

Thanks for letting us know! This course has been customized to skip the tools you're already familiar with.
