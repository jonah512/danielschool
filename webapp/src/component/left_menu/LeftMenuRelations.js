// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import Logger from '../../framework/logger/Logger';
import Resource from '../../framework/resource/Resource';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';

export default function LeftMenuRelations(props) {

  const [selectedMenu, SetSelectedMenu] = React.useState(props.SelectedMenu);

  useEffect(() => {
    SetSelectedMenu(props.SelectedMenu);
    Logger.debug('LeftMenuRelations:', props.SelectedMenu, selectedMenu);
    return () => {
    };
  }, [props]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleListItemClick = (event, menu) => {
    SetSelectedMenu(menu);
    if (props !== null && props.onMenuChanged !== null)
      props.onMenuChanged(menu);
  };

  return (
    <React.Fragment>
      <List>
        <ListItemButton
          sx={{
            "&.Mui-selected": {
              backgroundColor: "#641c71",
              color: "#000000",
              ":hover": { backgroundColor: "#D4A8DC" }
            },
            ":hover": { backgroundColor: "#D4A8DC" }
          }}
          selected={selectedMenu === 'EnrollmentStudent'}
          onClick={(event) => handleListItemClick(event, 'EnrollmentStudent')}>
          <ListItemIcon sx={{ color: selectedMenu === 'EnrollmentStudent' ? "#FFFFFF" : "inherit" }}>
            <ContactEmergencyIcon />
          </ListItemIcon>
          <ListItemText primary={Resource.get('menu.enrollment')} sx={{ color: selectedMenu === 'EnrollmentStudent' ? "#FFFFFF" : "inherit" }} />
        </ListItemButton>
      </List>
      <List>
        <ListItemButton
          sx={{
            "&.Mui-selected": {
              backgroundColor: "#641c71",
              color: "#000000",
              ":hover": { backgroundColor: "#D4A8DC" }
            },
            ":hover": { backgroundColor: "#D4A8DC" }
          }}
          selected={selectedMenu === 'ClassroomManager'}
          onClick={(event) => handleListItemClick(event, 'ClassroomManager')}>
          <ListItemIcon sx={{ color: selectedMenu === 'ClassroomManager' ? "#FFFFFF" : "inherit" }}>
            <RoomPreferencesIcon />
          </ListItemIcon>
          <ListItemText primary={Resource.get('menu.classroommanager')} sx={{ color: selectedMenu === 'ClassroomManager' ? "#FFFFFF" : "inherit" }} />
        </ListItemButton>
      </List>
      <List>
        <ListItemButton
          sx={{
            "&.Mui-selected": {
              backgroundColor: "#641c71",
              color: "#000000",
              ":hover": { backgroundColor: "#D4A8DC" }
            },
            ":hover": { backgroundColor: "#D4A8DC" }
          }}
          selected={selectedMenu === 'Schedules'}
          onClick={(event) => handleListItemClick(event, 'Schedules')}>
          <ListItemIcon sx={{ color: selectedMenu === 'Schedules' ? "#FFFFFF" : "inherit" }}>
            <CalendarMonthIcon />
          </ListItemIcon>
          <ListItemText primary={Resource.get('menu.schedule')} sx={{ color: selectedMenu === 'Schedules' ? "#FFFFFF" : "inherit" }} />
        </ListItemButton>
      </List>  
      <List>
        <ListItemButton
          sx={{
            "&.Mui-selected": {
              backgroundColor: "#641c71",
              color: "#000000",
              ":hover": { backgroundColor: "#D4A8DC" }
            },
            ":hover": { backgroundColor: "#D4A8DC" }
          }}
          selected={selectedMenu === 'AccessedUser'}
          onClick={(event) => handleListItemClick(event, 'AccessedUser')}>
          <ListItemIcon sx={{ color: selectedMenu === 'AccessedUser' ? "#FFFFFF" : "inherit" }}>
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary={Resource.get('menu.accesseduser')} sx={{ color: selectedMenu === 'AccessedUser' ? "#FFFFFF" : "inherit" }} />
        </ListItemButton>
      </List>         
    </React.Fragment>
  );
};
