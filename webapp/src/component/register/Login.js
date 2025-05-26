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
import Copyright from '../etc/Copyright';
import SessionManager from '../../control/SessionManager';
import Logger from '../../framework/logger/Logger';
import LoginIcon from '@mui/icons-material/Login';
import Resource from '../../framework/resource/Resource'
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Select from '../common/Select';
import { Stack } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';

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
  const [apiUrl, setApiUrl] = React.useState(localStorage.getItem('apiUrl') || window.APIURL);
  const MODULE = 'Login';
  const languageMap = {};

  useEffect(() => {
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

  const handleLanguageChange = (value) => {
    Logger.debug('handleLanguageChange:', Resource.getLanguages()[value]);
    Resource.setLanguage(Resource.getLanguages()[value]);
    setLanguage(value);
  };

  let virtekImageClickCount = 0;
  let cameraImageClickCount = 0;
  const onCameraImageClick = (event) => {
    cameraImageClickCount++;
    Logger.info(cameraImageClickCount, virtekImageClickCount);
    if (cameraImageClickCount !== virtekImageClickCount) {
      cameraImageClickCount = virtekImageClickCount = 0;
    }
    if (virtekImageClickCount === 5) {
      Resource.setTestingMode(true);
      Resource.setLanguage('fo-fo');
      EventPublisher.publish(EventDef.onLanguageChange, Resource.language);
    }
  }
  const onVirtekImageClick = (event) => {
    virtekImageClickCount++;
    if (virtekImageClickCount > cameraImageClickCount + 1) {
      cameraImageClickCount = virtekImageClickCount = 0;
    }
  }

  const onSearchEmail = (event) => {

    RegisterCtrl.findEmail(searchEmail, (data) => {
      Logger.info('Found email:', data);
      RegisterCtrl.students = data;
      EventPublisher.publish(EventDef.onMenuChanged, 'SelectStudent');

    }, (error) => {
      Logger.error('Error finding email:', error);
      alert('이메일을 찾을 수가 없습니다. 다시 시도해 주세요.');
    });
  }

  return (

        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{ width: '500px' }}
        >

          <Box sx={{ height: 50 }} />
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <Typography textAlign={'center'} >
              {'지난 2025년 봄학기 등록되었던 학생이면, 아래에서 등록시 사용되었던 부모님의 Email 주소를 입력해 주세요.'}
            </Typography>
            <Typography textAlign={'center'} >
              {'If you child was a student of previous term(spring term of year 2025), please enter the email address.'}
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              id="id"
              label={"Find Parent's Email or phone numer : "}
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              startIcon={<LoginIcon />}
              disabled={!foundEmail}
              onClick={onSearchEmail}
            >
              {'2025년 가을학기 수강신청청 시작하기'}
            </Button>
            <Box sx={{ height: 30 }} />
            <Typography textAlign={'center'} >
              {'Or register from scratch if your child is new to the school.'}
            </Typography>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              startIcon={<LoginIcon />}
            >
              {'신규 학생으로 2025년 가을학기 수강신청 시작하기'}
            </Button>

            {/* <Box sx={{ marginTop: 2, mt: 1 }}>
              {Resource.getLanguages().length > 0 ?
                <Select
                  fullWidth
                  List={Resource.getLanguages()}
                  Value={language} Title={Resource.get("usermenu.language")}
                  onValueChanged={handleLanguageChange}
                /> : ''}
            </Box> */}
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


          </Box>
        </Stack>
   
  );
}