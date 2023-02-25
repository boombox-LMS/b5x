import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLogInUserMutation } from "../api/apiSlice";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { setHeaderProps } from "../layout/header/headerSlice";
import styled from "styled-components/macro";
import { COLORS } from "../../theme";

const LoginFormBackground = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  width: 100%;
  height: 100vh;
  background-color: ${COLORS.SUBTLE_HIGHLIGHT};
`;

const LoginFormContent = styled.div`
  width: 400px;
  height: 275px;
  margin: 0 auto;
  background-color: white;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -200px;
  margin-top: -200px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
`;

export const LoginForm = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setHeaderProps({ isHidden: true }));
  }, []);

  const [logInUser, { isLoading }] = useLogInUserMutation();
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      await logInUser(email).unwrap();
    } catch (err) {
      console.error("Failed to log in user:", err);
    }
  };

  const handleChange = (e) => setEmail(e.target.value);

  return (
    <LoginFormBackground>
      <LoginFormContent>
        <h1>Please log in</h1>
        <TextField
          fullWidth
          label="Email"
          size="small"
          value={email}
          onChange={handleChange}
        />
        <Button
          sx={{ width: "100%", marginTop: "20px" }}
          variant="contained"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </LoginFormContent>
    </LoginFormBackground>
  );
};
