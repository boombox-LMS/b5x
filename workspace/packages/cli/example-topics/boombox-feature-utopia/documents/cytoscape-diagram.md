# Cytoscape diagram

## Iconify example

No image assets are needed when using [Iconify](https://iconify.design/), just set the shape to the text ID of the desired icon.

<tabs>

<tab title='Result in browser' >
<diagram>
  <item id=client label=Client shape=ic:baseline-phone-android col=1 row=2>
    <line to=lb arrow=both label=http />
  </item>

  <item id=lb label='Load balancer' shape=carbon:network-2 col=2 row=2 />

  <items shape=mingcute:server-line label='App server' col=3>
    <item id=server1 row=1 />
    <item id=server2 row=2 />
    <item id=server3 row=3 />
    <line to=lb arrow=both label=http />
    <line to=db arrow=both label=http />
  </items>

  <item id=db label=Database shape=mdi:database-outline col=4 row=2 />
</diagram>
</tab>

<tab title='Markup in .md file' >
<code-block language='xml'>
<diagram>
  <item id=client label=Client shape=ic:baseline-phone-android col=1 row=2>
    <line to=lb arrow=both label=http />
  </item>

  <item id=lb label='Load balancer' shape=carbon:network-2 col=2 row=2 />

  <items shape=mingcute:server-line label='App server' col=3>
    <item id=server1 row=1 />
    <item id=server2 row=2 />
    <item id=server3 row=3 />
    <line to=lb arrow=both label=http />
    <line to=db arrow=both label=http />
  </items>

  <item id=db label=Database shape=mdi:database-outline col=4 row=2 />
</diagram>
</code-block>
</tab>

</tabs>

## Custom assets example

The referenced images must exist in the topic's `images` folder.

<tabs>

<tab title='Result in browser' >
<diagram>
  <item id=client label=Client shape=phone.png col=1 row=2>
    <line to=lb arrow=both label=http />
  </item>

  <item id=lb label='Load balancer' shape=global-network.png col=2 row=2 />

  <items shape=server.png label='App server' col=3>
    <item id=server1 row=1 />
    <item id=server2 row=2 />
    <item id=server3 row=3 />
    <line to=lb arrow=both label=http />
    <line to=db arrow=both label=http />
  </items>

  <item id=db label=Database shape=database.png col=4 row=2 />
</diagram>
</tab>

<tab title='Markdown in .md file' >
<code-block language='xml'>
<diagram>
  <item id=client label=Client shape=phone.png col=1 row=2>
    <line to=lb arrow=both label=http />
  </item>

  <item id=lb label='Load balancer' shape=global-network.png col=2 row=2 />

  <items shape=server.png label='App server' col=3>
    <item id=server1 row=1 />
    <item id=server2 row=2 />
    <item id=server3 row=3 />
    <line to=lb arrow=both label=http />
    <line to=db arrow=both label=http />
  </items>

  <item id=db label=Database shape=database.png col=4 row=2 />
</diagram>
</code-block>
</tab>
</tabs>
