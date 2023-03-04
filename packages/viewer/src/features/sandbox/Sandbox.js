import React, { useState } from "react";
import styled from "styled-components/macro";
import { muiTheme } from "../../theme/active-theme";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

export const Sandbox = () => {
  const fragment = {
    data: {
      steps: [
        { id: "1", label: "Step 1" },
        { id: "2", label: "Step 2" },
        { id: "3", label: "Step 3" },
        { id: "4", label: "Step 4" },
      ],
    },
  };

  const { steps } = fragment.data;

  const buildEmptyResponse = (steps) => {
    let response = {};
    steps.forEach((step) => {
      response[step.id] = false;
    });
    return response;
  };

  const toggleResponse = (id) => {
    setResponse((response) => {
      return { ...response, [id]: !response[id] };
    });
  };

  const calculateCheckedBoxColor = () => {
    if (Object.values(response).every((value) => value)) {
      return muiTheme.palette.greenlit.main;
    } else {
      return muiTheme.palette.primary.main;
    }
  };

  const [response, setResponse] = useState(buildEmptyResponse(steps));
  const checkedBoxColor = calculateCheckedBoxColor();

  return (
    <FormGroup>
      {steps.map((step) => {
        return (
          <FormControlLabel
            key={step.id}
            control={
              <Checkbox
                checked={response[step.id]}
                onClick={() => {
                  toggleResponse(step.id);
                }}
                sx={{
                  color: muiTheme.palette.gray.medium,
                  "&.Mui-checked": {
                    color: checkedBoxColor,
                  },
                }}
              />
            }
            label={step.label}
          />
        );
      })}
    </FormGroup>
  );
};
