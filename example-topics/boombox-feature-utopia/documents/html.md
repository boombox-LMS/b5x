# Html content

## Embedded video example

<tabs>

<tab title='Result in browser'>
<html>
<iframe src="https://player.vimeo.com/video/15069551?h=d7a440a3ca" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
<p><a href="https://vimeo.com/15069551">The Unseen Sea</a> from <a href="https://vimeo.com/simonchristen">Simon Christen</a> on <a href="https://vimeo.com">Vimeo</a>.</p>
</html>
</tab>

<tab title='Markup in .md file'>
<code-block language="html">
<html>
<iframe src="https://player.vimeo.com/video/15069551?h=d7a440a3ca" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
<p><a href="https://vimeo.com/15069551">The Unseen Sea</a> from <a href="https://vimeo.com/simonchristen">Simon Christen</a> on <a href="https://vimeo.com">Vimeo</a>.</p>
</html>
</code-block>
</tab>

</tabs>

## JavaScript example (TODO)

<tabs>

<tab title='Result in browser'>
<html>
<button id='clickable-button'>Click me!</button>
<script>
const button = document.getElementById("clickable-button");
button.addEventListener("click", function() {
  alert("Clicked!");
});
</script>
</html>
</tab>

<tab title='Markup in .md file'>
<code-block language="html">
<html>
<button id='clickable-button'>Click me!</button>
<script>
const button = document.getElementById("clickable-button");
button.addEventListener("click", function() {
  alert("Clicked!");
});
</script>
</html>
</code-block>
</tab>

</tabs>