import React, { useState } from "react";
import { FragmentWrapper } from "./FragmentWrapper";
import { RtfInput } from "./partials/RtfInput";

export const LongTextQuestion = ({
  fragment,
  response,
  responseUpdateCallback,
}) => {
  /*
  let inputClass = ""

  if (responseValue) {
    inputClass = 'long-text-question__textarea long-text-question__textarea--completed specificity-bump'
  } else {
    responseValue = ''
    inputClass = 'long-text-question__textarea specificity-bump'
  }

  const [localResponse, setLocalResponse] = useState(responseValue)
  
  const handleSubmit = () => {
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: localResponse,
      status: "completed"
    })
  }

  const handleChange = (e) => setLocalResponse(e.target.value)

  return <div className='long-text-question'>
    {fragment.children.map(childFragment => {
      return <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
    })}
    <textarea rows={3} className={inputClass}
      value={localResponse}
      onChange={handleChange} 
    />
    <button disabled={localResponse === responseValue} onClick={handleSubmit}>Submit</button>
  </div>
  */
  let rawContentState;
  if (response && response.value && response.value.rawContentState) {
    rawContentState = response.value.rawContentState;
  }

  const handleSubmit = (rawContentState) => {
    responseUpdateCallback({
      fragmentUri: fragment.uri,
      value: { rawContentState },
      status: "completed",
    });
  };

  return (
    <div>
      {fragment.children.map((childFragment) => {
        return (
          <FragmentWrapper key={childFragment.uri} fragment={childFragment} />
        );
      })}
      <RtfInput
        rawContentState={rawContentState}
        submitCallback={handleSubmit}
      />
    </div>
  );
};
