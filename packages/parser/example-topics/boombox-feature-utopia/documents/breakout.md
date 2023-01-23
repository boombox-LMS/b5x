# Breakout

## Simple breakout

<tabs>
<tab title='Result in browser'>
Just a bit of filler text so you can see how the breakout looks when it interrupts the content flow.
<breakout title=Tip>
A helpful tip would go here. Yay for breakouts!
</breakout>
More filler text to provide context to the breakout. To reduce clutter, the filler text is not included in the markup tag.
</tab>
<tab title='Markup in .md file'>
<code-block language='xml'>
<breakout title=Tip>
A helpful tip would go here. Yay for breakouts!
</breakout>
</code-block>
</tab>
</tabs>

## Simple breakout with Iconify icon

<tabs>
<tab title='Result in browser'>
Just a bit of filler text so you can see how the breakout looks when it interrupts the content flow.
<breakout icon=mdi:hand-wave-outline title=Reminder>
Remember, you can always ask for help!
</breakout>
More filler text to provide context to the breakout. To reduce clutter, the filler text is not included in the markup tag.
</tab>
<tab title='Markup in .md file'>
<code-block language='xml'>
<breakout icon=mdi:hand-wave-outline title=Reminder>
Remember, you can always ask for help!
</breakout>
</code-block>
</tab>
</tabs>

## Customized breakout with uploaded asset

This will only display correctly if the topic's `images` folder contains an asset named `cat.svg` (or any other filename/type that would be compatible with the browser's `img` tag).

<tabs>
<tab title='Result in browser'>
Just a bit of filler text so you can see how the breakout looks when it interrupts the content flow.
<breakout icon=cat.svg icon-size=large title='Advice from a cat' color=#FF91AB>
Always keep my food bowl filled to the brim. If you don't, I will become dangerously malnourished.
</breakout>
More filler text to provide context to the breakout. To reduce clutter, the filler text is not included in the markup tag.
</tab>

<tab title='Markup in .md file'>
<code-block language='xml'>
<breakout icon=cat.svg icon-size=large title='Advice from a cat' color=#FF91AB>
Always keep my food bowl filled to the brim. If you don't, I will become dangerously malnourished.
</breakout>
</code-block>
</tab>
</tabs>