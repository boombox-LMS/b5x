import React, { useState } from "react";
import styled from "styled-components/macro";
import { muiTheme } from "../../theme/active-theme";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Form } from "react-router-dom";

export const Sandbox = () => {
  const fragment = {
    data: {
      items: [
        { id: "1", label: "Item 1" },
        { id: "2", label: "Item 2" },
        { id: "3", label: "Item 3" },
        { id: "4", label: "Item 4" },
      ],
    },
  };

  const { items } = fragment.data;

  const buildEmptyResponse = (items) => {
    let response = {};
    items.forEach((item) => {
      response[item.id] = false;
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

  const [response, setResponse] = useState(buildEmptyResponse(items));
  const checkedBoxColor = calculateCheckedBoxColor();

  return (
    <div style={{ paddingLeft: "30px", paddingRight: "30px" }}>
      <FormGroup>
        {items.map((item) => {
          return (
            <FormControlLabel
              key={item.id}
              control={
                <Checkbox
                  checked={response[item.id]}
                  onClick={() => {
                    toggleResponse(item.id);
                  }}
                  sx={{
                    color: muiTheme.palette.gray.medium,
                    "&.Mui-checked": {
                      color: checkedBoxColor,
                    },
                  }}
                />
              }
              label={item.label}
            />
          );
        })}
      </FormGroup>
    </div>
  );
};
