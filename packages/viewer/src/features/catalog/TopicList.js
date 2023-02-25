import React from "react";
import { TopicCard } from "./TopicCard";
import styled from "styled-components/macro";

const TopicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(225px, 1fr));
  grid-gap: 20px;
  margin: 15px;
`;

export const TopicList = ({ topics }) => {
  return (
    <TopicGrid>
      {topics.map((topic) => {
        return <TopicCard topic={topic} key={topic.uri} />;
      })}
    </TopicGrid>
  );
};
