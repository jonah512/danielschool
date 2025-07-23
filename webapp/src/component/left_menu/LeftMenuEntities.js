// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import Logger from '../../framework/logger/Logger';
import Resource from '../../framework/resource/Resource';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SensorDoorIcon from '@mui/icons-material/SensorDoor';
import SummarizeIcon from '@mui/icons-material/Summarize';

export default function LeftMenuEntities(props) {

  const [selectedMenu, SetSelectedMenu] = React.useState(props.SelectedMenu);

  useEffect(() => {
    SetSelectedMenu(props.SelectedMenu);
    Logger.debug('LeftMenuEntities:', props.SelectedMenu, selectedMenu);
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
              backgroundColor: "#0D47A1", // Dark blue tone for selected menu
              color: "#FFFFFF",
              ":hover": { backgroundColor: "#1976D2" } // Slightly lighter blue on hover
            },
            ":hover": { backgroundColor: "#1976D2" } // Slightly lighter blue on hover
          }}
          selected={selectedMenu === 'Students'}
          onClick={(event) => handleListItemClick(event, 'Students')}>
          <ListItemIcon sx={{ color: selectedMenu === 'Students' ? "#FFFFFF" : "inherit" }}>
            <AccessibilityNewIcon />
          </ListItemIcon>
          <ListItemText primary={Resource.get('menu.students')} sx={{ color: selectedMenu === 'Students' ? "#FFFFFF" : "inherit" }} />
        </ListItemButton>
      </List>
      <List>
        <ListItemButton
          sx={{
            "&.Mui-selected": {
              backgroundColor: "#0D47A1", // Dark blue tone for selected menu
              color: "#FFFFFF",
              ":hover": { backgroundColor: "#1976D2" } // Slightly lighter blue on hover
            },
            ":hover": { backgroundColor: "#1976D2" } // Slightly lighter blue on hover
          }}
          selected={selectedMenu === 'Teachers'}
          onClick={(event) => handleListItemClick(event, 'Teachers')}>
          <ListItemIcon sx={{ color: selectedMenu === 'Teachers' ? "#FFFFFF" : "inherit" }}>
            <RecordVoiceOverIcon />
          </ListItemIcon>
          <ListItemText primary={Resource.get('menu.teachers')} sx={{ color: selectedMenu === 'Teachers' ? "#FFFFFF" : "inherit" }} />
        </ListItemButton>
      </List>
      <List>
        <ListItemButton
          sx={{
            "&.Mui-selected": {
              backgroundColor: "#0D47A1", // Dark blue tone for selected menu
              color: "#FFFFFF",
              ":hover": { backgroundColor: "#1976D2" } // Slightly lighter blue on hover
            },
            ":hover": { backgroundColor: "#1976D2" } // Slightly lighter blue on hover
          }}
          selected={selectedMenu === 'Classes'}
          onClick={(event) => handleListItemClick(event, 'Classes')}>
          <ListItemIcon sx={{ color: selectedMenu === 'Classes' ? "#FFFFFF" : "inherit" }} >
            <SensorDoorIcon />
          </ListItemIcon>
          <ListItemText primary={Resource.get('menu.classes')} sx={{ color: selectedMenu === 'Classes' ? "#FFFFFF" : "inherit" }} />
        </ListItemButton>
      </List>
      <List>
        <ListItemButton
          sx={{
            "&.Mui-selected": {
              backgroundColor: "#0D47A1", // Dark blue tone for selected menu
              color: "#FFFFFF",
              ":hover": { backgroundColor: "#1976D2" } // Slightly lighter blue on hover
            },
            ":hover": { backgroundColor: "#1976D2" } // Slightly lighter blue on hover
          }}
          selected={selectedMenu === 'Consents'}
          onClick={(event) => handleListItemClick(event, 'Consents')}>
          <ListItemIcon sx={{ color: selectedMenu === 'Consents' ? "#FFFFFF" : "inherit" }}>
            <SummarizeIcon />
          </ListItemIcon>
          <ListItemText primary={Resource.get('menu.consents')} sx={{ color: selectedMenu === 'Consents' ? "#FFFFFF" : "inherit" }} />
        </ListItemButton>
      </List>   
    </React.Fragment>
  );
};
