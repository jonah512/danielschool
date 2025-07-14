// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SessionManager from '../../control/SessionManager';
import Logger from '../../framework/logger/Logger';
import LoginIcon from '@mui/icons-material/Login';
import Resource from '../../framework/resource/Resource'
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import { Stack } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';
import AddNewStudent from '../students/AddNewStudent';
import Grid from '@mui/material/Grid';
import FindEmail from './FindEmail';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#2D393B',
    },
  },
});

export default function Login(props) {

  const [language, setLanguage] = React.useState(0);
  const [foundEmail, setFoundEmail] = React.useState(false);
  const [searchEmail, setSearchEmail] = React.useState(RegisterCtrl.parent_email);
  const [showNewRegistration, setShowNewRegistration] = React.useState(false);
  const [apiUrl, setApiUrl] = React.useState(localStorage.getItem('apiUrl') || window.APIURL);
  const [showEmailSearchPopupWnd, setShowEmailSearchPopupWnd] = React.useState(false);
  const MODULE = 'Login';
  const languageMap = {};

  useEffect(() => {

    RegisterCtrl.cleanUpSession();

    setLanguage(languageMap[Resource.language]);
    EventPublisher.addEventListener(EventDef.onLanguageChange, MODULE, onLanguageChange);
    EventPublisher.addEventListener(EventDef.onApiIpChanged, MODULE, setApiUrl);
    return () => {
      EventPublisher.removeEventListener(EventDef.onLanguageChange, MODULE);
      EventPublisher.removeEventListener(EventDef.onApiIpChanged, MODULE);
      SessionManager.removeDeviceConnectionArbiter("login_window")
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
    const data = new FormData(event.currentTarget);
    Logger.debug('handleSubmit:', event);
    if (props.onLogin !== undefined) props.onLogin(data.get('id'), data.get('password'));
  };

  const onSearchEmail = (event) => {

    RegisterCtrl.findEmail(searchEmail, (data) => {
      console.log('Found email:', data);
      RegisterCtrl.students = data;
      EventPublisher.publish(EventDef.onMenuChanged, 'SelectStudent');

    }, (error) => {
      Logger.error('Error finding email:', error);
      alert(Resource.get('register.cannot_find_email'));
    });
  };

  const startNewRegistration = (event) => {
    setShowNewRegistration(true);
  };

  const handleCloseAddStudentDialog = (student) => {
    setShowNewRegistration(false);
    RegisterCtrl.findEmail(student.email, (data) => {
      console.log('Found email:', data);
      RegisterCtrl.students = data;
      EventPublisher.publish(EventDef.onMenuChanged, 'SelectStudent');

    }, (error) => {
      Logger.error('Error finding email:', error);
      alert(Resource.get('register.cannot_find_email'));
    });
  };

  const showEmailSearchPopup = () => {
    console.log('setShowEmailSearchPopupWnd');
    setShowEmailSearchPopupWnd(true);
  }

  return (

    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{ width: '560px' }}
    >

      <Box sx={{ height: 50 }} />

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <Typography textAlign={'left'} >
          {Resource.get('register.guide_korean')}
        </Typography>
        <Typography textAlign={'left'} >
        {Resource.get('register.guide_english')}
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}> {/* 50% width for TextField */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="id"
              label={Resource.get('register.find_email')}
              name="id"
              autoFocus
              onChange={(e) => {
                const value = e.target.value;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(value)) {
                  setFoundEmail(true);
                }
                setSearchEmail(value);
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="contained" onClick={showEmailSearchPopup}>{Resource.get('register.find_email_by_name')}</Button>
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          startIcon={<LoginIcon />}
          disabled={!foundEmail}
          onClick={onSearchEmail}
        >
        {Resource.get('register.start_registration', RegisterCtrl.year, Resource.get('topbar.' + RegisterCtrl.term))}
        </Button>
        <Box sx={{ height: 30 }} />
        <Typography textAlign={'center'} >
          {Resource.get('register.guide2')}
        </Typography>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          startIcon={<LoginIcon />}
          onClick={startNewRegistration}
        >
        {Resource.get('register.create_new_student', RegisterCtrl.year, Resource.get('topbar.' + RegisterCtrl.term))}
        </Button>

        {false ? (
          <TextField
            margin="normal"
            label="API Host URL"
            fullWidth
            defaultValue={apiUrl}
            onChange={(e) => {
              window.APIURL = e.target.value;
              localStorage.setItem('apiUrl', window.APIURL)
            }}
          />) : (<div></div>)
        }
        {showNewRegistration && (
          <AddNewStudent open={showNewRegistration} onAddStudent={handleCloseAddStudentDialog} onClose={()=>setShowNewRegistration(false)}/>
        )}
        {showEmailSearchPopupWnd && 
        <FindEmail funcConfirm={()=>setShowEmailSearchPopupWnd(false)}/>
        }
      </Box>
    </Stack>

  );
}