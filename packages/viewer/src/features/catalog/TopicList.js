import React from "react";
import { TopicCard } from "./TopicCard";
import styled from "styled-components/macro";

const TopicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  grid-gap: 30px;
  margin: 15px;
  padding-bottom: 50px;
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
