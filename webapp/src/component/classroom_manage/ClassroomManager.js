// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClassroomTable from './ClassroomTable';
import Resource from '../../framework/resource/Resource';
import SessionManager from '../../control/SessionManager';

export default function ClassroomManager() {
  const [searchWord, setSearchWord] = React.useState(SessionManager.getSearchWord('ClassroomManager'));
  const [selectedYear, setSelectedYear] = useState(SessionManager.getSearchWord('Enrollment_Year') || '2025');
  const [selectedTerm, setSelectedTerm] = useState(SessionManager.getSearchWord('Enrollment_Term') || 'spring');

  useEffect(() => {
    if(SessionManager.getSearchWord('Enrollment_Year') == null) {
      SessionManager.setSearchWord('Enrollment_Year', selectedYear);
    }
    if(SessionManager.getSearchWord('Enrollment_Term') == null) {
      SessionManager.setSearchWord('Enrollment_Term', selectedTerm);
    }
  }, []);

  const handleSearchChange = (event) => {
    setSearchWord(event.target.value);
    SessionManager.setSearchWord('ClassroomManager', event.target.value);
  };

  const onYearChange = (year) => {
    console.log("Year changed:", year);
    SessionManager.setSearchWord('Enrollment_Year', year);
    setSelectedYear(year);
  }

  const onTermChange = (term) => {
    SessionManager.setSearchWord('Enrollment_Term', term);
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
          {["spring", "fall"].map((term) => (
            <option key={term} value={term}>
              {term}
            </option>
          ))}
        </TextField>
        <TextField
          label={Resource.get("common.search")}
          variant="outlined"
          value={searchWord}
          onChange={handleSearchChange}
        />

      </Stack>
      <ClassroomTable search={searchWord} year={selectedYear} term={selectedTerm} />
    </Stack>
  );
}