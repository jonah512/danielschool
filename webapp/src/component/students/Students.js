// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';
import StudentsTable from './StudentsTable';
import Resource from '../../framework/resource/Resource';
import SessionManager from '../../control/SessionManager';
import Logger from '../../framework/logger/Logger';

export default function Students(props) {
  const [searchWord, setSearchWord] = React.useState("");

  useEffect(() => {
    setSearchWord(SessionManager.getSearchWord('Students'));
    return () => {
    }
  }, []);

  const handleSearchChange = (event) => {
    setSearchWord(event.target.value);
    SessionManager.setSearchWord('Students', event.target.value);
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
      </Stack>
      <StudentsTable search={searchWord}/> 
    </Stack>
  );
}