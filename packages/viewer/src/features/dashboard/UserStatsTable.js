import React from "react";
import { useGetUserStatsQuery } from "../api/apiSlice";
import { LoadingOutlined } from "@ant-design/icons";
import { DataGrid } from "@mui/x-data-grid";
import { Tooltip } from "@mui/material";

const ActivityMap = ({ mapData }) => {
  const eventHeightMultiplier = 0.8;

  return (
    <div>
      {Object.values(mapData).map((count, i) => {
        let outerStyle = {
          width: "7px",
          height: "20px",
          marginRight: "2px",
          border: "1px solid black",
        };

        let innerStyle = {
          height: "100%",
          width: "100%",
        };

        if (count === 0) {
          outerStyle.borderColor = "red";
        } else {
          outerStyle.borderColor = "#008F0F";
          innerStyle.backgroundColor = "#008F0F";
          innerStyle.opacity = `${count * 3 * 0.01}`;
        }

        return (
          <div key={i} style={{ display: "inline-block" }}>
            <Tooltip title={`${count} events`} placement="top" arrow>
              <div className="activity-indicator" style={outerStyle}>
                <div style={innerStyle}></div>
              </div>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

export const UserStatsTable = () => {
  // fetch users
  const {
    data: users,
    isLoading: usersAreLoading,
    isSuccess: usersLoadedSucessfully,
    isError,
    error,
  } = useGetUserStatsQuery();

  if (usersAreLoading) {
    return <LoadingOutlined />;
  } else if (isError) {
    return (
      <div>
        <p>User stats load error: {JSON.stringify(error)}</p>
      </div>
    );
  }

  const columns = [
    {
      field: "email",
      headerName: "Email",
      width: 190,
    },
    {
      field: "joined",
      headerName: "Joined",
      width: 110,
      valueGetter: (params) => {
        const user = params.row;
        const createdAtDate = new Date(user.createdAt);
        var dd = String(createdAtDate.getDate());
        var mm = String(createdAtDate.getMonth() + 1);
        var yyyy = createdAtDate.getFullYear();
        return mm + "/" + dd + "/" + yyyy;
      },
    },
    {
      field: "lastSeen",
      headerName: "Last seen",
      width: 190,
      valueGetter: (params) => {
        const user = params.row;
        return new Date(user.lastSeen).toLocaleString();
      },
    },
    {
      field: "activity",
      headerName: "30-day activity",
      width: 300,
      renderCell: (params) => {
        const user = params.row;
        return <ActivityMap mapData={user.activityMap} />;
      },
    },
    {
      field: "documentCompletions",
      headerName: "Doc completions",
      width: 150,
      valueGetter: (params) => {
        const user = params.row;
        const count = user.completedDocumentUris.length || 0;
        return count;
      },
    },
    {
      field: "responseSubmissions",
      headerName: "Response submissions",
      width: 180,
      valueGetter: (params) => {
        const user = params.row;
        const count = user.responseCount || 0;
        return count;
      },
    },
    {
      field: "responseRetryRate",
      headerName: "Response retry %",
      width: 180,
      valueGetter: (params) => {
        const user = params.row;
        const rate = user.responseRetryPercentage || 0;
        return rate;
      },
    },
    /*
    { 
      field: 'averageResponseLength', 
      headerName: 'Avg chars submitted',
      width: 170 
    },
    */
  ];

  return (
    <div style={{ height: 610 }}>
      <DataGrid
        rows={users}
        columns={columns}
        pageSize={7}
        getRowHeight={() => 71.5}
        rowsPerPageOptions={[7]}
        disableSelectionOnClick
      />
    </div>
  ); /*}</td>

  /*
    return <table style={{width: '100%'}}>
      <thead>
        <tr>
          <td>Email</td>
          <td>Joined</td>
          <td>Last seen</td>
          <td>Activity (last 30 days)</td>
          <td>Document<br />completions</td>
          <td>Response<br /> submissions</td>
          <td>Response<br /> retry rate</td>
          <td>Response length<br />(avg, in chars)</td>
        </tr>
      </thead>
      <tbody>
      {users.map(user => {
        const createdAtDate = new Date(user.createdAt)
        var dd = String(createdAtDate.getDate())
        var mm = String(createdAtDate.getMonth() + 1)
        var yyyy = createdAtDate.getFullYear()
        
        const joinDate = mm + '/' + dd + '/' + yyyy

        return <tr key={user.id}>
          <td>{ user.email }</td>
          <td>{ joinDate }</td>
          <td>{ new Date(user.lastSeen).toLocaleString() } <br /> {/* 
            TODO: Make TimeAgo work again
            <em><TimeAgo date={user.lastSeenTimestamp} live={false}/></em> </td>
          <td style={{textAlign: 'center', paddingTop: '14px'}}><ActivityMap mapData={user.activityMap} /></td>
          <td>{ user.completedDocumentIds.length || 0 }</td>
          <td>{ user.responseCount || 0 }</td>
          <td>{ user.responseRetryPercentage || 0 }%</td>
          <td>{ user.averageResponseLength }</td>
        </tr>
      })}
      </tbody>
    </table>
    */
};
