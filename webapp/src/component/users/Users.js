// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UsersTable from './UsersTable';
import Resource from '../../framework/resource/Resource';
import SessionManager from '../../control/SessionManager';

export default function Users(props) {
  const [searchWord, setSearchWord] = React.useState("");

  useEffect(() => {
    setSearchWord(SessionManager.getSearchWord('Users'));
    return () => {
    }
  }, []);

  const handleSearchChange = (event) => {
    setSearchWord(event.target.value);
    SessionManager.setSearchWord('Users', event.target.value);
    console.log("Search text changed:", event.target.value);
  };

  return (
    <Stack spacing={2}>
      <div style={{ marginBottom: '10px' }}></div>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <TextField 
          label="Search" 
          variant="outlined" 
          value={searchWord}
          onChange={handleSearchChange} 
        />
        <Button variant="contained" startIcon={<SearchIcon />}>
          {Resource.get("common.search")}
        </Button>
      </Stack>
      <UsersTable search={searchWord}/> 
    </Stack>
  );
}