// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect, Suspense } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Stack } from '@mui/material';
import Container from '@mui/material/Container';
import Copyright from '../etc/Copyright';
import RegisterCtrl from '../../control/RegisterCtrl';
import Logger from '../../framework/logger/Logger';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Resource from '../..//framework/resource/Resource';
import Login from './Login'
import Topbar from './Topbar'
import SelectStudent from './SelectStudent';
import EnrollmentRegister from './EnrollmentRegister';
import WaitingRoom from './WaitingRoom';
import Blocked from './Blocked';
import ScheduleCtrl from '../../control/SchedulesCtrl';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';
import ClassesCtrl from '../../control/ClassesCtrl';
import ConfirmConsent from './ConfirmConsent';

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
  const [selectedMenu, setSelectedMenu] = React.useState('ConfirmConsent');
  const [language, setLanguage] = React.useState(Resource.language);
  const [year, setYear] = React.useState('2024');
  const [term, setTerm] = React.useState('spring');
  const languageMap = {};
  const MODULE = 'Register';

  useEffect(() => {

    EventPublisher.addEventListener(EventDef.onLanguageChange, MODULE, setLanguage);
    EventPublisher.addEventListener(EventDef.onMenuChanged, MODULE, onMenuChanged);
    EventPublisher.addEventListener(EventDef.onScheduleListChange, MODULE, onScheduleListChange);
    EventPublisher.addEventListener(EventDef.onClassListChange, MODULE, (classes) => {
      RegisterCtrl.classes = classes;
    });


    EventPublisher.addEventListener(EventDef.onEnrollmentListChange, MODULE, (enrollments) => { RegisterCtrl.enrollments = enrollments; });
    RegisterCtrl.startScheduleCheck(); // Start schedule checking on initialization
    setLanguage(languageMap[Resource.language]);
    const schedule_control = new ScheduleCtrl(window.APIURL);
    schedule_control.getSchedules();

    return () => {
      EventPublisher.removeEventListener(EventDef.onClassListChange, MODULE);
      EventPublisher.removeEventListener(EventDef.onEnrollmentListChange, MODULE);
      EventPublisher.removeEventListener(EventDef.onLanguageChange, MODULE);
      EventPublisher.removeEventListener(EventDef.onMenuChanged, MODULE);
      EventPublisher.removeEventListener(EventDef.onScheduleListChange, MODULE);
      RegisterCtrl.stopScheduleCheck();
    };
  }, []);

  const onScheduleListChange = (schedules) => {
    console.log('onScheduleListChange:', schedules);

    // Get the earliest schedule (smallest id or -1)
    const earliestSchedule = schedules.reduce((earliest, current) => {
      return (current.id < earliest.id || earliest.id === -1) ? current : earliest;
    }, { id: -1 }); // Default to an object with id -1

    // Get the latest schedule (largest id)
    const lastSchedule = schedules.reduce((latest, current) => {
      return current.id > (latest?.id || 0) ? current : latest;
    }, null);

    console.log('Earliest Schedule:', earliestSchedule);
    console.log('Latest Schedule:', lastSchedule);

    const currentDateTime = earliestSchedule.opening_time;
    const openingTime = lastSchedule.opening_time;
    const closingTime = lastSchedule.closing_time;
    RegisterCtrl.currentDateTime = currentDateTime;
    RegisterCtrl.timeGap = Date.now() - new Date(currentDateTime).getTime();

    console.log('Current Time Gap:', RegisterCtrl.timeGap);
    const currentDate = new Date(currentDateTime);
    const openingDate = new Date(openingTime);
    const closingDate = new Date(closingTime);

    console.log('Current DateTime:', currentDate);
    console.log('Opening Time:', openingDate);
    console.log('Closing Time:', closingDate);

    if (RegisterCtrl.year != lastSchedule.year || RegisterCtrl.term != lastSchedule.term) {
      const enroll_control = new EnrollmentCtrl(window.APIURL);
      enroll_control.getEnrollment(lastSchedule.year, lastSchedule.term);
    }

    RegisterCtrl.year = lastSchedule.year;
    RegisterCtrl.term = lastSchedule.term;
    setYear(lastSchedule.year);
    setTerm(lastSchedule.term);
    RegisterCtrl.openingDate = openingDate;
    RegisterCtrl.closingDate = closingDate;

    if (currentDate >= openingDate && currentDate <= closingDate) {
      if (selectedMenu === 'Blocked') {
        Logger.info('Register is open');
        setSelectedMenu('Login');
      }
    } else {
      Logger.info('Register is closed');
      setSelectedMenu('Blocked');
    }

    const class_control = new ClassesCtrl(window.APIURL);
    class_control.getClasses(null, RegisterCtrl.year, RegisterCtrl.term);
  };

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
      case 'WaitingRoom':
        return (<WaitingRoom />);
      case 'Blocked':
        return (<Blocked />);
      case 'ConfirmConsent':
        return (<ConfirmConsent consentList={RegisterCtrl.consents}/>);
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
            <Stack direction='column' spacing={2} alignItems='center' justifyContent='center' sx={{ }}>

              <Topbar year={year} term={term}/>

              {displayContent()}

              <Copyright style={{ marginTop: '50px', width: '100%', textAlign: 'center', paddingTop: '4px' }} />

            </Stack>
          </Container>
        </Box>
      </Box>

    </ThemeProvider>
  );
}

