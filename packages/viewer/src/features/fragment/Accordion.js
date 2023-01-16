import React from "react";
import MuiAccordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FragmentWrapper } from "./FragmentWrapper";

const AccordionItemContents = ({ fragment }) => {
  return (
    <>
      {fragment.children.map((childFragment) => {
        return (
          <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
        );
      })}
    </>
  );
};

export const Accordion = ({ fragment }) => {
  return (
    <>
      {fragment.children.map((childFragment) => {
        return (
          <MuiAccordion key={childFragment.uri}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${childFragment.uri}-content`}
              id={`${childFragment.uri}-header`}
            >
              <span style={{ fontWeight: "500" }}>
                {childFragment.data.title}
              </span>
            </AccordionSummary>
            <AccordionDetails>
              <AccordionItemContents fragment={childFragment} />
            </AccordionDetails>
          </MuiAccordion>
        );
      })}
    </>
  );
};
