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

function SelectStudent() {
    const [students, setStudents] = useState(RegisterCtrl.students); // List of students
    const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.students[0].id);
    const [showNewRegistration, setShowNewRegistration] = useState(false);
    const [studentEnrollments, setStudentEnrollments] = useState(new Map());
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen size is small
    const MODULE = 'SelectStudent';

    useEffect(() => {
        Logger.debug('SelectStudent students:', students);
        RegisterCtrl.selected_student = - students[0];

        EventPublisher.addEventListener(EventDef.onEnrollmentListChange, MODULE, onEnrollmentListChange);
        
        const enrollmentCtrl = new EnrollmentCtrl(window.APIURL);
        
        enrollmentCtrl.getEnrollment(RegisterCtrl.year, RegisterCtrl.term);
        return () => {
            EventPublisher.removeEventListener(EventDef.onEnrollmentListChange, MODULE);
        };
    }, [ RegisterCtrl.students]);

    const getPeriod = (classId) => {
        const classData = RegisterCtrl.classes.find(c => c.id === classId);
        return classData ? classData.period : '';
    }

    const onEnrollmentListChange = (enrollments) => {
        Logger.debug('onEnrollmentListChange enrollments:', enrollments);
        RegisterCtrl.enrollments = enrollments;

        const enrollmentMap = new Map();
        enrollments.forEach((enrollment) => {
            if (!enrollmentMap.has(enrollment.student_id)) {
                enrollmentMap.set(enrollment.student_id, []);
            }
            enrollment.period = getPeriod(enrollment.class_id);
            enrollmentMap.get(enrollment.student_id).push(enrollment);
        });
        setStudentEnrollments(enrollmentMap); // Update state with the enrollment map
        Logger.debug('Updated studentEnrollments:', enrollmentMap);
    };

    const handleNext = () => {
        const selected = students.find(student => String(student.id) === String(selectedStudent));
        RegisterCtrl.selected_student = selected;
        Logger.debug('Selected student:', RegisterCtrl.selected_student, students, selectedStudent);
        // Handle the next button click, if needed
        EventPublisher.publish(EventDef.onSelectedStudentChanged, RegisterCtrl.selected_student);

        Logger.debug('RegisterCtrl.waitingPosition:', RegisterCtrl.waitingPosition);
        if (RegisterCtrl.waitingPosition > Defines.MAX_WAITING_POSITION) {
            EventPublisher.publish(EventDef.onMenuChanged, "WaitingRoom");
        }
        else {
            EventPublisher.publish(EventDef.onMenuChanged, "EnrollmentRegister");
        }
    }

    const handleExit = () => {
        RegisterCtrl.cleanUpSession();
        SessionManager.setLoginStatus(false);  
        EventPublisher.publish(EventDef.onSelectedStudentChanged, null);
        EventPublisher.publish(EventDef.onMenuChanged, "Login");
    }

    const getTimeString = (date_time) => {
        const estOffset = -5 * 60; // EST offset in minutes
        const isDST = (date) => {
            const jan = new Date(date.getFullYear(), 0, 1);
            const jul = new Date(date.getFullYear(), 6, 1);
            const stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
            return date.getTimezoneOffset() < stdTimezoneOffset;
        };
        const dstAdjustment = isDST(date_time) ? 60 : 0; // Add 60 minutes if DST is active
        const updatedAtEST = new Date(date_time.getTime() + (estOffset + dstAdjustment) * 60000);
        return updatedAtEST.toLocaleDateString() + ' ' + updatedAtEST.toTimeString().slice(0, 8);
    }

    const getClassName = (classId) => {
        const classData = RegisterCtrl.classes.find(c => c.id === classId);
        return classData ? classData.name : 'Unknown Class';
    }


    const handleCloseAddStudentDialog = (student) => {
        setShowNewRegistration(false);
        RegisterCtrl.findEmail(student.email, (data) => {
            Logger.debug('Found email:', data);
            RegisterCtrl.students = data;
            setStudents(data);
        }, (error) => {
            Logger.error('Error finding email:', error);
            alert(Resource.get('register.cannot_find_email'));
        });
    };


    const displayHistory = (studentId) => {
        const enrollments = studentEnrollments.get(studentId) || [];
        let enrollmentsText = [];
        if (enrollments.length === 0) return '';
        console.log('Enrollments for student:', studentId, ':', enrollments);
        enrollments.map((enrollment, index) => {
            const className = getClassName(enrollment.class_id);
            const period = getPeriod(enrollment.class_id);
            const status = enrollment.status.toUpperCase();
            const updatedAt = getTimeString(new Date(enrollment.updated_at));
            enrollmentsText.push({
                id: `${studentId}-${index}`, // Add a unique id for each row
                class_id: enrollment.class_id,
                class_name: className,
                period: period,
                status: status,
                updated_at: updatedAt
            });
        });
        enrollmentsText = enrollmentsText.sort((a, b) => a.period - b.period); // Sort by period
        return (
            <DataGrid
                rows={enrollmentsText}
                columns={[
                    {
                        field: 'class_id',
                        headerName: Resource.get('student_selection.class_name'),
                        width: 200,
                        renderCell: (params) => {
                            return <span>{getPeriod(params.value) + Resource.get('enrollment.period') + ': ' + getClassName(params.value)}</span>;
                        }
                    },
                    {
                        field: 'status',
                        headerName: Resource.get('student_selection.status'),
                        width: 100,
                        renderCell: (params) => {
                            return params.value.toUpperCase();
                        }
                    },
                    ...(!isMobile ? [{
                        field: 'updated_at',
                        headerName: Resource.get('student_selection.updated_at'),
                        width: 200,
                        renderCell: (params) => {
                            const date_time = new Date(params.value);
                            return <span>{getTimeString(date_time)}</span>;
                        }
                    }] : [])
                ]}
                autoHeight
                disableSelectionOnClick
                hideFooter
            />
        );
    };

    return (
        <Container maxWidth="md" sx={{ padding: isMobile ? 2 : 4 }}> {/* Add responsive container */}
            <Stack
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{ width: '100%' }}
            >
                <Box component="h2" textAlign="center" fontSize={isMobile ? '1.5rem' : '2rem'}> {/* Adjust font size */}
                    {Resource.get('student_selection.title')}
                </Box>

                <FormControl>

                    <RadioGroup
                        aria-labelledby="select-student-label"
                        name="selectedStudent"
                        onChange={(event) => {
                            Logger.debug('Selected student ID:', event.target.value);
                            const id = event.target.value;
                            setSelectedStudent(id);
                        }}
                        value={selectedStudent}
                    >                        
                        {students.map((student) => (
                            <Stack direction={'column'} sx={{ width: '100%' }}>
                                
                                <Stack
                                    direction={isMobile ? "column" : "row"} // Stack vertically on mobile
                                    alignItems="center"
                                    key={student.id}
                                    spacing={1}
                                    sx={{ width: '100%' }}
                                >
                                    <FormControlLabel
                                        value={student.id}
                                        control={<Radio />}
                                        label={`${student.name}`}
                                    />
                                    {displayHistory(student.id)}
                                </Stack>
                                <Box height={20}  width={'100%'}></Box>

                            </Stack>
                        ))}
                    </RadioGroup>
                </FormControl>
                {/* insert divider*/}
                <Box sx={{ width: '100%', height: 20, marginY: 1 }} />
                <Stack
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                    direction={isMobile ? 'column' : 'row'} // Stack buttons vertically on mobile
                    sx={{ width: '100%' }}
                >
                    <Button
                        variant="secondary"
                        onClick={() => setShowNewRegistration(true)}
                        fullWidth={isMobile} // Make buttons full width on mobile
                        startIcon={<PersonAddAltIcon/>}
                    >
                        {Resource.get('register.add_student')}
                    </Button>
                    {students.length > 0 && (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            fullWidth={isMobile} // Make buttons full width on mobile
                            startIcon={<LibraryBooksIcon/>}
                        >
                            {Resource.get('student_selection.select_class')}
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        onClick={handleExit}
                        fullWidth={isMobile} // Make buttons full width on mobile
                        startIcon={<LogoutIcon/>}
                    >
                        {Resource.get('student_selection.logout')}
                    </Button>
                </Stack>
                {showNewRegistration && (
                    <AddAdditionalStudent open={showNewRegistration} onAddStudent={handleCloseAddStudentDialog} onClose={() => setShowNewRegistration(false)} />
                )}

            </Stack>
        </Container>
    );
}

export default SelectStudent;