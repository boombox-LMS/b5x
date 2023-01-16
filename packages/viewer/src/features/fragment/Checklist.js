import React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { FragmentWrapper } from "./FragmentWrapper";

export const Checklist = ({ fragment, response, responseUpdateCallback }) => {
  let responseValue;
  if (!response) {
    responseValue = 0;
  } else {
    // TODO: It seems like the value is being saved as null
    // sometimes, which shouldn't happen. Not sure why that is.
    responseValue = response.value || 0;
  }

  const [activeStep, setActiveStep] = React.useState(responseValue);
  const steps = fragment.children;

  const calculateStatus = (activeStep) => {
    if (activeStep === steps.length) {
      return "completed";
    } else if (activeStep === 0) {
      return "blank";
    } else {
      return "in progress";
    }
  };

  const handleNext = () => {
    const newActiveStep = activeStep + 1;
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: newActiveStep,
      status: calculateStatus(newActiveStep),
    });
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    const newActiveStep = activeStep - 1;
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: newActiveStep,
      status: calculateStatus(newActiveStep),
    });
    setActiveStep(newActiveStep);
  };

  const handleReset = () => {
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: 0,
      status: "blank",
    });
    setActiveStep(0);
  };

  return (
    <div className="checklist" style={{ marginTop: "15px" }}>
      <Box>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((stepFragment, index) => (
            <Step key={stepFragment.uri}>
              <StepLabel>
                <span style={{ fontSize: "1.2em" }}>
                  {stepFragment.data.title}
                </span>
              </StepLabel>
              <StepContent>
                {stepFragment.children.map((childFragment) => {
                  return (
                    <FragmentWrapper
                      key={childFragment.uri}
                      fragment={childFragment}
                    />
                  );
                })}
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {index === steps.length - 1
                        ? "Finish"
                        : "Mark as complete"}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>{fragment.data.completionContent}</Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Reset
            </Button>
          </Paper>
        )}
      </Box>
    </div>
  );
};
