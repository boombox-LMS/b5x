import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setHeaderProps } from "../layout/header/headerSlice";
import { useGetTopicsCatalogQuery } from "../api/apiSlice";
import { TopicList } from "./TopicList";
import { Filter } from "./Filter";
import "react-tabs/style/react-tabs.css";

export const Catalog = () => {
  // update the header props
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setHeaderProps({
        isHidden: false,
        isMinimized: false,
        title: "Tech Learning Home",
        currentPage: "Home",
      })
    );
  }, []);

  // load topics
  const {
    data: catalog = {},
    isLoading: catalogIsLoading,
    isSuccess: catalogLoadedSuccessfully,
    isError: catalogHadError,
    error: catalogError,
  } = useGetTopicsCatalogQuery();

  // TODO: Store the user's topic search filters in the session,
  // and return these filters as part of the catalog API response,
  // setting them to defaults if no session data is present from the user
  const [searchFilters, setSearchFilters] = useState({
    priorityLevel: {
      available: false,
      recommended: true,
      assigned: true,
    },
    completionStatus: {
      "not started": true,
      "in progress": true,
      completed: false,
    },
  });

  const updateSearchFiltersCallback = ({
    filterCategoryName,
    statusName,
    value,
  }) => {
    let searchFiltersCopy = JSON.parse(JSON.stringify(searchFilters));
    searchFiltersCopy[filterCategoryName][statusName] = value;
    setSearchFilters(searchFiltersCopy);
  };

  let content;

  if (catalogIsLoading) {
    content = "";
  } else if (catalogLoadedSuccessfully) {
    let topicsToDisplay = [];

    // filter topics
    catalog.topics.forEach((topic) => {
      // do not show if this topic's completion status is unselected in filters
      if (!searchFilters.completionStatus[topic.completionStatus]) {
        return;
      }
      // do not show if this topic's priority level is unselected in filters
      if (!searchFilters.priorityLevel[topic.priorityLevel]) {
        return;
      }
      // otherwise, add it to the displayed topics list
      topicsToDisplay.push(topic);
    });

    content = (
      <div className="catalog">
        <div className="catalog__filter">
          <Filter
            searchFilters={searchFilters}
            updateSearchFiltersCallback={updateSearchFiltersCallback}
          />
        </div>
        <div className="catalog__results-page">
          {catalog.topics.length === 0 && <p>No courses to display.</p>}
          {catalog.topics.length > 0 && (
            <div className="catalog__topic-list">
              <TopicList topics={topicsToDisplay} />
            </div>
          )}
        </div>
      </div>
    );
  } else if (catalogHadError) {
    content = (
      <div>
        <p>Catalog error: {JSON.stringify(catalogError)}</p>
      </div>
    );
  }

  return <div>{content}</div>;
};
