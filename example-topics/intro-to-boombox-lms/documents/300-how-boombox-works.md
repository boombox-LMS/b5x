# How Boombox works

Boombox isn't just one app -- it's a set of tools. This section will help you better understand how all of the components work together.

## Diagram of the publishing flow

<diagram>

<item id=sme shape=programmer-male.svg label=SME col=1 row=3>
  <line to=files label=contribute arrow=target />
</item>

<item id=files shape=document.svg label='Files' col=2 row=3>
  <line to=cli label=compile arrow=target />
</item>

<item id=instructor shape=programmer-female.svg label='Instructor' col=3 row=3>
  <line to=files label=contribute arrow=target />
  <line to=viewer label=publish arrow=target>
</item>

<item id=cli shape=heroicons:command-line-20-solid label='Boombox CLI' col=2 row=2 />

<item id=api shape=database.svg label='Boombox API' col=3 row=1>
</item>

<item id=viewer shape=openmoji:chrome label='Boombox viewer app' col=4 row=2>
  <line to=learner label='render content' arrow=target />
</item>

<line to=viewer from=api label='download content / upload user data' arrow=both />

<item id=learner shape=learner.svg label='Learner' col=4 row=3>
</item>

</diagram>

## Description of the publishing flow

The six steps shown in the diagram are also listed below. If you like, click on a step to learn more about it.

<accordion>

<item title='1. SMEs contribute to Markdown files'>
The SME writes information in files. They can use plain [Markdown](https://www.markdownguide.org/cheat-sheet/), which is a simple way of creating content that has headings, bulleted lists, and so on.

Most technical SMEs already know Markdown, and already use it to document their work. In cases where Markdown documentation already exists, the SME may not need to do anything at all.
</item>

<item title='2. Tech Learning team members enhance the files'>
Tech Learning team members can also create content from scratch -- any Boombox user can.

If an SME has already created content, a TL team member might collaborate with the SME to enhance the content.

They might use special Boombox markup to add features to the content, like animations or interactive checklists. Boombox markup can be added into any Markdown file.
</item>

<item title='3. The CLI compiles content that can be uploaded via the viewer app'>
Boombox CLI converts the files into data, and puts the data on the user's clipboard for easy uploading.

The user can paste that data into the dropzone located at /publish in the viewer app.
</item>

<item title='4. The API stores and serves content'>
The API is responsible for determining whether a given user should have access to content.
</item>

<item title='5. A learner browses available content on the Boombox viewer app'>
The viewer app is responsible for rendering content, and managing user interactions with content.
</item>

<item title='6. The viewer app sends user-data updates to the API'>
When the learner interacts with content by completing challenges or clicking buttons, the viewer app sends updates to Boombox API, which stores the learner's activity data.
</item>

</accordion>

Pretty great, right? But with great power comes great responsibility. Speaking of which, we have an important warning for you ...

<user-reply>Let's have it.</user-reply>

<warning>
Boombox authors are the admins of their content; the platform intentionally does not sanitize authored content. Empowering trusted authors is the entire point of the platform.

While Boombox is versatile enough to be used in a wide range of contexts, it was created for the specific use case of internal corporate knowledge-sharing. It's designed for use by the employees of a company, and other contexts involving trust, administrative oversight, and accountability.

When deployed in a public context with broad authoring permissions, Boombox has major security vulnerabilities _by design_. Simply put: **Don't do that.**
</warning>

<comment>
The animated version of the diagram is below, and not renderable yet ...

<diagram>
<item shape=author label=SME col=1 show-in=1 />
<item shape=files label='Files' col=2 show-in=1 />
<item shape=terminal label='Boombox CLI' col=3 show-in=2>

<caption>
The SME writes information in files. They can use plain [Markdown](https://www.markdownguide.org/cheat-sheet/), which is a simple way of creating content that has headings, bulleted lists, and so on.

Most technical SMEs already know Markdown, and already use it to document their work. In cases where Markdown documentation already exists, the SME may not need to do anything at all.

<minimized-content prompt='See short markdown example'>
</minimized-content>
</caption>

<caption>
Tech Learning team members can also create content from scratch -- any Boombox user can.

If an SME has already created content, a TL team member might collaborate with the SME to enhance the content.

They might use special Boombox markup to add features to the content, like animations or interactive checklists. Boombox markup can be added into any Markdown file.

<minimized-content prompt='See an example of Boombox markup'>
</minimized-content>
</caption>

<caption>
The SME or TL team member use Boombox CLI, a command-line tool, to publish the topic.
</caption>

<caption>
Boombox CLI converts the files into data, and sends the data to the Boombox API for storage.
</caption>

<caption>
A learner browses available content on the Boombox viewer app.
</caption>

<caption>
When the learner interacts with content by completing challenges or clicking buttons, the viewer app sends updates to Boombox API, which stores the learner's activity data.
</caption>
</diagram>
</comment>

## All content in Boombox is built using plaintext markup, including this page!

Like everything on Boombox, this page was written in plain markup, and published to the API as shown in the diagram. You're reading it in the viewer app right now! _Whoa._
