import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PlusCircleOutlined,
  InboxOutlined,
  HistoryOutlined,
  StarOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  BuildOutlined,
} from "@ant-design/icons";
import {
  selectCurrentTopicFilter,
  updateTopicFilter,
} from "./topicFilterSlice";
import styled from "styled-components/macro";

const FilterButton = styled.div`
  ${(props) => props.isActive && `font-weight: 500;`}
  ${(props) => props.isActive && `color: #008f0f;`}
  text-align: center;
  margin-bottom: 8px;
  padding: 0.5em 0.6em;
  border-radius: 0.3em;
  font-size: 0.9em;
  background-color: ${(props) => (props.isActive ? "#f0fcf2" : "#f0f0f0")};
  border: 1.5px solid ${(props) => (props.isActive ? "#008f0f" : "#f0f0f0")};
  ${(props) => props.index === 0 && `margin-top: -7px;`}
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
      "in progress": HistoryOutlined,
      completed: CheckCircleOutlined,
    },
    // not actually in use yet
    contentType: {
      activity: BuildOutlined,
      document: FileTextOutlined,
    },
  };

  return (
    <>
      {Object.keys(searchFilters[filterCategoryName]).map((statusName, i) => {
        const value = searchFilters[filterCategoryName][statusName];
        const Icon = icons[filterCategoryName][statusName];
        return (
          <FilterButton
            key={statusName}
            index={i}
            isActive={value}
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
                  margin-bottom: -3.5px;
                  font-size: 1.3em;
                `}
              >
                <Icon />
              </div>
            )}
            {statusName}
          </FilterButton>
        );
      })}
    </>
  );
};

// TODO: Style as topics-filter module,
// and rename the component to TopicsFilter
export const TopicsFilter = () => {
  const searchFilters = useSelector(selectCurrentTopicFilter);

  return (
    <div className="filter">
      {/* Priority levels */}
      <p className="filter-label">Show content that is</p>
      <FilterButtonSet
        searchFilters={searchFilters}
        filterCategoryName="priorityLevel"
      />

      {/* Completion status  */}
      <p className="filter-label">with a status of</p>
      <FilterButtonSet
        searchFilters={searchFilters}
        filterCategoryName="completionStatus"
      />
    </div>
  );
};
