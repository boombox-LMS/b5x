import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLogInUserMutation } from "../api/apiSlice";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { setHeaderProps } from "../header/headerSlice";

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
    <div className="login-form__background">
      <div className="login-form__content">
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
      </div>
    </div>
  );
};
