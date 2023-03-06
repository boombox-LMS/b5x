# User state

<short-text-question id='name'>
What's your name?
</short-text-question>

<single-select-question id='favorite-color'>
What's your favorite color?
<choice value=pink>pink</choice>
<choice value=green>green</choice>
<choice value=blue>blue</choice>
</single-select-question>

<simple-checklist>
<step>The inputted data above persists when you reload the page.</step>
<step>You are able to change your answer to both questions.</step>
<step>Your changes persist when you reload the page.</step>
</simple-checklist>

# Data piping

Your name is <echo>name</echo>.

<continue-button>The data above is piped correctly.</continue-button>