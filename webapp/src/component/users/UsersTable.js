// Copyright (c) 2025 Milal Daniel Korean School.
import dayjs from 'dayjs';
import * as React from 'react';
import Box from '@mui/material/Box';
import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import UsersCtrl from '../../control/UsersCtrl';
import Resource from '../../framework/resource/Resource';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';
import { DataGrid } from '@mui/x-data-grid';

export default function UsersTable({ search }) {
  const [userList, setUserList] = useState([]); // State for user list
  const MODULE = 'Users';

  useEffect(() => {
    const control = new UsersCtrl(window.APIURL);
    EventPublisher.addEventListener(EventDef.onUserListChange, MODULE, onUserListChange);
    control.updateProfile(search);
    return () => {
      EventPublisher.removeEventListener(EventDef.onUserListChange, MODULE);
    }
  }, [search, window.APIURL]);

  const onUserListChange = (data) => {
    console.log(data);
    setUserList(data); // Update user list state
  }

  const columns = [
    { field: 'id', headerName: Resource.get('users.id'), width: 90 },
    { field: 'username', headerName: Resource.get('users.username'), width: 150 },
    { field: 'email', headerName: Resource.get('users.email'), width: 350 },
    {
      field: 'created_at', headerName: Resource.get('users.created_at'), width: 200,
      renderCell: (params) => {
        return dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      field: 'updated_at', headerName: Resource.get('users.updated_at'), width: 200,
      renderCell: (params) => {
        return dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    { field: 'is_active', headerName: Resource.get('users.is_active'), width: 150 },
    { field: 'role', headerName: Resource.get('users.role'), width: 150 },
  ];

  return (
    <Box
      sx={{
        '& > :not(style)': { m: 1, width: '100%' },
      }}
    >
      <DataGrid
        rows={userList}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        autoHeight
        width={'100%'}
      />
    </Box>
  );
}