import React from "react";
import { useGetTopicStatsQuery } from "../api/apiSlice";
import { LoadingOutlined } from "@ant-design/icons";
import { DataGrid } from "@mui/x-data-grid";
import { Tooltip } from "@mui/material";
import _ from "lodash";

const SimpleNpsChart = ({ scores }) => {
  if (scores.length === 0) {
    return null;
  }

  const scoreCounts = {};
  scores.forEach((score) => {
    if (scoreCounts[score]) {
      scoreCounts[score] += 1;
    } else {
      scoreCounts[score] = 1;
    }
  });

  const sortedScores = _.clone(scores).sort((a, b) => a - b);

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${scores.length}, 1fr)`,
    gridGap: "1px",
    width: "100%",
    borderTop: "1px dashed green",
    borderBottom: "1px solid black",
  };

  const barStyle = {
    backgroundColor: "darkgray",
    width: "100%",
    display: "flex",
    marginTop: "auto",
    color: "transparent",
  };

  const title = JSON.stringify(scoreCounts)
    .replaceAll('"', "")
    .replace("}", "")
    .replace("{", "")
    .replaceAll(",", ", ");

  return (
    <Tooltip title={title} placement="top" arrow>
      <div style={containerStyle}>
        {sortedScores.map((score, i) => {
          return (
            <div
              key={i}
              style={{ ...barStyle, height: `calc(10% * ${score})` }}
            >
              .
            </div>
          );
        })}
      </div>
    </Tooltip>
  );
};

const TopicFunnel = ({ topic }) => {
  const oneThird = topic.enrollmentCount / 3;
  const twoThirds = oneThird * 2;

  return (
    <>
      {topic.funnel.map((documentData, i) => {
        let documentDivStyle = {
          display: "inline-block",
          verticalAlign: "center",
          border: "1px solid black",
          padding: "2px",
          width: "7px",
          height: "20px",
          marginRight: "2px",
          textAlign: "center",
        };

        if (documentData.completionCount < oneThird) {
          documentDivStyle.backgroundColor = "#ffadad";
        } else if (documentData.completionCount < twoThirds) {
          documentDivStyle.backgroundColor = "#fcfc88";
        } else {
          documentDivStyle.backgroundColor = "#88fc9b";
        }

        return (
          <div key={i}>
            <Tooltip
              title={`${documentData.completionCount} completions / ${topic.enrollmentCount} enrolled`}
              placement="top"
              arrow
            >
              <div
                className="activity-indicator"
                style={documentDivStyle}
              ></div>
            </Tooltip>
          </div>
        );
      })}
    </>
  );
};

export const TopicStatsTable = () => {
  // fetch topic stats
  const {
    data: topics,
    isLoading: topicsAreLoading,
    isSuccess: topicsLoadedSuccessfully,
    isError,
    error,
  } = useGetTopicStatsQuery();

  if (topicsAreLoading) {
    return null;
  } else if (isError) {
    return (
      <div>
        <p>Topic stats load error: {JSON.stringify(error)}</p>
      </div>
    );
  }

  const columns = [
    {
      field: "uri",
      headerName: "URI",
      width: 220,
      renderCell: (params) => {
        const topic = params.row;
        return (
          <a href={`http://localhost:3000/topics/${topic.uri}`}>{topic.uri}</a>
        );
      },
    },
    {
      field: "last updated",
      headerName: "Last updated",
      width: 140,
      valueGetter: (params) => {
        const topic = params.row;
        const createdAtDate = new Date(topic.createdAt);
        var dd = String(createdAtDate.getDate());
        var mm = String(createdAtDate.getMonth() + 1);
        var yyyy = createdAtDate.getFullYear();
        return mm + "/" + dd + "/" + yyyy;
      },
    },
    {
      field: "completionCount",
      headerName: "Completions",
      width: 140,
    },
    {
      field: "completionRate",
      headerName: "Completion rate",
      width: 140,
      valueGetter: (params) => {
        const topic = params.row;
        return `${topic.completionRate}%`;
      },
    },
    {
      field: "enrollmentCount",
      headerName: "Enrolled users",
      width: 140,
    },
    {
      field: "documentCompletionFunnel",
      headerName: "Document completion funnel",
      width: 300,
      renderCell: (params) => {
        const topic = params.row;
        return <TopicFunnel topic={topic} />;
      },
    },
    {
      field: "NPS",
      headerName: "NPS",
      width: 140,
      renderCell: (params) => {
        const topic = params.row;
        const title = `n = ${topic.npsData.scores.length}`;
        return (
          <div>
            <Tooltip title={title} placement="top" arrow>
              <span>{topic.npsData.calculatedNps}</span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      field: "NPS distribution",
      headerName: "NPS distribution",
      width: 140,
      renderCell: (params) => {
        const topic = params.row;
        return <SimpleNpsChart scores={topic.npsData.scores} />;
      },
    },
  ];

  return (
    <div style={{ height: 610 }}>
      <DataGrid
        getRowId={(row) => row.uri}
        rows={topics}
        columns={columns}
        pageSize={7}
        getRowHeight={() => 71.5}
        rowsPerPageOptions={[7]}
        disableSelectionOnClick
      />
    </div>
  );
};
