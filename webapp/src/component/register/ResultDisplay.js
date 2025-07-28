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
    const [students, setStudents] = useState(RegisterCtrl.students); // List of students
    const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.students[0].id);
    const [showNewRegistration, setShowNewRegistration] = useState(false);
    const [studentEnrollments, setStudentEnrollments] = useState(new Map());
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen size is small
    const MODULE = 'ResultDisplay';

    useEffect(() => {
        Logger.debug('ResultDisplay students:', students);
        RegisterCtrl.selected_student = - students[0];

        EventPublisher.addEventListener(EventDef.onEnrollmentListChange, MODULE, onEnrollmentListChange);
        
        const enrollmentCtrl = new EnrollmentCtrl(window.APIURL);
        
        enrollmentCtrl.getEnrollment(RegisterCtrl.year, RegisterCtrl.term);
        const intervalId = setInterval(()=>enrollmentCtrl.getEnrollment(RegisterCtrl.year, RegisterCtrl.term), 3000); // Call every 3 seconds
        return () => {
            EventPublisher.removeEventListener(EventDef.onEnrollmentListChange, MODULE);
            clearInterval(intervalId); // Clear interval on cleanup
        };
    }, [ RegisterCtrl.students]);

    const onEnrollmentListChange = (enrollments) => {
        Logger.debug('onEnrollmentListChange enrollments:', enrollments);
        RegisterCtrl.enrollments = enrollments;

        const enrollmentMap = new Map();
        enrollments.forEach((enrollment) => {
            if (!enrollmentMap.has(enrollment.student_id)) {
                enrollmentMap.set(enrollment.student_id, []);
            }
            enrollmentMap.get(enrollment.student_id).push(enrollment);
        });
        setStudentEnrollments(enrollmentMap); // Update state with the enrollment map
        Logger.debug('Updated studentEnrollments:', enrollmentMap);
    };

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
                    {Resource.get('register.result_display_title')}
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