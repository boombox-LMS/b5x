import React, { useState } from "react";
import { camelcase } from "stringcase";

import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
} from "react-papaparse";

const GREY = "#CCC";
const GREY_LIGHT = "rgba(255, 255, 255, 0.4)";
const DEFAULT_REMOVE_HOVER_COLOR = "#A01919";
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
  DEFAULT_REMOVE_HOVER_COLOR,
  40
);
const GREY_DIM = "#686868";

const styles = {
  zone: {
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: GREY,
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    padding: 20,
  },
  file: {
    background: "linear-gradient(to bottom, #EEE, #DDD)",
    borderRadius: 20,
    display: "flex",
    height: 120,
    width: 120,
    position: "relative",
    zIndex: 10,
    flexDirection: "column",
    justifyContent: "center",
  },
  info: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    paddingLeft: 10,
    paddingRight: 10,
  },
  size: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    marginBottom: "0.5em",
    justifyContent: "center",
    display: "flex",
  },
  name: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    fontSize: 12,
    marginBottom: "0.5em",
  },
  progressBar: {
    bottom: 14,
    position: "absolute",
    width: "100%",
    paddingLeft: 10,
    paddingRight: 10,
  },
  zoneHover: {
    borderColor: GREY_DIM,
  },
  default: {
    borderColor: GREY,
  },
  remove: {
    height: 23,
    position: "absolute",
    right: 6,
    top: 6,
    width: 23,
  },
};

export const DragAndDropCsvReader = ({ handleAcceptedUpload }) => {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR
  );

  // TODO: Any user-group-modification-specific parsing logic
  // should live in the control panel, so the drag and drop csv reader
  // can be used more generically. The csv reader should just
  // convert the rows from arrays to objects with camelcased keys.
  const convertCsvToJson = (csvRows) => {
    const parsedRows = [];
    const headers = csvRows[0];
    for (let i = 1; i < csvRows.length; i++) {
      const row = csvRows[i];
      let parsedRow = {};
      row.forEach((value, i) => {
        parsedRow[headers[i]] = value;
      });

      const groupListHeaders = ["add to groups", "remove from groups"];
      groupListHeaders.forEach((groupListHeader) => {
        // convert comma-separated group names to an array
        if (parsedRow[groupListHeader] && parsedRow[groupListHeader] !== "") {
          parsedRow[groupListHeader] = parsedRow[groupListHeader]
            .replace(/\s/g, "")
            .split(",");
        } else {
          parsedRow[groupListHeader] = [];
        }
        // format the key for compatibility with the server
        const formattedKey = camelcase(groupListHeader.replaceAll(" ", "_"));
        parsedRow[formattedKey] = parsedRow[groupListHeader];
        delete parsedRow[groupListHeader];
      });

      parsedRows.push(parsedRow);
    }
    return parsedRows;
  };

  return (
    <CSVReader
      onUploadAccepted={(results) => {
        handleAcceptedUpload(convertCsvToJson(results.data));
        setZoneHover(false);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setZoneHover(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setZoneHover(false);
      }}
      noClick
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
        Remove,
      }) => (
        <>
          <div
            {...getRootProps()}
            style={Object.assign(
              {},
              styles.zone,
              zoneHover && styles.zoneHover
            )}
          >
            {acceptedFile ? (
              <>
                <div style={styles.file}>
                  <div style={styles.info}>
                    <span style={styles.size}>
                      {formatFileSize(acceptedFile.size)}
                    </span>
                    <span style={styles.name}>{acceptedFile.name}</span>
                  </div>
                  <div style={styles.progressBar}>
                    <ProgressBar />
                  </div>
                  <div
                    {...getRemoveFileProps()}
                    style={styles.remove}
                    onMouseOver={(event) => {
                      event.preventDefault();
                      setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                    }}
                    onMouseOut={(event) => {
                      event.preventDefault();
                      setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                    }}
                  >
                    <Remove color={removeHoverColor} />
                  </div>
                </div>
              </>
            ) : (
              "Drop CSV file here to upload"
            )}
          </div>
        </>
      )}
    </CSVReader>
  );
};
