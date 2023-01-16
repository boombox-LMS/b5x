import React from "react";
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

const FilterButtonSet = ({
  filterCategoryName,
  searchFilters,
  updateSearchFiltersCallback,
}) => {
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
      {Object.keys(searchFilters[filterCategoryName]).map((statusName) => {
        const value = searchFilters[filterCategoryName][statusName];
        const Icon = icons[filterCategoryName][statusName];
        return (
          <div
            key={statusName}
            className={`filter-button ${value ? "filter-button--active" : ""}`}
            onClick={() => {
              updateSearchFiltersCallback({
                filterCategoryName,
                statusName,
                value: !value,
              });
            }}
          >
            {Icon && (
              <div className="filter-button-icon">
                <Icon />
              </div>
            )}
            {statusName}
          </div>
        );
      })}
    </>
  );
};

// TODO: Style as topics-filter module,
// and rename the component to TopicsFilter
export const Filter = ({ searchFilters, updateSearchFiltersCallback }) => {
  return (
    <div className="filter">
      {/* Priority levels */}
      <p className="filter-label">Show content that is</p>
      <FilterButtonSet
        searchFilters={searchFilters}
        filterCategoryName="priorityLevel"
        updateSearchFiltersCallback={updateSearchFiltersCallback}
      />

      {/* Completion status  */}
      <p className="filter-label">with a status of</p>
      <FilterButtonSet
        searchFilters={searchFilters}
        filterCategoryName="completionStatus"
        updateSearchFiltersCallback={updateSearchFiltersCallback}
      />

      <p className="filter-label">tagged with</p>
      <input type="text" placeholder="search" />

      <p className="filter-label">title/description matching</p>
      <input type="text" placeholder="search" />
    </div>
  );
};
