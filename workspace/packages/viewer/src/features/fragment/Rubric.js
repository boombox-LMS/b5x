import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import Button from "@mui/material/Button";

export const Rubric = ({ fragment, response, responseUpdateCallback }) => {
  const answers = fragment.data.answers;

  let responseValue;
  if (!response || !response.value) {
    responseValue = {};
    answers.forEach((answer) => {
      responseValue[answer.id] = false;
    });
  } else {
    responseValue = response.value;
  }

  const [localResponse, setLocalResponse] = useState(responseValue);

  const handleGradingChange = (answerId) => {
    let newLocalResponse = JSON.parse(JSON.stringify(localResponse));
    newLocalResponse[answerId] = !newLocalResponse[answerId];
    setLocalResponse(newLocalResponse);
  };

  const submitGrade = () => {
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: localResponse,
      status: "completed",
    });
  };

  return (
    <div className="rubric">
      <hr className="rubric__heading-background-rule" />
      <div className="rubric__heading">Check your work</div>
      <p>
        Click the items that your above answer included, then submit your
        result.
      </p>
      {answers.map((answer) => {
        return (
          <div
            className={`rubric__answer ${
              localResponse[answer.id] ? "rubric__answer--met" : ""
            }`}
            key={answer.id}
            onClick={() => {
              handleGradingChange(answer.id);
            }}
          >
            <div className="rubric__grade-indicator">
              <div className="rubric__checkmark">
                {localResponse[answer.id] && (
                  <FontAwesomeIcon icon={faCheck} size="1x" />
                )}
              </div>
              <div className="rubric__xmark">
                {!localResponse[answer.id] && (
                  <FontAwesomeIcon icon={faXmark} size="1x" />
                )}
              </div>
            </div>
            <div className="rubric__answer-contents">{answer.htmlContents}</div>
          </div>
        );
      })}
      {JSON.stringify(localResponse) !== JSON.stringify(responseValue) &&
        Object.values(localResponse).every((val) => val === true) && (
          <div style={{ marginTop: "13px" }}>
            <Button
              variant="contained"
              style={{ width: "100%" }}
              onClick={submitGrade}
            >
              Submit
            </Button>
          </div>
        )}
      {JSON.stringify(localResponse) !== JSON.stringify(responseValue) &&
        !Object.values(localResponse).every((val) => val === true) && (
          <div
            style={{
              marginTop: "13px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              columnGap: "10px",
            }}
          >
            <Button variant="contained" onClick={submitGrade}>
              Submit as final answer
            </Button>
            <Button variant="contained" onClick={submitGrade}>
              Reset and try again later
            </Button>
          </div>
        )}
    </div>
  );
};
