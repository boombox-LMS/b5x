import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/apiSlice";
import ReactCanvasConfetti from "react-canvas-confetti";
import { FiveStarInput } from "./partials/FiveStarInput";

export const TopicCompletionConfirmation = ({ topicUri }) => {
  const { topicIsCompleted } = api.endpoints.getEnrollment.useQuery(topicUri, {
    selectFromResult: ({ data }) => ({
      topicIsCompleted: data.topicIsCompleted,
    }),
  });

  const [verifyTopicCompletionTrigger, topicCompletionMutationResult] =
    api.endpoints.verifyTopicCompletion.useMutation();
  // const [confettiIsPopping, setConfettiIsPopping] = useState(false)

  useEffect(() => {
    if (!topicIsCompleted) {
      verifyTopicCompletionTrigger(topicUri).then((response) => {
        if (response.data.topicIsCompleted) {
          // setConfettiIsPopping(true)
        }
      });
    }
  }, [topicUri]);

  return (
    <div style={{ marginTop: "30px" }}>
      <h1>Congratulations</h1>
      <p>
        You've finished this topic. Shall we head back to the{" "}
        <Link to="/">catalog</Link>?
      </p>
    </div>
  );

  /*
  return <div style={{ marginTop: '30px'}}>
    <ReactCanvasConfetti 
        origin={{ x: 0.5, y: 1.1 }} 
        scalar={ 1.6 } 
        gravity={ 0.9 } 
        particleCount={ 120 } 
        ticks={ 300 } 
        spread={ 90 } 
        decay={ 0.95 } 
        onDecay={() => { setConfettiIsPopping(false) }}
        style={{ position: 'absolute', top: '0px', left: '0px', width: '100%', height: '100%', zIndex: `${ confettiIsPopping ? '100' : '-100'}` }} fire={ confettiIsPopping } />
    <h1>Congratulations!</h1>
    <p>You've finished this topic. Shall we head back to the <Link to="/">catalog</Link>?</p>
  </div>
  */
};

export const TopicCompletionContent = ({ topicUri }) => {
  /*
  const [topicRating, setTopicRating] = useState(null)
  if (topicRating === null) {
    return <div>
      <p>Please rate this topic:</p>
      <FiveStarInput onChangeCallback={setTopicRating} />
    </div>
  } else {
    */
  return <TopicCompletionConfirmation topicUri={topicUri} />;
  // }
};
