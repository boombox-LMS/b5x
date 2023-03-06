# Conditional content display

<single-select-question id='number'>
Choose a number.
<choice value=one>1</choice>
<choice value=two>2</choice>
<choice value=three>3</choice>
</single-select-question>

<show if='number is one'>
One.
</show>

<show if='number is two'>
Two.
</show>

<show if='number is three'>
Three.
</show>

<simple-checklist>
<step>The paragraph underneath the question spells out the number you chose.</step>
<step>Updating your answer updates the paragraph correctly.</step>
<step>If and only if `1` is chosen, an extra document shows up in the table of contents.</step>
</simple-checklist>