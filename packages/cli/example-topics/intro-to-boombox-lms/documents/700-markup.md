# Boombox markup examples

Everything you see on this page was created using plaintext markup. Below are a few examples.

## Short text question

<tabs>

<tab title='Markup in your .md file'>
<code-block language='markdown'>
<short-text-question id='user-hobbies'>
What are your two favorite hobbies?
</short-text-question>

<show if='user-hobbies matches /writing/ and user-hobbies matches /programming/'>
Wait, writing and programming are your two *favorite* hobbies?! You should publish content on Boombox!
</show>
</code-block>
</tab>

<tab title='Result in the browser'>
<short-text-question id='user-hobbies' required=false>
What are your two favorite hobbies?
</short-text-question>

<show if='user-hobbies matches /writing/ and user-hobbies matches /programming/'>
Wait, writing and programming are your two *favorite* hobbies?!

You should publish content on Boombox!
</show>
</tab>

</tabs>

## Mermaid diagram

<tabs>

<tab title='Markup in your .md file'>
<code-block language="markdown">
Below is a **mermaid diagram**.

You can read more about these on the [Mermaid site](https://mermaid.js.org/#/).

<mermaid-diagram>
flowchart LR
a --> b --> c
</mermaid-diagram>
</code-block>
</tab>

<tab title='Result in the browser'>
Below is a *mermaid diagram*.

You can read more about these on the [Mermaid site](https://mermaid.js.org/#/).

<mermaid-diagram>
flowchart LR
a --> b --> c
</mermaid-diagram>
</tab>

</tabs>
