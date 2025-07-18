import React, { useState, useEffect } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Defines from '../Defines';
import Resource from '../../framework/resource/Resource';
import LanguageIcon from '@mui/icons-material/Language'; // Import language icon
import LogoutIcon from '@mui/icons-material/Logout'; // Import logout icon
import IconButton from '@mui/material/IconButton'; // Import IconButton
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip
import SessionManager from '../../control/SessionManager';
import Menu from '@mui/material/Menu'; // Import Menu
import MenuItem from '@mui/material/MenuItem'; // Import MenuItem
import FormControlLabel from '@mui/material/FormControlLabel'; // Import FormControlLabel
import Checkbox from '@mui/material/Checkbox'; // Import Checkbox

function Topbar({ year, term }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElSub, setAnchorElSub] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(Resource.language);

    const MODULE = 'Topbar';
    const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.selected_student);

    useEffect(() => {
        EventPublisher.addEventListener(EventDef.onSelectedStudentChanged, MODULE, onSelectedStudentChanged);
        return () => {
            EventPublisher.removeEventListener(EventDef.onSelectedStudentChanged, MODULE);
        };

    }, []);

    const onSelectedStudentChanged = (student) => {
        console.log('onSelectedStudentChanged student : ', student);
        setSelectedStudent(student);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setAnchorElSub(null);
    };

    const handleLocale = (event) => {
        setAnchorElSub(event.currentTarget);
    };

    const handleLanguageClick = (event) => {
        setAnchorElSub(event.currentTarget); // Open the language menu
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
        <Stack
            direction="row"
            spacing={4}
            sx={{
                backgroundColor: '#f4f4f4',
                padding: '10px 20px',
                borderBottom: '2px solid #ccc',
                height: '150px', // Full viewport height
                alignItems: 'center', // Center horizontally
                justifyContent: 'space-between', // Spread items across full width
                width: '100%' // Use full width
            }}
        >
            <img src="daniel_logo.png" width='70' alt='Daniel School Register Web'></img>

            <Typography variant="h4" sx={{ color: '#333', textAlign: 'center', flexGrow: 1 }}>
                {Resource.get("topbar.title", year, Resource.get('topbar.' + term))}
            </Typography>
            {selectedStudent && (

                <Typography variant="body1" sx={{ fontSize: '18px', color: '#555', textAlign: 'center' }}>
                    {Resource.get('topbar.name')} <strong>{selectedStudent.name}</strong>
                </Typography>
            )}
            {selectedStudent && (

                <Typography variant="body1" sx={{ fontSize: '18px', color: '#555', textAlign: 'center' }}>
                    {Resource.get('topbar.grade')} <strong>{Defines.gradeOptions.find(option => option.value === selectedStudent.grade)?.label}</strong>
                </Typography>

            )}
            {selectedStudent && <Stack direction="row" spacing={2} alignItems="center">
                <Tooltip title={Resource.get('usermenu.language')} arrow>
                    <IconButton aria-label="language" onClick={handleLanguageClick}>
                        <LanguageIcon />
                    </IconButton>
                </Tooltip>
                <Menu
                    id="language-menu"
                    anchorEl={anchorElSub}
                    keepMounted
                    open={Boolean(anchorElSub)}
                    onClose={handleClose}
                >
                    {Resource.getLanguages().map((language, index) => (
                        <MenuItem key={index}>
                            <FormControlLabel
                                control={<Checkbox checked={selectedLanguage === language} onChange={handleLanguageChange} value={language} />}
                                label={language}
                            />
                        </MenuItem>
                    ))}
                </Menu>
                <Tooltip title={Resource.get('login.logout')} arrow>
                    <IconButton aria-label="logout" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
            }
        </Stack>
    );
}

export default Topbar;