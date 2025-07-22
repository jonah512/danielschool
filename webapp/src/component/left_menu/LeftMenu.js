// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import Resource from '../../framework/resource/Resource';

export default function LeftMenu(props) {
  const [selectedMenu, setSelectedMenu] = React.useState(props.SelectedMenu);
  useEffect(() => {
    setSelectedMenu(props.SelectedMenu);
    return () => {

    };
  }, [props]);
  const handleListItemClick = (event, menu) => {
    setSelectedMenu(menu);
    if(props !== null && props.onMenuChanged !== null)
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
          selected={selectedMenu === 'Users'}
          onClick={(event) => handleListItemClick(event, 'Users')}>
          <ListItemIcon sx={{ color: selectedMenu === 'Users' ? "#FFFFFF" : "inherit" }}>
            <AssignmentIndIcon />
          </ListItemIcon>
          <ListItemText primary={Resource.get('menu.users') } 
          sx={{ color: selectedMenu === 'Users' ? "#FFFFFF" : "inherit" }}/>
        </ListItemButton>
      </List>
    </React.Fragment>
  );
};
