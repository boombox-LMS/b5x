import { HtmlContent } from "./HtmlContent";
import { Show } from "./Show";
import { Troubleshooter } from "./troubleshooter/Troubleshooter";
import { ContinueButton } from "./ContinueButton";
import { SingleSelectQuestion } from "./SingleSelectQuestion";
import { MultiSelectQuestion } from "./MultiSelectQuestion";
import { ShortTextQuestion } from "./ShortTextQuestion";
import { LongTextQuestion } from "./LongTextQuestion";
import { SentimentCheck } from "./SentimentCheck";
import { CodeBlock } from "./CodeBlock";
import { Rubric } from "./Rubric";
import { FiveStarRating } from "./FiveStarRating";
import { DocumentCompletionContent } from "./DocumentCompletionContent";
import { MermaidDiagram } from "./MermaidDiagram";
import { Checklist } from "./Checklist";
import { Diagram } from "./Diagram";
import { Slideshow } from "./Slideshow";
import { Slide } from "./Slide";
import { VisualList } from "./VisualList";
import { Warning } from "./Warning";
import { NpsQuestion } from "./NpsQuestion";
import { Accordion } from "./Accordion";
import { TabbedContent } from "./TabbedContent";
import { Badge } from "./Badge";
import { Breakout } from "./Breakout";
import { SimpleChecklist } from "./SimpleChecklist";

export const contentComponents = {
  HtmlContent: HtmlContent,
  Slideshow: Slideshow,
  Slide: Slide,
  Show: Show,
  Troubleshooter: Troubleshooter,
  ContinueButton: ContinueButton,
  SingleSelectQuestion: SingleSelectQuestion,
  MultiSelectQuestion: MultiSelectQuestion,
  ShortTextQuestion: ShortTextQuestion,
  LongTextQuestion: LongTextQuestion,
  NpsQuestion: NpsQuestion,
  Diagram: Diagram,
  SentimentCheck: SentimentCheck,
  CodeBlock: CodeBlock,
  Rubric: Rubric,
  FiveStarRating: FiveStarRating,
  DocumentCompletionContent: DocumentCompletionContent,
  MermaidDiagram: MermaidDiagram,
  Checklist: Checklist,
  VisualList: VisualList,
  Warning: Warning,
  Accordion: Accordion,
  Tabs: TabbedContent,
  Badge: Badge,
  Breakout: Breakout,
  SimpleChecklist: SimpleChecklist,
};
