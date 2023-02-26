import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import Button from "@mui/material/Button";
import styled from "styled-components/macro";
import { COLORS, muiTheme } from "../../theme";

// TODO: Use CSS grid to lay out the rubric answers / results

const AnswerContents = styled.div`
  display: inline-block;
  vertical-align: top;
  margin-top: -1px;
  margin-left: 10px;
  width: 95%;
`;

const RubricWrapper = styled.div`
  margin-top: 30px;
  padding-bottom: 10px;
  border-bottom: 1.5px solid ${muiTheme.palette.secondary.main};
  cursor: default;
`;

const Heading = styled.div`
  text-align: center;
  background-color: white;
  margin: auto;
  width: 150px;
  z-index: 1;
  margin-top: -22px;
  font-weight: 500;
`;

const HeadingRule = styled.hr`
  z-index: 0;
  border-top: 1.5px solid ${muiTheme.palette.secondary.main};
`;

const RubricXmark = styled.div`
  color: lightgray;
  margin-left: 3px;
`;

const RubricCheckmark = styled.div`
  color: ${COLORS.GREENLIT_DARK};
  margin-left: 3px;
`;

const GradeIndicator = styled.div`
  display: inline-block;
  vertical-align: top;
  width: 20px;
  font-size: 1.3em;
  color: ${COLORS.GREENLIT_DARK};
`;

const Answer = styled.div`
  padding: 10px 7px;
  ${(props) => props.isMet && `background-color: ${COLORS.GREENLIT_LIGHT};`}
  & + & {
    margin-top: 8px;
    margin-bottom: 8px;
    border-top: none;
  }
`;

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
    <RubricWrapper>
      <HeadingRule />
      <Heading>Check your work</Heading>
      <p>
        Click the items that your above answer included, then submit your
        result.
      </p>
      {answers.map((answer) => {
        return (
          <Answer
            isMet={localResponse[answer.id]}
            key={answer.id}
            onClick={() => {
              handleGradingChange(answer.id);
            }}
          >
            <GradeIndicator>
              <div>
                {localResponse[answer.id] && (
                  <FontAwesomeIcon icon={faCheck} size="1x" />
                )}
              </div>
              <RubricXmark>
                {!localResponse[answer.id] && (
                  <FontAwesomeIcon icon={faXmark} size="1x" />
                )}
              </RubricXmark>
            </GradeIndicator>
            <AnswerContents>{answer.htmlContents}</AnswerContents>
          </Answer>
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
    </RubricWrapper>
  );
};
