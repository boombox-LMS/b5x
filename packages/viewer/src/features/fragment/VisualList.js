import React from "react";
import styled from "styled-components/macro";
import { COLORS } from "../../theme";

const VerticalVisualListWrapper = styled.div`
  display: grid;
  grid-template-columns: 3px 75px auto;
  grid-gap: 1.2rem;
  margin: 1.2rem 0;
  // TODO: Break out an explicit title component
  // in the visual list markup, so we're not needing
  // to trust the user to use an h1 for the title.
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

const VerticalVisualListItemBorder = styled.div`
  background-color: ${COLORS.LIGHT_GRAY};
`;

const VerticalVisualListItem = ({ item }) => {
  return (
    <>
      <VerticalVisualListItemBorder />
      <div>
        <img
          src={item.imageUrl}
          css={`
            width: 75px;
          `}
        />
      </div>
      <div dangerouslySetInnerHTML={{ __html: item.contents }} />
    </>
  );
};

const VerticalVisualList = ({ fragment }) => {
  const { items } = fragment.data;
  return (
    <VerticalVisualListWrapper>
      {items.map((item, index) => {
        return <VerticalVisualListItem key={index} item={item} />;
      })}
    </VerticalVisualListWrapper>
  );
};

const HorizontalVisualListWrapper = styled.div`
  display: grid;
  grid-gap: 1.2rem;
  grid-template-columns: repeat(${(props) => props.itemCount}, 1fr);
  h1 {
    font-size: 1.2em;
    margin-bottom: 3px;
  }
  p {
    margin-top: 3px;
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

const HorizontalVisualList = ({ fragment }) => {
  const { items } = fragment.data;
  return (
    <HorizontalVisualListWrapper itemCount={items.length}>
      {items.map((item, index) => {
        return <HorizontalVisualListItem key={index} item={item} />;
      })}
    </HorizontalVisualListWrapper>
  );
};

const HorizontalVisualListItem = ({ item }) => {
  return (
    <div>
      <div
        css={`
          text-align: center;
          padding-bottom: 8px;
        `}
      >
        <img
          src={item.imageUrl}
          css={`
            width: 100%;
            max-width: 100px;
          `}
        />
      </div>
      <div
        css={`
          text-align: center;
        `}
        dangerouslySetInnerHTML={{ __html: item.contents }}
      />
    </div>
  );
};

export const VisualList = ({ fragment }) => {
  const { items, orientation } = fragment.data;
  if (orientation === "horizontal") {
    return <HorizontalVisualList fragment={fragment} />;
  } else if (orientation === "vertical") {
    return <VerticalVisualList fragment={fragment} />;
  }
};
