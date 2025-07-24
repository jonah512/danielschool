// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect, Suspense } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Users from './component/users/Users';
import Copyright from './component/etc/Copyright';
import LeftMenu from './component/left_menu/LeftMenu'
import LeftMenuEntities from './component/left_menu/LeftMenuEntities'
import LeftMenuRelations from './component/left_menu/LeftMenuRelations';
import TopBar from './component/top_bar/TopBar';

import Logger from './framework/logger/Logger';
import SessionManager from './control/SessionManager';
import Os from './framework/os/Os';
import UserMenu from './component/user_menu/UserMenu';
import EventPublisher from './framework/event/EventPublisher';
import { EventDef } from './framework/event/EventDef';
import Resource from './framework/resource/Resource';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import UserRole from './framework/user_role/UserRole';
import Students from './component/students/Students';
import Teachers from './component/teachers/Teachers';
import Classes from './component/classes/Classes';
import EnrollmentStudent from './component/enrollment_student/EnrollmentStudent';
import ClassroomManager from './component/classroom_manage/ClassroomManager';
import Schedules from './component/schedule/Schedules';
import Consents from './component/consents/Consents';
import AccessedUser from './component/users/AccessedUser';
import Requests from './component/request/Requests';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#1565C0', // Darker blue tone for primary color
    },
    secondary: {
      main: '#64B5F6', // Lighter blue for secondary color
    },
    red: {
      main: '#FF0D00'
    },
    button: {
      main: '#BBDEFB'
    },
    background: {
      default: '#E3F2FD', // Light blue background
    },
  },
});


export default function DanielAdminApp() {
  const [open, setOpen] = React.useState(!Os.isMobileBrowser());
  const [selectedMenu, setSelectedMenu] = React.useState('Students');
  const [language, setLanguage] = React.useState(Resource.language);
  const [role, setRole] = React.useState('');

  const MODULE = 'DanielAdminApp';

  useEffect(() => {
    SessionManager.addDeviceConnectionArbiter(MODULE, onCmsConnectionChanged);
    EventPublisher.addEventListener(EventDef.onUserRoleChange, MODULE, setRole);
    EventPublisher.addEventListener(EventDef.onLanguageChange, MODULE, setLanguage);
    EventPublisher.addEventListener(EventDef.onMenuChanged, MODULE, onMenuChanged);
    checkUpdateResult();
    return () => {
      SessionManager.removeDeviceConnectionArbiter(MODULE);
      EventPublisher.removeEventListener(EventDef.onUserRoleChange, MODULE);
      EventPublisher.removeEventListener(EventDef.onLanguageChange, MODULE);
      EventPublisher.removeEventListener(EventDef.onMenuChanged, MODULE);
    };
  }, []);

  const onCmsConnectionChanged = (connected, changed) => {
    if (changed) {
      UserRole.load(SessionManager.getUserRole());
    }
  }

  const checkUpdateResult = () => {

  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const onMenuChanged = (menu) => {
    Logger.debug('onMenuChanged Menu : ' + menu);
    // ask menu chanbge first
    setSelectedMenu(menu);
  };

  const displayContent = () => {
    Logger.debug('displayContent Menu : ' + selectedMenu);
    switch (selectedMenu) {
      case 'Users':
        return (<Users />);
      case 'Students':
        return (<Students />);
      case 'Teachers':
        return (<Teachers />);
      case 'Classes':
        return (<Classes />);
      case 'EnrollmentStudent':
        return (<EnrollmentStudent />);
      case 'ClassroomManager':
        return (<ClassroomManager />);
      case 'Schedules':
        return (<Schedules />);
      case 'Consents':
        return (<Consents />);
      case 'AccessedUser':
        return (<AccessedUser />)
      case 'Requests':
        return (<Requests />);
      case 'Login':
        window.location.reload();
        break;
      default:
        return (selectedMenu);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar sx={{ pr: '24px', }} spacing={2}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
            <TopBar />

            <UserMenu RebootSet={true} />
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[50]
                  : theme.palette.grey[900],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List >
            <LeftMenu onMenuChanged={onMenuChanged} SelectedMenu={selectedMenu} UserRole={role} />
            <Divider sx={{ my: 1 }} />
            <LeftMenuEntities onMenuChanged={onMenuChanged} SelectedMenu={selectedMenu} />
            <Divider sx={{ my: 1 }} />
            <LeftMenuRelations onMenuChanged={onMenuChanged} SelectedMenu={selectedMenu} />
            <Divider sx={{ my: 1 }} />

          </List>
        </Drawer>
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
          <Toolbar />
          <Container maxWidth='2200' className='main_content' sx={{ width: '100%' }} spacing={3}>

            {displayContent()}
            <div style={{ position: 'relative' }}>
              <Copyright style={{ marginTop: '50px', width: '100%', textAlign: 'center', paddingTop: '4px' }} />
            </div>
          </Container>
        </Box>
      </Box>

    </ThemeProvider>
  );
}

