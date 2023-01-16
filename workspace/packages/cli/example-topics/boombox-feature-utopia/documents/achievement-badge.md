<config>
content-mode: tutorial
</config>

# Achievement Badge

_This document is in tutorial mode to allow a correct preview of the intended interaction._

## Result in browser

Complete the question correctly to earn a badge.
<single-select-question id='chosen-strategy'>
If at first you don't succeed ...
<choice value='give-up'>Give up. Immediately.</choice>
<choice value='try-again'>Try, try again!</choice>
<choice value='blame'>Blame it on somebody else.</choice>
</single-select-question>

<show if='chosen-strategy is try-again'>
<badge
  title='Persistence practitioner'
  description='Bravely refused to be discouraged by failure.'
  icon=carbon:loop
/>
</show>

## Markup in .md file

<code-block language='xml'>
Complete the question correctly to earn a badge.
<single-select-question id='chosen-strategy'>
If at first you don't succeed ...
<choice value='give-up'>Give up. Immediately.</choice>
<choice value='try-again'>Try, try again!</choice>
<choice value='blame'>Blame it on somebody else.</choice>
</single-select-question>

<show if='chosen-strategy is try-again'>
<badge
  title='Persistence practitioner'
  description='Bravely refused to be discouraged by failure.'
  icon=carbon:loop
/>
</show>
</code-block>