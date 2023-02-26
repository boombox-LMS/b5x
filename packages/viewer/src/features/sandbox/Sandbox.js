import React from "react";
import styled from "styled-components/macro";
import { muiTheme, COLORS } from "../../theme";

const VerticalVisualListItems = [
  {
    imageUrl:
      "	http://localhost:8080/topic-assets/boombox-feature-utopia-vseed/images/leadership.svg",
    contents:
      "<h1>The Leader</h1><ul><li>Identifies and prioritizes knowledge gaps</li><li>Assesses and recognizes content health at the org level</li></ul>",
  },
  {
    imageUrl:
      "http://localhost:8080/topic-assets/boombox-feature-utopia-vseed/images/developer.svg",
    contents:
      "<h1>The Subject-Matter-Expert</h1><ul><li>Contributes information</li><li>Maintains technical accuracy of information</li></ul>",
  },
  {
    imageUrl:
      "	http://localhost:8080/topic-assets/boombox-feature-utopia-vseed/images/apple.svg",
    contents:
      "<h1>The Learning-Team Member</h1><ul><li>Enhances/repackages high-priority content</li><li>Assigns or recommends content</li><li>Supports learners, especially new hires</li><li>Analyzes metrics and feedback</li></ul>",
  },
  {
    imageUrl:
      "http://localhost:8080/topic-assets/boombox-feature-utopia-vseed/images/creative-idea.svg",
    contents:
      "<h1>The Learner</h1><ul><li>Consumes technical information</li><li>Demonstrates skills by completing challenges</li><li>Provides feedback on content</li><li>Requests new content</li></ul>",
  },
  {
    imageUrl:
      "http://localhost:8080/topic-assets/boombox-feature-utopia-vseed/images/organization-chart.svg",
    contents:
      "<h1>The Manager</h1><ul><li>Assigns or recommends content to team</li><li>Assesses and recognizes participation in knowledge-sharing</li></ul>",
  },
];

const HorizontalVisualListItems = [
  {
    imageUrl:
      "	http://localhost:8080/topic-assets/boombox-feature-utopia-vseed/images/leadership.svg",
    contents:
      "<h1>The Leader</h1><p>Identifies and prioritizes knowledge gaps</p>",
  },
  {
    imageUrl:
      "http://localhost:8080/topic-assets/boombox-feature-utopia-vseed/images/developer.svg",
    contents:
      "<h1>The Subject-Matter-Expert</h1><p>Contributes information</p>",
  },
  {
    imageUrl:
      "	http://localhost:8080/topic-assets/boombox-feature-utopia-vseed/images/apple.svg",
    contents:
      "<h1>The Learning-Team Member</h1><p>Enhances/repackages high-priority content</p>",
  },
  {
    imageUrl:
      "http://localhost:8080/topic-assets/boombox-feature-utopia-vseed/images/creative-idea.svg",
    contents: "<h1>The Learner</h1><p>Consumes technical information</p>",
  },
  {
    imageUrl:
      "http://localhost:8080/topic-assets/boombox-feature-utopia-vseed/images/organization-chart.svg",
    contents:
      "<h1>The Manager</h1><p>Assigns or recommends content to team</p>",
  },
];

const VerticalVisualListWrapper = styled.div`
  display: grid;
  grid-template-columns: 3px 75px auto;
  grid-gap: 1.2rem;
  margin: 1.2rem 0;
  h1 {
    font-size: 1.2em;
    margin-bottom: 5px;
  }
  ul {
    margin-top: 5px;
    padding-left: 15px;
  }
  *:first-child {
    padding-top: 0;
    margin-top: 0;
  }
  *:last-child {
    padding-bottom: 0;
    margin-bottom: 0;
  }
`;

const VerticalVisualListItem = ({ item }) => {
  return (
    <>
      <div
        css={`
          background-color: ${COLORS.MEDIUM_GRAY};
        `}
      ></div>
      <div>
        <img src={item.imageUrl} />
      </div>
      <div dangerouslySetInnerHTML={{ __html: item.contents }} />
    </>
  );
};

const VerticalVisualList = ({ items }) => {
  return (
    <VerticalVisualListWrapper>
      {items.map((item, index) => {
        return <VerticalVisualListItem key={index} item={item} />;
      })}
    </VerticalVisualListWrapper>
  );
};

export const Sandbox = () => {
  return (
    <div style={{ paddingLeft: "30px", paddingRight: "30px" }}>
      <hr />
      <VerticalVisualList items={VerticalVisualListItems} />
      <hr />
    </div>
  );
};
