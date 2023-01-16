import React from "react";

// TODO: Move styles out of JS and into CSS file, so they can be overwritten if desired

const VisualListItem = ({ item }) => {
  const { imageUrl, contents } = item;
  return (
    <div className="visual-list__item">
      <div className="visual-list__image">
        <img src={imageUrl} style={{ width: "100%" }} />
      </div>
      <div className="visual-list__item-content">
        <span dangerouslySetInnerHTML={{ __html: contents }} />
      </div>
    </div>
  );
};

const VerticalVisualList = ({ fragment }) => {
  const { items } = fragment.data;
  return (
    <div className="visual-list__vertical">
      {items.map((item, i) => {
        return <VisualListItem item={item} key={i} />;
      })}
    </div>
  );
};

const HorizontalVisualList = ({ fragment }) => {
  const { items } = fragment.data;
  return (
    <div
      className="visual-list__horizontal"
      style={{ gridTemplateColumns: `${"1fr ".repeat(items.length)}` }}
    >
      {items.map((item, i) => {
        return <VisualListItem item={item} key={i} />;
      })}
    </div>
  );
};

export const VisualList = ({ fragment }) => {
  const { items, orientation } = fragment.data;
  return (
    <div className="visual-list">
      <VerticalVisualList fragment={fragment} />
    </div>
  );
};
