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
import SessionManager from '../../control/SessionManager';
import Logger from '../../framework/logger/Logger';
import LoginIcon from '@mui/icons-material/Login';
import Resource from '../../framework/resource/Resource'
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Select from '../common/Select';
import { Stack } from '@mui/material';


export default function Welcome(props) {
  const [languageIndex, setLanguage] = React.useState(0);
  const MODULE = 'Welcome';
  const languageMap = {};

  useEffect(() => {
  
    Resource.getLanguages().forEach((language, index) => {
      languageMap[language] = index;
    });

    setLanguage(languageMap[Resource.language]);
    Logger.debug('language index: ', languageMap[Resource.language])

    EventPublisher.addEventListener(EventDef.onLanguageChange, MODULE, onLanguageChange);
    return () => {
      EventPublisher.removeEventListener(EventDef.onLanguageChange, MODULE);
    };
  }, [props]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLanguageChange = (lang) => {
    Resource.getLanguages().forEach((language, index) => {
      languageMap[language] = index;
    });

    setLanguage(languageMap[lang]);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    EventPublisher.publish(EventDef.onMenuChanged, 'ConfirmConsent');
  };

  return (
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          
          <img src='intro.png' alt='Class Description' style={{ width: '100%' }} />
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              startIcon={<LoginIcon />}
            >
              {Resource.get('register.start')}
            </Button>
          </Box>
        </Stack>
  );
}