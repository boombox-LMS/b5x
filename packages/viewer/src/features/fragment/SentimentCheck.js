import React from "react";
import { FrownOutlined, SmileOutlined } from "@ant-design/icons";

export const SentimentCheck = ({
  fragment,
  responseValue,
  responseUpdateCallback,
}) => {
  // make local copy of the response to manipulate until the user submits
  // const [localResponse, setLocalResponse] = useState(responseValue)

  //  responseUpdateCallback({ fragmentUri: fragment.uri, value: localResponse })

  /*  const handleClick = (event) => {
    if (event.key === "Enter" && localResponse.length > 0) {
      responseUpdateCallback({ fragmentUri: fragment.uri, value: localResponse })
    }
  }

  const handleChange = (event) => {
    setLocalResponse(event.target.value)
  }
  */

  return (
    <div>
      <div>
        The above diagram is a new type of exercise we're trying out. How did
        you feel about it?
      </div>
      <div style={{ margin: "15px auto" }}>
        <FrownOutlined
          style={{ fontSize: "40px", color: "black", marginRight: "10px" }}
        />
        <SmileOutlined style={{ fontSize: "40px", color: "black" }} />
      </div>
    </div>
  );
};
