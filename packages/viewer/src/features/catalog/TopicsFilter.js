import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  InboxOutlined,
  HistoryOutlined,
  StarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  BuildOutlined,
} from "@ant-design/icons";
import {
  selectCurrentTopicFilter,
  updateTopicFilter,
} from "./topicFilterSlice";
import { muiTheme, INACTIVE_MENU_ICON_COLOR } from "../../theme";
import styled from "styled-components/macro";

const FilterButton = styled.div`
  ${(props) => (props.isActive ? `font-weight: 500;` : ``)}
  ${(props) =>
    props.isActive
      ? `color: ${muiTheme.palette.greenlit.dark};`
      : `color: ${INACTIVE_MENU_ICON_COLOR};`}
  text-align: center;
  border-width: 1px;
  padding: 0.6em 0.7em;
  font-size: 0.9em;
  position: relative;
  ${(props) => {
    if (props.isActive) {
      return `z-index: 2; background-color: ${muiTheme.palette.greenlit.light};`;
    } else {
      return `z-index: 1;`;
    }
  }}
  ${(props) => {
    // set the border color
    let css = `border-color: ${
      props.isActive
        ? muiTheme.palette.greenlit.dark
        : muiTheme.palette.gray.light
    };`;
    // round the appropriate corners
    if (props.position === "top") {
      css += `border-radius: 5px 5px 0 0;`;
    } else if (props.position === "bottom") {
      css += `border-radius: 0 0 5px 5px;`;
    }
    // add the border
    if (props.position !== "bottom") {
      css += `border-bottom-style: solid;`;
    }
    if (props.position !== "top") {
      css += `margin-top: -1px;`;
      css += `border-top-style: solid;`;
    }
    return css;
  }}
`;

const inputCss = `
  padding: 0.4em 0.5em;
  border-radius: 0.3em;
`;

const FilterButtonSet = ({ filterCategoryName, searchFilters }) => {
  const dispatch = useDispatch();

  const icons = {
    priorityLevel: {
      recommended: StarOutlined,
      assigned: InboxOutlined,
    },
    completionStatus: {
      // "in progress": HistoryOutlined,
      // completed: CheckCircleOutlined,
    },
    // not actually in use yet
    contentType: {
      activity: BuildOutlined,
      document: FileTextOutlined,
    },
  };

  const statusNames = Object.keys(searchFilters[filterCategoryName]);

  const getButtonPosition = (i) => {
    if (i === 0) {
      return "top";
    } else if (i === statusNames.length - 1) {
      return "bottom";
    } else {
      return "middle";
    }
  };

  return (
    <div
      css={`
        margin-top: -7px;
      `}
    >
      {statusNames.map((statusName, i) => {
        const value = searchFilters[filterCategoryName][statusName];
        const Icon = icons[filterCategoryName][statusName];
        return (
          <FilterButton
            key={statusName}
            index={i}
            isActive={value}
            position={getButtonPosition(i)}
            onClick={() => {
              dispatch(
                updateTopicFilter({
                  filterCategoryName,
                  statusName,
                  value: !value,
                })
              );
            }}
          >
            {Icon && (
              <div
                className="filter-button-icon"
                css={`
                  margin-bottom: -2px;
                  font-size: 1.5em;
                `}
              >
                <Icon />
              </div>
            )}
            {statusName}
          </FilterButton>
        );
      })}
    </div>
  );
};

const FilterLabel = styled.div`
  font-size: 0.9em;
  text-align: center;
  font-weight: 500;
  margin-bottom: 10px;
  margin-top: 15px;
  &:first-child {
    margin-top: 5px;
  }
`;

// TODO: Style as topics-filter module,
// and rename the component to TopicsFilter
export const TopicsFilter = () => {
  const searchFilters = useSelector(selectCurrentTopicFilter);

  return (
    <div className="filter">
      {/* Priority levels */}
      <FilterLabel>Show content that is</FilterLabel>
      <FilterButtonSet
        searchFilters={searchFilters}
        filterCategoryName="priorityLevel"
      />

      {/* Completion status  */}
      <FilterLabel>with a status of</FilterLabel>
      <FilterButtonSet
        searchFilters={searchFilters}
        filterCategoryName="completionStatus"
      />
    </div>
  );
};
