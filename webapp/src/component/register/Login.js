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
import Select from '../common/Select';
import { Stack } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';
import AddNewStudent from '../students/AddNewStudent';
import Grid from '@mui/material/Grid';
import FindEmail from './FindEmail';
import { useMediaQuery, useTheme } from '@mui/material'; // Add responsive utilities
import SearchIcon from '@mui/icons-material/Search';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#2D393B',
    },
  },
});

export default function Login(props) {

  const [language, setLanguage] = React.useState(0);
  const [searchEmail, setSearchEmail] = React.useState(RegisterCtrl.parent_email);
  const [showNewRegistration, setShowNewRegistration] = React.useState(false);
  const [showFindEmail, setShowFindEmail] = React.useState(false);
  const [apiUrl, setApiUrl] = React.useState(localStorage.getItem('apiUrl') || window.APIURL);
  const MODULE = 'Login';
  const languageMap = {};

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen size is small

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

  const onStartPreviousStudent = () => {
    EventPublisher.publish(EventDef.onMenuChanged, 'EmailLogin');    
  }

  const onSearchEmail = (event) => {
    if(searchEmail === null || searchEmail === ''){
      return;
    }

    RegisterCtrl.findEmail(searchEmail, (data) => {
      Logger.debug('Found email:', data);
      RegisterCtrl.students = data;
      RegisterCtrl.parent_email = searchEmail;
      RegisterCtrl.parent_name = data[0].parent_name || '';
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
    RegisterCtrl.selected_student = student;
    RegisterCtrl.findEmail(student.email, (data) => {
      Logger.debug('Found email:', data);
      RegisterCtrl.students = data;
      EventPublisher.publish(EventDef.onMenuChanged, 'EnrollmentRegister');

    }, (error) => {
      Logger.error('Error finding email:', error);
      alert(Resource.get('register.cannot_find_email'));
    });
  };

  const onCloseFindEmail = () =>{
    setShowFindEmail(false);
  }

  return (

    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        width: isMobile ? '100%' : '560px', // Adjust width for mobile
        padding: isMobile ? 2 : 0, // Add padding for mobile
      }}
    >

      <Box sx={{ height: isMobile ? 20 : 50 }} /> {/* Adjust spacing for mobile */}

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%', padding: isMobile ? 2 : 0 }}>
        <Typography textAlign="left" fontSize={isMobile ? '0.9rem' : '1rem'}> {/* Adjust font size */}
          {Resource.get('register.guide_korean')}
        </Typography>
        <Typography textAlign="left" fontSize={isMobile ? '0.9rem' : '1rem'}> {/* Adjust font size */}
        {Resource.get('register.guide_english')}
        </Typography>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, fontSize: isMobile ? '0.9rem' : '1rem' }} // Adjust font size
          onClick={onStartPreviousStudent}
        >
        {Resource.get('register.start_registration')}
        </Button>
        <Box sx={{ height: isMobile ? 20 : 30 }} /> {/* Adjust spacing for mobile */}
        <Typography textAlign="center" fontSize={isMobile ? '0.9rem' : '1rem'}> {/* Adjust font size */}
          {Resource.get('register.guide2')}
        </Typography>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, fontSize: isMobile ? '0.9rem' : '1rem' }} // Adjust font size
          onClick={startNewRegistration}
        >
        {Resource.get('register.create_new_student')}
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

        {showFindEmail && <FindEmail funcConfirm={onCloseFindEmail}/>}

      </Box>
    </Stack>

  );
}