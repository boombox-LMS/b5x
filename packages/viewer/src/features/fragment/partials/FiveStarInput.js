import React from "react";
import { StarOutlined, StarFilled } from "@ant-design/icons";

export const FiveStarInput = ({ value, onChangeCallback }) => {
  const starValues = [1, 2, 3, 4, 5];
  return (
    <div className="five-star-input">
      {starValues.map((starValue) => {
        if (value >= starValue) {
          return (
            <div className="five-star-rating__star" key={starValue}>
              <StarFilled
                onClick={() => {
                  onChangeCallback(starValue);
                }}
              />
            </div>
          );
        } else {
          return (
            <div className="five-star-rating__star" key={starValue}>
              <StarOutlined
                onClick={() => {
                  onChangeCallback(starValue);
                }}
              />
            </div>
          );
        }
      })}
    </div>
  );
};
