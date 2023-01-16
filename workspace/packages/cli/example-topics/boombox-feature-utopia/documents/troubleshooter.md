# Troubleshooter

Guide the user through common troubleshooting steps associated with the task they're attempting to complete.

<tabs>

<tab title='Result in browser'>
<troubleshooter>
  <issue>
    <title>I don't see any failing tests.</title>
    <step>Verify that your test file name ends in `_test.py`.</step>
    <step>Use `pwd` to ensure that you aren't running tests in the wrong location.</step>
  </issue>
  <issue>
    <title>I get a "not authorized" error.</title>
    <step>Verify that you're on the VPN.</step>
    <step>Use `which aws-okta` to verify that aws-okta is installed on your system.</step>
  </issue>
</troubleshooter>
</tab>

<tab title='Markup in .md file'>
<code-block language='xml'>
<troubleshooter>
  <issue>
    <title>I don't see any failing tests.</title>
    <step>Verify that your test file name ends in `_test.py`.</step>
    <step>Use `pwd` to ensure that you aren't running tests in the wrong location.</step>
  </issue>
  <issue>
    <title>I get a "not authorized" error.</title>
    <step>Verify that you're on the VPN.</step>
    <step>Use `which aws-okta` to verify that aws-okta is installed on your system.</step>
  </issue>
</troubleshooter>
</code-block>
</tab>

</tabs>
