<config>
content-mode: tutorial
</config>

# Rubric

## Basic markup (tentative)

<code-block language="xml">
<rubric for='your-question-id'>
<answer>An answer portion goes here. It's worth 1 point by default.</answer>
<answer>Another answer portion goes here. It's also worth 1 point by default.</answer>
<answer points=2>The last answer portion goes here. It has been configured to be worth 2 points.</answer>
</rubric>
</code-block>

## Example

### Plain text markup

<code-block language="xml">
<long-text-question id='ten-essentials'>
Every hiker should carry The Ten Essentials. What are these essentials? Name as many as you can.
</long-text-question>

<rubric for='ten-essentials'>
<answer>Navigation</answer>
<answer>Headlamp</answer>
<answer>Sun protection</answer>
<answer>First aid</answer>
<answer>Knife</answer>
<answer>Fire</answer>
<answer>Shelter</answer>
<answer>Extra food</answer>
<answer>Extra water</answer>
<answer>Extra clothes</answer>
</rubric>
</code-block>

### Result displayed in browser

<long-text-question id='ten-essentials'>
Every hiker should carry The Ten Essentials. What are these essentials? Name as many as you can.
</long-text-question>

<rubric for='ten-essentials'>
<answer>Navigation</answer>
<answer>Headlamp</answer>
<answer>Sun protection</answer>
<answer>First aid</answer>
<answer>Knife</answer>
<answer>Fire</answer>
<answer>Shelter</answer>
<answer>Extra food</answer>
<answer>Extra water</answer>
<answer>Extra clothes</answer>
</rubric>
