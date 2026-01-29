// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import Logger from '../../framework/logger/Logger';
import Resource from '../../framework/resource/Resource';
import SettingsIcon from '@mui/icons-material/Settings';
export default function LeftMenuSettings(props) {

  const [selectedMenu, SetSelectedMenu] = React.useState(props.SelectedMenu);

  useEffect(() => {
    SetSelectedMenu(props.SelectedMenu);
    Logger.debug('LeftMenuSettings:', props.SelectedMenu, selectedMenu);
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
          selected={selectedMenu === 'Settings'}
          onClick={(event) => handleListItemClick(event, 'Settings')}>
          <ListItemIcon sx={{ color: selectedMenu === 'Settings' ? "#FFFFFF" : "inherit" }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary={Resource.get('menu.settings')} sx={{ color: selectedMenu === 'Settings' ? "#FFFFFF" : "inherit" }} />
        </ListItemButton>
      </List>
    </React.Fragment>
  );
};
