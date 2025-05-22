// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Resource from '../../framework/resource/Resource';

export default function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {Resource.get('common.copyright', new Date().getFullYear())}
    </Typography>
  );
}
