// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Resource from '../../framework/resource/Resource';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';

export default function TopBar(props) {
  const MODULE = 'TopBar';

  useEffect(() => {
    return () => {
    };
  }, [props]);


  return (
    <Typography
      component="h1"
      variant="h6"
      color="while"
      background="black"
      noWrap
      sx={{ flexGrow: 1 }}
    >
      <Stack direction="row" spacing={1}>
        <Box alignSelf="center">
          <img
            src="daniel_logo.png"
            height={30}
            alt="Daniel  Logo"
          />
        </Box>
        <Stack direction="column" width={"100%"}>
          <Typography
            variant="h5"
            textAlign="center"
            width={'100%'}
            style={{ color: 'inherit', fontWeight: 'bold' }}
          >
            {Resource.get("common.title")}
          </Typography>
        </Stack>
      </Stack>
    </Typography>
  );
}
