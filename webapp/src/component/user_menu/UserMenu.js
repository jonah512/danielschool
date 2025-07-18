import React, { useState, useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Resource from "../../framework/resource/Resource";
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import FormControlLabel from '@mui/material/FormControlLabel';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Checkbox from '@mui/material/Checkbox';
import LanguageIcon from '@mui/icons-material/Language';
import SessionManager from '../../control/SessionManager';
import LogoutIcon from '@mui/icons-material/Logout';
import UserRole from '../../framework/user_role/UserRole';
import RegisterCtrl from '../../control/RegisterCtrl';

export default function UserMenu(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElSub, setAnchorElSub] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(Resource.language);


  useEffect(() => {
    setAnchorElSub(null);
    return () => {

    };
  }, [props]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setAnchorElSub(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setAnchorElSub(null);
  };

  const handleLocale = (event) => {
    setAnchorElSub(event.currentTarget);
  };

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
    Resource.setLanguage(event.target.value);
    EventPublisher.publish(EventDef.onLanguageChange, event.target.value);
    handleClose();
  };

  const handleLogout = () => {
    RegisterCtrl.cleanUpSession();
    SessionManager.setLoginStatus(false);    
    EventPublisher.publish(EventDef.onSelectedStudentChanged, null);
    EventPublisher.publish(EventDef.onMenuChanged, "Login");
  };


  return (
    <div>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="open drawer"
        onClick={handleClick}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >

        <MenuItem onClick={handleLocale} >
          <LanguageIcon style={{ marginRight: '8px' }} />{Resource.get('usermenu.language')}
          <Menu
            id="language-menu"
            anchorEl={anchorElSub}
            keepMounted
            open={Boolean(anchorElSub) && Boolean(anchorEl)}
            onClose={handleClose}
          >
            {
              Resource.getLanguages().map((language, index) => (
                <MenuItem key={index}>
                  <FormControlLabel
                    control={<Checkbox checked={selectedLanguage === language} onChange={handleLanguageChange} value={language} />}
                    label={language}
                  />
                </MenuItem>
              ))
            }
          </Menu>
        </MenuItem>
        <MenuItem onClick={handleLogout} >
          <LogoutIcon style={{ marginRight: '8px' }} />{Resource.get('login.logout')}
        </MenuItem>

      </Menu>

    </div>
  );
}
