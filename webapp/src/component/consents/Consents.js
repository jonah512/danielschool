// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { Stack} from '@mui/material';
import ConsentsTable from './ConsentsTable';

export default function Consents(props) {

  return (
    <Stack spacing={2}>
      <div style={{ marginBottom: '10px' }}></div>
      <ConsentsTable/> 
    </Stack>
  );
}