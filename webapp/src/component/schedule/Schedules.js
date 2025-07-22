// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { Stack } from '@mui/material';
import SchedulesTable from './SchedulesTable';

export default function Schedules(props) {

  return (
    <Stack spacing={2}>
      <div style={{ marginBottom: '10px' }}></div>
      <SchedulesTable/> 
    </Stack>
  );
}