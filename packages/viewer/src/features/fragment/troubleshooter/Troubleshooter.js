import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StepList } from "./StepList";

export const Troubleshooter = ({ fragment }) => {
  // const { issues } = fragment.data

  const issues = [
    {
      title: "Problem 1",
      steps: [
        {
          label: "Step 1",
          description: `Step 1 description goes here.`,
        },
        {
          label: "Step 2",
          description: ``,
        },
        {
          label: "Step 3",
          description: `Step 3 description goes here.`,
        },
      ],
    },
    {
      title: "Problem 2",
      steps: [
        {
          label: "Step 1",
          description: `Step 1 description goes here.`,
        },
        {
          label: "Step 2",
          description: ``,
        },
        {
          label: "Step 3",
          description: `Step 3 description goes here.`,
        },
      ],
    },
    {
      title: "Problem 3",
      steps: [
        {
          label: "Step 1",
          description: `Step 1 description goes here.`,
        },
        {
          label: "Step 2",
          description: ``,
        },
        {
          label: "Step 3",
          description: `Step 3 description goes here.`,
        },
      ],
    },
  ];

  return (
    <div>
      {issues.map((issue, i) => {
        return (
          <Accordion key={issue.title}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id={`issue-${i}`}
            >
              <Typography>{issue.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <StepList steps={issue.steps} />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
};

/*

Single select:
- I completed this successfully. (Or specific success text)
- I encountered an issue.

Click on an issue below to view its troubleshooting steps.

(Issue accordion, including "My issue is not listed here")

Each section of the issue accordion progresses through the steps, 
with a "did that resolve the issue?" Y/N chooser.

Eventually, if all steps are exhausted 
and the problem is still not resolved, show help advice.

*/
