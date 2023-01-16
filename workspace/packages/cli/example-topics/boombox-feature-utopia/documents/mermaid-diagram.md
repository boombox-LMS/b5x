# Mermaid diagram

## A simple diagram

<tabs>

<tab title='Result in browser' >
<mermaid-diagram>
flowchart LR
  client --> server --> cache --> database
</mermaid-diagram>
</tab>

<tab title='Markup in .md file' >
<code-block language='xml'>
<mermaid-diagram>
flowchart LR
  client --> server --> cache --> database
</mermaid-diagram>
</code-block>
</tab>

</tabs>

## A much more complicated diagram

<tabs>

<tab title='Result in browser' >
<mermaid-diagram>
flowchart TD
    P1(Person 1 Paycheck)
    P2(Person 2 Paycheck)
    P1 --> P1401K(P1 401K contribution)
    JC(Joint checking account)
    P1 & P2 ---->|direct deposit| JC
    P2 --> P2401K(P2 401K contribution)
    JC --> I1(P1 weekly investment) --scheduled transaction-->P1V(P1 Vanguard account)
    JC ----> A1(P1 weekly allowance) --scheduled transaction--> C1(P1 checking)
    JC --> B("All household expenses (utilities, insurance, etc)")
    JC ----> A2(P2 weekly allowance) --scheduled transaction--> C2(P2 checking)
    JC --> I2(P2 weekly investment) --scheduled transaction-->P2V(P2 Vanguard account)
    C1 --> PE1(Clothes, shoes, takeout, etc.)
    C2 --> PE2(Clothes, shoes, takeout, etc.)
</mermaid-diagram>
</tab>

<tab title='Markup in .md file' >
<code-block language='xml'>
<mermaid-diagram>
flowchart TD
    P1(Person 1 Paycheck)
    P2(Person 2 Paycheck)
    P1 --> P1401K(P1 401K contribution)
    JC(Joint checking account)
    P1 & P2 ---->|direct deposit| JC
    P2 --> P2401K(P2 401K contribution)
    JC --> I1(P1 weekly investment) --scheduled transaction-->P1V(P1 Vanguard account)
    JC ----> A1(P1 weekly allowance) --scheduled transaction--> C1(P1 checking)
    JC --> B("All household expenses (utilities, insurance, etc)")
    JC ----> A2(P2 weekly allowance) --scheduled transaction--> C2(P2 checking)
    JC --> I2(P2 weekly investment) --scheduled transaction-->P2V(P2 Vanguard account)
    C1 --> PE1(Clothes, shoes, takeout, etc.)
    C2 --> PE2(Clothes, shoes, takeout, etc.)
</mermaid-diagram>
</code-block>
</tab>

</tabs>