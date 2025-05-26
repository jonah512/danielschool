// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect, Suspense } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Stack } from '@mui/material';
import Container from '@mui/material/Container';
import Copyright from '../etc/Copyright';

import Logger from '../../framework/logger/Logger';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Resource from '../..//framework/resource/Resource';
import Login from './Login'
import Tobbar from './Topbar'
import SelectStudent from './SelectStudent';
import EnrollmentRegister from './EnrollmentRegister';

const drawerWidth = 240;

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#E0BFE6',
    },
    red: {
      main: '#FF0D00'
    },
    button: {
      main: '#F5F5F5'
    },
  },
});

export default function Register() {
  const [selectedMenu, setSelectedMenu] = React.useState('Login');
  const [language, setLanguage] = React.useState(Resource.language);

  const MODULE = 'Register';

  useEffect(() => {

    EventPublisher.addEventListener(EventDef.onLanguageChange, MODULE, setLanguage);
    EventPublisher.addEventListener(EventDef.onMenuChanged, MODULE, onMenuChanged);

    return () => {
      EventPublisher.removeEventListener(EventDef.onLanguageChange, MODULE);
      EventPublisher.removeEventListener(EventDef.onMenuChanged, MODULE);
    };
  }, []);


  const onMenuChanged = (menu) => {
    Logger.debug('onMenuChanged Menu : ' + menu);
    // ask menu chanbge first
    setSelectedMenu(menu);
  };

  const displayContent = () => {
    Logger.debug('displayContent Menu : ' + selectedMenu);
    switch (selectedMenu) {
      case 'Login':
        return (<Login />);
      case 'SelectStudent':
        return (<SelectStudent />);
      case 'EnrollmentRegister':
        return (<EnrollmentRegister />);
      default:
        return (selectedMenu);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <Box
          maxWidth='2200'
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
            width: '100%'
          }}
        >
          <Container maxWidth='2200' className='main_content' sx={{ width: '100%' }} spacing={3}>
            <Stack direction='column' spacing={2} alignItems='center' justifyContent='center' sx={{ height: '100%' }}>

              <Tobbar />

              {displayContent()}

              <Copyright style={{ marginTop: '50px', width: '100%', textAlign: 'center', paddingTop: '4px' }} />

            </Stack>
          </Container>
        </Box>
      </Box>

    </ThemeProvider>
  );
}

