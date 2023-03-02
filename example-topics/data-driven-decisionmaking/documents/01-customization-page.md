# Let's customize your course

Answering the questions below will help us tailor the course content for your needs. If needed, you can always revise your answers at any point in the course.

## CloudCo architecture familiarity

<single-select-question id='architecture-level'>
How familiar are you with CloudCo's data architecture?
<choice value="beginner">I'm completely unfamiliar with it.</choice>
<choice value="intermediate">I've interacted with some components of it, but don't have the big picture.</choice>
<choice value="advanced">I could draw you a pretty okay diagram.</choice>
</single-select-question>

<show if="architecture-level is beginner">
We'll give you the full tour, then!
</show>

<show if="architecture-level is intermediate">
Got it. We'll give you the opportunity to dig into the architecture a bit more.
</show>

<show if="architecture-level is advanced">
Nice! We'll include our own diagram for your reference, but skip the detailed tour.
</show>

## SQL skills

<single-select-question id='sql-level'>
Which best describes your experience with SQL?
<choice value="beginner">I've never used SQL.</choice>
<choice value="novice">I've made progress in a SQL course or tutorial.</choice>
<choice value="intermediate">I've completed an introductory SQL course.</choice>
<choice value="advanced">I've completed an in-depth SQL course or track.</choice>
<choice value="expert">I write SQL professionally.</choice>
</single-select-question>

<show if="sql-level is beginner">
We're excited for you to start your SQL adventure! We'll start from the very beginning, with a full introductory SQL module included in this course.
</show>

<show if="sql-level is novice">
We'll assume you know the basics, like SELECT, but still help you with the fancy stuff, like JOINs.
</show>

<show if="sql-level is intermediate">
In that case, you'll just do a quick review of the basics before diving into more complex queries.
</show>

<show if="sql-level is advanced">
Since you're already familiar with SQL, we'll provide a SQL cheat sheet for your reference, but you won't complete any SQL-specific challenges.
</show>

<show if="sql-level is expert">
Sounds like you won't be needing any SQL instruction at all! We'll just skip that part.
</show>

## Mode familiarity

<single-select-question id='mode-level'>
Which best describes your experience with Mode?
<choice value="beginner">I've never used Mode.</choice>
<choice value="novice">I've used existing reports in Mode.</choice>
<choice value="intermediate">I've created simple reports in Mode.</choice>
<choice value="advanced">I've created complex reports in Mode.</choice>
<choice value="expert">I use Mode professionally.</choice>
</single-select-question>

<show if="mode-level is beginner">
In that case, we'll direct you to a few external resources to establish a foundation before you use Mode to query CloudCo data.
</show>

<show if="mode-level is novice">
We'll assume you know the basics, but offer you a few external resources that you can use to review if needed.
</show>

<show if="mode-level is intermediate">
In that case, we'll skip the basics and focus on advanced Mode features.
</show>

<show if="(mode-level is advanced) or (mode-level is expert)">
Got it -- we'll skip the Mode challenges.
</show>
