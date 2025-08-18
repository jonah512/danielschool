// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Copyright from './component/etc/Copyright';
import SessionManager from './control/SessionManager';
import Logger from './framework/logger/Logger';
import LoginIcon from '@mui/icons-material/Login';
import Resource from './framework/resource/Resource'
import EventPublisher from './framework/event/EventPublisher';
import { EventDef } from './framework/event/EventDef';
import Select from './component/common/Select';
import { Stack } from '@mui/material';
import RegisterCtrl from './control/RegisterCtrl';
import Register from './component/register/Register';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#2D393B',
    },
  },
});

export default function Login(props) {
  const [deviceConnectionStatus, setDeviceConnectionStatus] = React.useState(false);
  const [languageIndex, setLanguage] = React.useState(0);
  const [apiUrl, setApiUrl] = React.useState( window.APIURL);
  const MODULE = 'Login';
  const languageMap = {};

  useEffect(() => {
    RegisterCtrl.parent_email = '';
    RegisterCtrl.session_key = '';

    SessionManager.addDeviceConnectionArbiter("login_window", onDeviceConnectionStatusChanged)
    
    Resource.getLanguages().forEach((language, index) => {
      languageMap[language] = index;
    });

    setLanguage(languageMap[Resource.language]);
    Logger.debug('language index: ', languageMap[Resource.language])

    EventPublisher.addEventListener(EventDef.onLanguageChange, MODULE, onLanguageChange);
    EventPublisher.addEventListener(EventDef.onApiIpChanged, MODULE, setApiUrl);
    return () => {
      EventPublisher.removeEventListener(EventDef.onLanguageChange, MODULE);
      EventPublisher.removeEventListener(EventDef.onApiIpChanged, MODULE);
      SessionManager.removeDeviceConnectionArbiter("login_window")
    };
  }, [props]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDeviceConnectionStatusChanged = (value, changed) => {
    setDeviceConnectionStatus(value);
  }

  const onLanguageChange = (lang) => {
    Resource.getLanguages().forEach((language, index) => {
      languageMap[language] = index;
    });

    setLanguage(languageMap[lang]);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    Logger.debug('handleSubmit:', event);
    if (props.onLogin !== undefined) props.onLogin(data.get('id'), data.get('password'));
  };

  const handleLanguageChange = (value) => {
    Logger.debug('handleLanguageChange:', Resource.getLanguages()[value]);
    Resource.setLanguage(Resource.getLanguages()[value]);
    setLanguage(value);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <img src="daniel_logo.png" width='300' alt='Daniel School Admin Page'></img>
          <Box sx={{ height: 30}} />
          <Typography component="h1" variant="h4" textAlign={'center'} >
            {Resource.get('common.title')}
          </Typography>
            <Box sx={{ height: 50}} />
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="id"
              label={Resource.get('login.id')}
              name="id"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={Resource.get('login.password')}
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Box sx={{ marginTop: 2, mt: 1 }}>
              {Resource.getLanguages().length > 0 ?
                <Select
                  fullWidth
                  List={Resource.getLanguages()}
                  Value={languageIndex} Title={Resource.get("usermenu.language")}
                  onValueChanged={handleLanguageChange}
                /> : ''}
            </Box>
            {false ? (
              <TextField
                margin="normal"
                label="API Host URL"
                fullWidth
                defaultValue={apiUrl}
                onChange={(e) => {
                  window.APIURL = e.target.value;
                }}
              />) : (<div></div>)
            }

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              startIcon={<LoginIcon />}
            >
              {Resource.get('login.sign_in')}
            </Button>
          </Box>
        </Stack>
        <Copyright sx={{ mt: 8, mb: 4, ml: 5, mr: 5 }} />
      </Container>
    </ThemeProvider>
  );
}