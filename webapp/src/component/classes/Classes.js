// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClassesTable from './ClassesTable';
import Resource from '../../framework/resource/Resource';
import SessionManager from '../../control/SessionManager';

export default function Classes() {
  const [searchWord, setSearchWord] = React.useState(SessionManager.getSearchWord('Classes'));
  const [selectedYear, setSelectedYear] = useState(SessionManager.getSearchWord('Classes_Year') || 'all');
  const [selectedTerm, setSelectedTerm] = useState(SessionManager.getSearchWord('Classes_Term') || 'all');


  const handleSearchChange = (event) => {
    setSearchWord(event.target.value);
    SessionManager.setSearchWord('Classes', event.target.value);
    console.log("Search text changed:", event.target.value);
  };

  const onYearChange = (year) => {
    console.log("Year changed:", year);
    SessionManager.setSearchWord('Classes_Year', year);
    setSelectedYear(year);
  }

  const onTermChange = (term) => {
    console.log("Term changed:", term);
    SessionManager.setSearchWord('Classes_Term', term);
    setSelectedTerm(term);
  };

  const years = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => 2025 + i);

  return (
    <Stack spacing={2}>
      <div style={{ marginBottom: '10px' }}></div>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <TextField
          select
          label={Resource.get('classes.year')}
          value={selectedYear}
          onChange={(event) => onYearChange(event.target.value)}
          SelectProps={{
            native: true,
          }}
          variant="outlined"
        >
            <option key={'all'} value={'all'}>
              {'all'}
            </option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </TextField>
        <TextField
          select
          label={Resource.get('classes.term')}
          value={selectedTerm}
          onChange={(event) => onTermChange(event.target.value)}
          SelectProps={{
            native: true,
          }}
          variant="outlined"
        >
          {["all", "spring", "fall"].map((term) => (
            <option key={term} value={term}>
              {term}
            </option>
          ))}
        </TextField>
        <TextField 
          label="Search" 
          variant="outlined" 
          value={searchWord}
          onChange={handleSearchChange} 
        />
        <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearchChange}>
        </Button>
      </Stack>
      <ClassesTable search={searchWord} year={selectedYear} term={selectedTerm}/> 
    </Stack>
  );
}