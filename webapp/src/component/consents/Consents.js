// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ConsentsTable from './ConsentsTable';
import Resource from '../../framework/resource/Resource';
import SessionManager from '../../control/SessionManager';

export default function Consents(props) {

  return (
    <Stack spacing={2}>
      <div style={{ marginBottom: '10px' }}></div>
      <ConsentsTable/> 
    </Stack>
  );
}