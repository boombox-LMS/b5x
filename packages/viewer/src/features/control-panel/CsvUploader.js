import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { camelcase } from "stringcase";

export const CsvUploader = ({ handleUpload }) => {
  const processCsvData = (rows) => {
    // camelcase keys
    rows.forEach((row) => {
      const rowKeys = Object.keys(row);
      rowKeys.forEach((rowKey) => {
        const newRowKey = camelcase(rowKey.replaceAll(" ", "_"));
        if (newRowKey !== rowKey) {
          row[newRowKey] = row[rowKey];
          delete row[rowKey];
        }
      });
    });
    handleUpload(rows);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const result = Papa.parse(file, {
      header: true,
      complete: (results) => {
        processCsvData(results.data);
      },
    });
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  return (
    <div
      {...getRootProps({
        className: `dropzone
      ${isDragAccept && "dropzone--accepted-file-type"}
      ${isDragReject && "dropzone--rejected-file-type"}`,
      })}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the CSV file here ...</p>
      ) : (
        <p>Drag 'n' drop a CSV file here, or click to select file</p>
      )}
    </div>
  );
};
