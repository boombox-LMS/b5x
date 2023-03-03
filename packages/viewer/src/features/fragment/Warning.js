import React, { useState } from "react";
import { FragmentWrapper } from "./FragmentWrapper";
import Button from "@mui/material/Button";
import { Icon } from "@iconify/react";
import { muiTheme } from "../../theme/active-theme";

export const Warning = ({ fragment, response, responseUpdateCallback }) => {
  let isMarkedAsRead = false;
  if (response && response.value) {
    isMarkedAsRead = true;
  }

  const markAsRead = () => {
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: true,
      status: "completed",
    });
  };

  return (
    <div
      className={`breakout-box warning ${isMarkedAsRead ? "read" : "unread"}`}
    >
      {!isMarkedAsRead && (
        <div style={{ marginLeft: "-2px" }}>
          <Icon
            icon="material-symbols:warning-outline-rounded"
            width="50px"
            color="red"
          />
        </div>
      )}
      <div className="breakout-box__header warning">Warning</div>
      <div className="breakout-box__contents warning">
        {fragment.children.map((childFragment) => {
          return (
            <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
          );
        })}
      </div>
      {!isMarkedAsRead && (
        <Button onClick={markAsRead} variant="outlined" color="critical">
          Mark as read
        </Button>
      )}
    </div>
  );
};
