# Select inputs

## Single select

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

<checklist>
<step title='Verify that you could only choose one option above.'>
You should be able to change your selection, but only select one at a time.
</step>
<step title='Verify that the correct conditional content displayed.'>
It should update anytime you update your answer.
</step>
</checklist>

## Multi select

<multi-select-question>
Choose at least two:
<choice value="quick">Quick</choice>
<choice value="cheap">Cheap</choice>
<choice value="good">Good</choice>
</multi-select-question>

Were you able to choose more than one option above?

<continue-button>Yep!</continue-button>

Excellent! Moving on ...
