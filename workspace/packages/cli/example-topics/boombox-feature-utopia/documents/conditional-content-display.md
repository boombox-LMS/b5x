# Conditional content display

<tabs>

<tab title='Result in browser' >
(Answer the question to see conditional content.)

<single-select-question id='user-region'>
Where are you from?
<choice value="midwest">the Midwest</choice>
<choice value="south">the South</choice>
<choice value="east-coast">the East Coast</choice>
<choice value="west-coast">the West Coast</choice>
</single-select-question>

<show if='user-region is midwest'>
Ope! Midwest is best!
</show>

<show if='user-region is south'>
Let's go to Waffle House!
</show>

<show if='user-region is west-coast'>
The West Coast is the best coast!
</show>

<show if='user-region is east-coast'>
Ah, so you eat *real* bagels. Lucky!
</show>
</tab>

<tab title='Markup in .md file' >
<code-block language='markdown'>
(Answer the question to see conditional content.)

<single-select-question id='user-region'>
Where are you from?
<choice value="midwest">the Midwest</choice>
<choice value="south">the South</choice>
<choice value="east-coast">the East Coast</choice>
<choice value="west-coast">the West Coast</choice>
</single-select-question>

<show if='user-region is midwest'>
Ope! Midwest is best!
</show>

<show if='user-region is south'>
Let's go to Waffle House!
</show>

<show if='user-region is west-coast'>
The West Coast is the best coast!
</show>

<show if='user-region is east-coast'>
Ah, so you eat *real* bagels. Lucky!
</show>
</code-block>
</tab>

</tabs>