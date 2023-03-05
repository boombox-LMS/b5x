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

import { Fragment } from "./fragments/abstractClasses/Fragment";
import { FragmentParams } from "../types/fragments";
import { FragmentViaArgs } from "./fragments/parsingClasses/FragmentViaArgs";
import { MermaidDiagram } from "./fragments/parsingClasses/MermaidDiagram";
import { SelectQuestion } from "./fragments/parsingClasses/SelectQuestion";
import { Troubleshooter } from "./fragments/parsingClasses/Troubleshooter";
import { Diagram } from "./fragments/parsingClasses/Diagram";
import { Slideshow } from "./fragments/parsingClasses/Slideshow";
import { Slide } from "./fragments/parsingClasses/Slide";
import { Rubric } from "./fragments/parsingClasses/Rubric";
import { CodeBlock } from "./fragments/parsingClasses/CodeBlock";
import { FragmentViaBxmlText } from "./fragments/abstractClasses/FragmentViaBxmlText";
import { Show } from "./fragments/parsingClasses/Show";
import { Echo } from "./fragments/parsingClasses/Echo";
import { spinalcase } from "stringcase";
import { Checklist } from "./fragments/parsingClasses/Checklist";
import { VisualList } from "./fragments/parsingClasses/VisualList";
import { ContinueButton } from "./fragments/parsingClasses/ContinueButton";
import { ShortTextQuestion } from "./fragments/parsingClasses/ShortTextQuestion";
import { LongTextQuestion } from "./fragments/parsingClasses/LongTextQuestion";
import { FiveStarRating } from "./fragments/parsingClasses/FiveStarRating";
import { SentimentCheck } from "./fragments/parsingClasses/SentimentCheck";
import { Warning } from "./fragments/parsingClasses/Warning";
import { Step } from "./fragments/parsingClasses/Step";
import { NpsQuestion } from "./fragments/parsingClasses/NpsQuestion";
import { Accordion } from "./fragments/parsingClasses/Accordion";
import { AccordionItem } from "./fragments/parsingClasses/AccordionItem";
import { Tab } from "./fragments/parsingClasses/Tab";
import { Tabs } from "./fragments/parsingClasses/Tabs";
import { Badge } from "./fragments/parsingClasses/Badge";
import { Breakout } from "./fragments/parsingClasses/Breakout";
import { SimpleChecklist } from "./fragments/parsingClasses/SimpleChecklist";

// Map the tag name to the parsing class.
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
  "continue-button": ContinueButton,
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
  "simple-checklist": SimpleChecklist,
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
