// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Resource from '../../framework/resource/Resource';
import SessionManager from '../../control/SessionManager';
import UsersCtrl from '../../control/UsersCtrl';
import Logger from '../../framework/logger/Logger';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';
import Defines from '../Defines';
import StuidentCtrl from '../../control/StudentsCtrl';
import RegisterCtrl from '../../control/RegisterCtrl';

export default function AccessedUser(props) {
  const [searchWord, setSearchWord] = React.useState("");
  const [userList, setUserList] = React.useState([]);
  const [userListAccessed, setUserListAccessed] = React.useState([]);
  const usersCtrl = new UsersCtrl(window.APIURL);
  const MODULE = 'AccessedUser';

  useEffect(() => {
    EventPublisher.addEventListener(EventDef.onStudentListChange, MODULE, onStudentListChange);
    const control = new StuidentCtrl(window.APIURL);
    control.getStudents('');
    setSearchWord(SessionManager.getSearchWord('AccessedUsers'));
    fetchUserList();

    const intervalId = setInterval(fetchUserList, 1000); // Set timer to fetch user list every second

    return () => {
      clearInterval(intervalId); // Clear the interval on component unmount
      EventPublisher.removeEventListener(EventDef.onStudentListChange, MODULE);
    };
  }, []);

  const fetchUserList = async () => {
    const users = await usersCtrl.getAccessedUser();
    users.map((user) => user['id'] = user['index']);
    setUserListAccessed(users);
    Logger.debug('accessed user: ', users);
    refreshUserList(users, RegisterCtrl.students);
  }

  const isEqual=(email1, email2) => {
    return email1.trim().toLowerCase() === email2.trim().toLowerCase();    
  }

  const refreshUserList = (accessUser, userInDb) => {
    Logger.debug('refreshUserList', accessUser, userInDb);
    if (accessUser.length == 0 || userInDb.length == 0) {
        setUserList([]);
        return;
    }

    const updatedList = accessUser.map((accessedUser) => {
      const dbUsers = userInDb.filter((dbUser) => isEqual(dbUser.email, accessedUser.email));
      Logger.debug('refreshUserList dbUsers:', dbUsers);

      const names = dbUsers.map((db) => db.name).join(', '); // Append db.name for multiple matches

      return {
        id: accessedUser.index,
        email: accessedUser.email,
        parent_name: dbUsers[0].parent_name,
        position: accessedUser.position,
        last_access: accessedUser.last_access,
        session_key: accessedUser.session_key,
        names: names,
        phone: dbUsers[0].phone
      };
    });
    Logger.debug(updatedList);
    setUserList(updatedList);
  }

  const onStudentListChange = (users) => {    
    RegisterCtrl.students = users;
    refreshUserList(userListAccessed, users);
  }

  const handleSearchChange = (event) => {
    setSearchWord(event.target.value);
    SessionManager.setSearchWord('AccessedUsers', event.target.value);
    Logger.debug("Search text changed:", event.target.value);
  };

  
  const columns = [
    { field: 'id', headerName: Resource.get('students.id'), width: 90 },
    { field: 'parent_name', headerName: Resource.get('students.parent_name'), width: 150 },
    { field: 'names', headerName: Resource.get('students.name'), width: 250 },
    { field: 'email', headerName: Resource.get('students.email'), width: 250 },
    { field: 'phone', headerName: Resource.get('students.phone'), width: 150 },
    { field: 'position', headerName: 'Position', width: 90 },
    {
      field: 'last_access', headerName: 'Last Access', width: 200,
      renderCell: (params) => {
        return dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    { field: 'session_key', headerName: 'Session Key', width: 250 },
  ];

  return (
    <Stack spacing={2}>
      <div style={{ marginBottom: '10px' }}></div>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <TextField 
          label={Resource.get("common.search")} 
          variant="outlined" 
          value={searchWord}
          onChange={handleSearchChange} 
        />
        <Button variant="contained" startIcon={<SearchIcon />}>
          {Resource.get("common.search")}
        </Button>

      </Stack>
      <DataGrid
                rows={userList}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                autoHeight
                width={'100%'}
              />
    </Stack>
  );
}