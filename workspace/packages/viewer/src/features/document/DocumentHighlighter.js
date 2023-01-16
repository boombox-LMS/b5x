/**
 *  Purpose:
 *  - Given a selection, build and apply a new highlight, and return it for storage
 *  - Apply a set of highlights to a document
 *  - Use callbacks to drive pop-up menus, messages, etc. associated with the highlight
 */

class DocumentHighlighter {
  constructor({
    highlightableSpans,
    handleHighlightHover,
    handleHighlightClick,
  }) {
    this.highlightableSpans = highlightableSpans;
    this.highlightableSpansById = {};
    for (let i = 0; i < highlightableSpans.length; i++) {
      const span = highlightableSpans[i];
      this.highlightableSpansById[span.id] = span;
    }
    this.handleHighlightHover = handleHighlightHover;
    this.handleHighlightClick = handleHighlightClick;
  }

  removeHighlights(highlights) {}

  applyHighlights({ highlights }) {
    highlights.forEach((highlight) => {
      // AWKWARD: Not entirely sure this actually has to be handled separately
      // if the code following it is set up correctly
      if (highlight.start.wrapperSpanId === highlight.end.wrapperSpanId) {
        const wrapperSpan =
          this.highlightableSpansById[highlight.start.wrapperSpanId];
        const charSpans = this.#getCharacterSpans(wrapperSpan);
        for (let i = 0; i < charSpans.length; i++) {
          const charSpan = charSpans[i];
          if (
            charSpan.dataset.pos >= highlight.start.pos &&
            charSpan.dataset.pos <= highlight.end.pos
          ) {
            this.#highlightSpan(charSpan, highlight);
          }
        }
        return;
      }

      // render start
      const startWrapperSpan =
        this.highlightableSpansById[highlight.start.wrapperSpanId];
      const startCharSpans = this.#getCharacterSpans(startWrapperSpan);
      for (let i = 0; i < startCharSpans.length; i++) {
        const startCharSpan = startCharSpans[i];
        if (startCharSpan.dataset.pos >= highlight.start.pos) {
          this.#highlightSpan(startCharSpan, highlight);
        }
      }

      // render middle elements
      highlight.middle.forEach((spanId) => {
        const middleWrapperSpan = this.highlightableSpansById[spanId];
        const middleCharSpans = this.#getCharacterSpans(middleWrapperSpan);
        for (let i = 0; i < middleCharSpans.length; i++) {
          const middleCharSpan = middleCharSpans[i];
          this.#highlightSpan(middleCharSpan, highlight);
        }
      });

      // render end
      const endWrapperSpan =
        this.highlightableSpansById[highlight.end.wrapperSpanId];
      const endCharSpans = this.#getCharacterSpans(endWrapperSpan);
      for (let i = 0; i < endCharSpans.length; i++) {
        const endCharSpan = endCharSpans[i];
        if (endCharSpan.dataset.pos <= highlight.end.pos) {
          this.#highlightSpan(endCharSpan, highlight);
        }
      }
    });
  }

  #getCharacterSpans(parentSpan) {
    return parentSpan.querySelectorAll(".c");
  }

  #highlightSpan(span, highlight) {
    span.classList.add("hc");
    span.addEventListener("mouseover", () => {
      this.handleHighlightHover(highlight);
    });
    span.addEventListener("click", () => {
      this.handleHighlightClick(highlight);
    });
  }

  buildHighlight(selection) {
    const { anchorWrapperSpanId, focusWrapperSpanId } =
      this.#findStartAndEndWrapperIds(selection);

    let highlight = {
      start: {
        wrapperSpanId: anchorWrapperSpanId,
        pos: selection.anchorNode.parentElement.dataset.pos,
      },
      end: {
        wrapperSpanId: focusWrapperSpanId,
        pos: selection.focusNode.parentElement.dataset.pos,
      },
      middle: this.#buildMiddle({ anchorWrapperSpanId, focusWrapperSpanId }),
      text: selection.toString(),
    };

    highlight = this.#arrangeLeftToRight(highlight);
    return highlight;
  }

  #buildMiddle({ anchorWrapperSpanId, focusWrapperSpanId }) {
    let middle = [];

    if (anchorWrapperSpanId === focusWrapperSpanId) {
      return middle;
    }

    let inMiddle = false;

    // discard any spans that are not in range, check the rest
    for (let i = 0; i < this.highlightableSpans.length; i++) {
      const currentSpan = this.highlightableSpans[i];

      // seek forward until anchor node is encountered;
      // start bridge with next node
      if (currentSpan.id === anchorWrapperSpanId) {
        inMiddle = true;
        continue;
      }

      // add nodes to bridge until focus node is encountered
      if (inMiddle) {
        if (currentSpan.id === focusWrapperSpanId) {
          break;
        } else {
          middle.push(currentSpan.id);
        }
      }
    }

    return middle;
  }

  #findStartAndEndWrapperIds(selection) {
    // get parent span of anchor node
    let anchorNode = selection.anchorNode;
    let anchorWrapperSpanId = anchorNode.id;

    while (!anchorWrapperSpanId) {
      anchorNode = anchorNode.parentElement;
      anchorWrapperSpanId = anchorNode.id;
    }

    // get parent span of focus node
    let focusNode = selection.focusNode;
    let focusWrapperSpanId = focusNode.id;

    while (!focusWrapperSpanId) {
      focusNode = focusNode.parentElement;
      focusWrapperSpanId = focusNode.id;
    }

    return { anchorWrapperSpanId, focusWrapperSpanId };
  }

  // For cases where the highlight was created by dragging right to left
  #arrangeLeftToRight(highlight) {
    if (highlight.start.pos > highlight.end.pos) {
      return {
        start: highlight.end,
        end: highlight.start,
        bridge: highlight.bridge,
        text: highlight.text,
      };
    }
    return highlight;
  }
}

export default DocumentHighlighter;
