// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Resource from '../../framework/resource/Resource';
import SessionManager from '../../control/SessionManager';
import UsersCtrl from '../../control/UsersCtrl';
import Logger from '../../framework/logger/Logger';

export default function AccessedUser(props) {
  const [searchWord, setSearchWord] = React.useState("");
  const [usreList, setUserList] = React.useState([]);
  const usersCtrl = new UsersCtrl(window.APIURL);

  useEffect(() => {
    setSearchWord(SessionManager.getSearchWord('AccessedUsers'));
    
    return () => {
    }
  }, []);

  const fetchUserList = async () => {
    const users = await usersCtrl.getAccessedUser();
    Logger.debug(users);
  }

  const handleSearchChange = (event) => {
    setSearchWord(event.target.value);
    SessionManager.setSearchWord('AccessedUsers', event.target.value);
    Logger.debug("Search text changed:", event.target.value);
  };

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

    </Stack>
  );
}