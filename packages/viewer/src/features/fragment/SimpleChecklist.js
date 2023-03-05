import React, { useState } from "react";
import { muiTheme } from "../../theme/active-theme";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import styled from "styled-components/macro";

const CheckboxLabel = styled.span`
  & p {
    margin: 0;
    padding: 0;
  }
`;

export const SimpleChecklist = ({
  fragment,
  response,
  responseUpdateCallback,
}) => {
  const { steps } = fragment.data;

  const buildEmptyResponse = (steps) => {
    let response = {};
    steps.forEach((step) => {
      response[step.id] = false;
    });
    return response;
  };

  const toggleCheckbox = (id) => {
    setLocalResponse((localResponse) => {
      return { ...localResponse, [id]: !localResponse[id] };
    });
  };

  const calculateCheckedBoxColor = () => {
    if (Object.values(localResponse).every((value) => value)) {
      return muiTheme.palette.greenlit.main;
    } else {
      return muiTheme.palette.primary.main;
    }
  };

  const [localResponse, setLocalResponse] = useState(buildEmptyResponse(steps));
  const checkedBoxColor = calculateCheckedBoxColor();

  return (
    <FormGroup>
      {steps.map((step) => {
        return (
          <FormControlLabel
            key={step.id}
            control={
              <Checkbox
                checked={localResponse[step.id]}
                onClick={() => {
                  toggleCheckbox(step.id);
                }}
                sx={{
                  color: muiTheme.palette.gray.medium,
                  "&.Mui-checked": {
                    color: checkedBoxColor,
                  },
                }}
              />
            }
            label={
              <CheckboxLabel dangerouslySetInnerHTML={{ __html: step.label }} />
            }
          />
        );
      })}
    </FormGroup>
  );
};
