import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectEnv, setEnv } from "../../envSlice";
import { CodeOutlined } from "@ant-design/icons";
import { Tooltip } from "@mui/material";

export const EnvButton = ({ style }) => {
  const env = useSelector(selectEnv);
  const dispatch = useDispatch();

  let classNames = ["header__menu-icon"];

  if (env === "dev") {
    classNames.push("header__menu-icon--active");
  }

  const toggleEnv = () => {
    if (env === "dev") {
      dispatch(setEnv({ env: "prod" }));
    } else {
      dispatch(setEnv({ env: "dev" }));
    }
  };

  return (
    <span onClick={toggleEnv}>
      <Tooltip title="Dev env on/off" placement="top">
        <CodeOutlined className={classNames.join(" ")} />
      </Tooltip>
    </span>
  );
};
