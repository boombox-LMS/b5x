import React from "react";
import { TopicCard } from "./TopicCard";

export const TopicList = ({ topics }) => {
  return (
    <div className="topic-list">
      {topics.map((topic) => {
        return <TopicCard topic={topic} key={topic.uri} />;
      })}
    </div>
  );
};
