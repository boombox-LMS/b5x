<config>
show-if: (mode-level is advanced) or (mode-level is expert) or (sql-level is advanced) or (sql-level is expert)
</config>

# Optional mentor signup

Based on your responses, you have advanced data skills that make you a great fit for our mentoring program.

Is it okay for us to reach out to you about becoming a mentor?

<single-select-question id='mentor-interest'>
<choice value="high">Absolutely! I'm passionate about helping my colleagues grow.</choice>
<choice value="medium">Yes, I'm interested in hearing more.</choice>
<choice value="low">Not at this time, thank you.</choice>
</single-select-question>

<show if="(mentor-interest is high) or (mentor-interest is medium)">
Excellent! You'll be hearing from us soon.
</show>

<show if="mentor-interest is low">
We understand -- if you ever change your mind, you can always reach out to techlearning at gmail dot com.
</show>

On to the course!
