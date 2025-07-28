import React, { useState, useEffect } from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Stack, Box, Button, IconButton, Container, useMediaQuery, useTheme, Typography } from '@mui/material'; // Add responsive utilities
import DeleteIcon from '@mui/icons-material/Delete';
import RegisterCtrl from '../../control/RegisterCtrl'; // Import the RegisterCtrl
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Defines from '../Defines';
import StudentsCtrl from '../../control/StudentsCtrl'; // Import the StudentCtrl for database operations
import { DataGrid } from '@mui/x-data-grid';
import Resource from '../../framework/resource/Resource'
import AlertDialog from '../common/AlertDialog';
import AddAdditionalStudent from './AddAdditionalStudent';
import Logger from '../../framework/logger/Logger';
import SessionManager from '../../control/SessionManager';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LogoutIcon from '@mui/icons-material/Logout';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';

function ResultDisplay() {

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen size is small

    useEffect(() => {

    }, [ ]);


    const handleNext = () => {
        EventPublisher.publish(EventDef.onMenuChanged, "SelectStudent");
    }

    return (
        <Container maxWidth="md" sx={{ padding: isMobile ? 2 : 4 }}> {/* Add responsive container */}
            <Stack
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{ width: '100%' }}
            >
                <Box sx={{ width: '100%', height: 100, marginY: 1 }} />
                <Typography variant="h4" sx={{ color: '#333', textAlign: 'center' }}>
                    {Resource.get('register.result_display_title', RegisterCtrl.selected_student.name, RegisterCtrl.year, RegisterCtrl.term)}
                </Typography>
                <Box sx={{ width: '100%', height: 100, marginY: 1 }} />
                <Button
                    variant="contained"
                    onClick={handleNext}
                    fullWidth={isMobile} // Make buttons full width on mobile
                    startIcon={<LibraryBooksIcon/>}
                >
                    {Resource.get('common.dialog.confirm')}
                </Button>
            </Stack>
        </Container>
    );
}

export default ResultDisplay;