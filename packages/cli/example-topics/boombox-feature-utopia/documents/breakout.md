# Breakout

## Simple breakout

<tabs>
<tab title='Result in browser'>
<breakout title=Tip>
A helpful tip would go here. Yay for breakouts!
</breakout>
</tab>
<tab title='Markup in .md file'>
<code-block language='xml'>
<breakout title=Tip>
A helpful tip would go here. Yay for breakouts!
</breakout>
</code-block>
</tab>
</tabs>

## Breakout with Iconify icon

<tabs>
<tab title='Result in browser'>
<breakout icon=mdi:lightbulb-on-10 title=Tip>
A helpful tip would go here. Yay for breakouts!
</breakout>
</tab>
<tab title='Markup in .md file'>
<code-block language='xml'>
<breakout icon=mdi:lightbulb-on-10 title=Tip>
A helpful tip would go here. Yay for breakouts!
</breakout>
</code-block>
</tab>
</tabs>

## Breakout with Iconify icon + custom color

<tabs>
<tab title='Result in browser'>
<breakout icon=noto-v1:cat title='Advice from a cat' color=#f7932a>
Always keep my food bowl filled to the brim. If you don't, I will become dangerously malnourished.
</breakout>
</tab>
<tab title='Markup in .md file'>
<code-block language='xml'>
<breakout icon=noto-v1:cat title='Advice from a cat' color=#f7932a>
Always keep my food bowl filled to the brim. If you don't, I will become dangerously malnourished.
</breakout>
</code-block>
</tab>
</tabs>

## Breakout with custom asset + custom color

This will only display correctly if the topic's `images` folder contains an asset named `cat.svg` (or any other filename/type that would be compatible with the browser's `img` tag).

<tabs>
<tab title='Result in browser'>
<breakout icon=cat.svg title='Advice from a cat' color=#6d1f4f>
Always keep my food bowl filled to the brim. If you don't, I will become dangerously malnourished.
</breakout>
</tab>

<tab title='Markup in .md file'>
<code-block language='xml'>
<breakout icon=cat.svg title='Advice from a cat' color=#6d1f4f>
Always keep my food bowl filled to the brim. If you don't, I will become dangerously malnourished.
</breakout>
</code-block>
</tab>
</tabs>