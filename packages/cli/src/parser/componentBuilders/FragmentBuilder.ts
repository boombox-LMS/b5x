/**
 *  The component map lists any tag types that should be parsed
 *  by a dedicated fragment class, and which class is responsible
 *  for parsing it.
 *
 *  Whenever these tag types are encountered during the parsing
 *  of a fragment, control of that tag will be handed to
 *  the responsible class.
 *
 *  When a tag is encountered that is not listed in this map,
 *  it will be parsed as regular HTML (e.g., <code>).
 */

import { Fragment } from "./fragments/Fragment";
import { FragmentParams } from "../../types/fragments";
import { FragmentViaArgs } from "./fragments/FragmentViaArgs";
import { MermaidDiagram } from "./fragments/MermaidDiagram";
import { SelectQuestion } from "./fragments/SelectQuestion";
import { Troubleshooter } from "./fragments/Troubleshooter";
import { Diagram } from "./fragments/Diagram";
import { Slideshow } from "./fragments/Slideshow";
import { Slide } from "./fragments/Slide";
import { Rubric } from "./fragments/Rubric";
import { CodeBlock } from "./fragments/CodeBlock";
import { FragmentViaBxmlText } from "./fragments/FragmentViaBxmlText";
import { Show } from "./fragments/Show";
import { Echo } from "./fragments/Echo";
import { spinalcase } from "stringcase";
import { Checklist } from "./fragments/Checklist";
import { VisualList } from "./fragments/VisualList";
import { UserReply } from "./fragments/UserReply";
import { ShortTextQuestion } from "./fragments/ShortTextQuestion";
import { LongTextQuestion } from "./fragments/LongTextQuestion";
import { FiveStarRating } from "./fragments/FiveStarRating";
import { SentimentCheck } from "./fragments/SentimentCheck";
import { Warning } from "./fragments/Warning";
import { Step } from "./fragments/Step";
import { NpsQuestion } from "./fragments/NpsQuestion";
import { Accordion } from "./fragments/Accordion";
import { AccordionItem } from "./fragments/AccordionItem";
import { Tab } from "./fragments/Tab";
import { Tabs } from "./fragments/Tabs";
import { Badge } from "./fragments/Badge";
import { Breakout } from "./fragments/Breakout";

const fragmentMap = {
  "short-text-question": ShortTextQuestion,
  checklist: Checklist,
  step: Step,
  "long-text-question": LongTextQuestion,
  "document-completion-content": FragmentViaArgs,
  "mermaid-diagram": MermaidDiagram,
  "single-select-question": SelectQuestion,
  "multi-select-question": SelectQuestion,
  troubleshooter: Troubleshooter,
  "user-reply": UserReply,
  diagram: Diagram,
  slideshow: Slideshow,
  slide: Slide,
  rubric: Rubric,
  "sentiment-check": SentimentCheck,
  show: Show,
  "five-star-rating": FiveStarRating,
  "code-block": CodeBlock,
  echo: Echo,
  "html-content": FragmentViaBxmlText,
  "visual-list": VisualList,
  warning: Warning,
  "nps-question": NpsQuestion,
  accordion: Accordion,
  "accordion-item": AccordionItem,
  tab: Tab,
  tabs: Tabs,
  badge: Badge,
  breakout: Breakout,
};

export class FragmentBuilder {
  fragment: Fragment; // TODO: do I need to put tag: any on the Fragment class to make everything else work?

  constructor(params: FragmentParams) {
    let Klass;
    if (params.contentType === "MarkdownContent") {
      Klass = FragmentViaBxmlText;
    } else if (params.contentType) {
      // @ts-ignore
      Klass = fragmentMap[spinalcase(params.contentType)];
    } else if (params.bxmlNode && params.bxmlNode.type === "tag") {
      // @ts-ignore
      Klass = fragmentMap[params.bxmlNode.name] || FragmentViaBxmlText; // TODO: Create class for vanilla HTML, this is not the correct one to render it properly
    } else if (
      params.bxmlNode !== undefined &&
      params.bxmlNode.type === "text"
    ) {
      Klass = FragmentViaBxmlText;
    }
    this.fragment = new Klass(params);
  }

  build() {
    this.fragment.build();
    return this.fragment;
  }
}
