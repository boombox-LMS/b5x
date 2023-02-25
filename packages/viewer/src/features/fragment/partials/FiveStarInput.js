import React from "react";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import styled from "styled-components/macro";
import { muiTheme } from "../../../theme";

const StarWrapper = styled.div`
  display: inline-block;
  font-size: 2.5em;
  margin-right: 5px;
  color: ${muiTheme.palette.secondary.main};
`;

export const FiveStarInput = ({ value, onChangeCallback }) => {
  const starValues = [1, 2, 3, 4, 5];
  return (
    <div>
      {starValues.map((starValue) => {
        if (value >= starValue) {
          return (
            <StarWrapper key={starValue}>
              <StarFilled
                onClick={() => {
                  onChangeCallback(starValue);
                }}
              />
            </StarWrapper>
          );
        } else {
          return (
            <StarWrapper key={starValue}>
              <StarOutlined
                onClick={() => {
                  onChangeCallback(starValue);
                }}
              />
            </StarWrapper>
          );
        }
      })}
    </div>
  );
};
