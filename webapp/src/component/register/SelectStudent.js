import React, { useState, useEffect } from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Stack, Box, Button, IconButton } from '@mui/material';
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

function SelectStudent() {
    const [students, setStudents] = useState(RegisterCtrl.students); // List of students
    const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.students[0].id);
    const [deleteConfirm, setDeleteConfirm] = useState(false); // State for delete confirmation dialog
    const [selectedStudentId, setSelectedStudentId] = useState(null); // State for selected student ID for deletion
    const [showNewRegistration, setShowNewRegistration] = useState(false);

    useEffect(() => {
        console.log('SelectStudent students:', students);
        RegisterCtrl.selected_student = - students[0]; // Set the first student as selected by default
    }, []);

    const handleNext = () => {
        const selected = students.find(student => String(student.id) === String(selectedStudent));
        RegisterCtrl.selected_student = selected;
        console.log('Selected student:', RegisterCtrl.selected_student, students, selectedStudent);
        // Handle the next button click, if needed
        EventPublisher.publish(EventDef.onSelectedStudentChanged, RegisterCtrl.selected_student);

        console.log('RegisterCtrl.waitingPosition:', RegisterCtrl.waitingPosition);
        if (RegisterCtrl.waitingPosition > Defines.MAX_WAITING_POSITION) {
            EventPublisher.publish(EventDef.onMenuChanged, "WaitingRoom");
        }
        else {
            EventPublisher.publish(EventDef.onMenuChanged, "EnrollmentRegister");
        }
    }

    const handleExit = () => {
        RegisterCtrl.selected_student = null; // Clear the selected student
        EventPublisher.publish(EventDef.onSelectedStudentChanged, null);
        EventPublisher.publish(EventDef.onMenuChanged, "Login");
    }

    const handleDelete = (studentId) => {
        console.log('Deleting student with ID:', studentId);
        setSelectedStudentId(studentId);
        setDeleteConfirm(true); // Show delete confirmation dialog
    }


    const findLastEnrollmentDate = (student) => {
        const enrollments = RegisterCtrl.enrollments.filter(enrollment => enrollment.student_id === student.id);
        console.log('findLastEnrollmentDate Enrollments for student', student.name, ':', enrollments);
        if (enrollments.length === 0) return '';
        const lastEnrollment = enrollments.reduce((latest, current) => {
            return new Date(latest.updated_at) > new Date(current.updated_at) ? latest : current;
        });
        console.log('findLastEnrollmentDate Last enrollment date for student', student.name, ':', lastEnrollment.updated_at);
        const updatedAt = new Date(lastEnrollment.updated_at);
        const estOffset = -5 * 60; // EST offset in minutes
        const isDST = (date) => {
            const jan = new Date(date.getFullYear(), 0, 1);
            const jul = new Date(date.getFullYear(), 6, 1);
            const stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
            return date.getTimezoneOffset() < stdTimezoneOffset;
        };
        const dstAdjustment = isDST(updatedAt) ? 60 : 0; // Add 60 minutes if DST is active
        const updatedAtEST = new Date(updatedAt.getTime() + (estOffset + dstAdjustment) * 60000);
        console.log('findLastEnrollmentDate Last enrollment date for student', student.name, ':', lastEnrollment.updated_at, updatedAtEST);
        return updatedAtEST.toLocaleDateString() + ' ' + updatedAtEST.toTimeString().slice(0, 8);
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

    const onConfirm = () => {
        console.log('Confirm delete for student ID:', selectedStudentId);
        setDeleteConfirm(false);
        const updatedStudents = students.filter(student => student.id !== selectedStudentId);
        setStudents(updatedStudents);
        if (RegisterCtrl.selected_student?.id === selectedStudentId) {
            RegisterCtrl.selected_student = null; // Clear selected student if deleted
            setSelectedStudent(updatedStudents[0]?.id || null);
        }

        // remove from database
        const student_control = new StudentsCtrl(window.APIURL);
        student_control.deleteStudentsSync([selectedStudentId]);
    };

    const getClassName = (classId) => {
        const classData = RegisterCtrl.classes.find(c => c.id === classId);
        return classData ? classData.name : 'Unknown Class';
    }


    const handleCloseAddStudentDialog = (student) => {
        setShowNewRegistration(false);
        RegisterCtrl.findEmail(student.email, (data) => {
            console.log('Found email:', data);
            RegisterCtrl.students = data;
            setStudents(data);
        }, (error) => {
            Logger.error('Error finding email:', error);
            alert(Resource.get('register.cannot_find_email'));
        });
    };

    const displayHistory = (studentId) => {
        const enrollments = RegisterCtrl.enrollments.filter(enrollment => enrollment.student_id === studentId);
        if (enrollments.length === 0) return '';

        return (
            <DataGrid
                rows={enrollments}
                columns={[
                    { field: 'year', headerName: Resource.get('student_selection.year'), width: 100 },
                    {
                        field: 'term', headerName: Resource.get('student_selection.term'), width: 100,
                        renderCell: (params) => {
                            return <span>{Resource.get('topbar.' + params.value)}</span>;
                        }
                    },
                    {
                        field: 'class_id', headerName: Resource.get('student_selection.class_name'), width: 150,
                        renderCell: (params) => {
                            return <span>{getClassName(params.value)}</span>;
                        }
                    },
                    {
                        field: 'updated_at', headerName: Resource.get('student_selection.updated_at'), width: 200,
                        renderCell: (params) => {
                            const date_time = new Date(params.value);
                            return <span>{getTimeString(date_time)}</span>;
                        }
                    },
                ]}
                autoHeight
                disableSelectionOnClick
                hideFooter
            />
        );
    }

    return (
        <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ width: '100%' }}
        >
            <Box component="h2" textAlign="center">수강생 선택</Box>

            <FormControl>
                <FormLabel id="select-student-label"></FormLabel>
                <RadioGroup
                    aria-labelledby="select-student-label"
                    name="selectedStudent"
                    onChange={(event) => {
                        console.log('Selected student ID:', event.target.value);
                        const id = event.target.value;
                        setSelectedStudent(id);
                    }}
                    value={selectedStudent}
                >
                    {students.map((student) => (
                        <Stack direction="row" alignItems="center" key={student.id} spacing={2}>
                            <FormControlLabel
                                value={student.id}
                                control={<Radio />}
                                label={`${student.name}`}
                            />
                            <IconButton
                                aria-label="delete"
                                color="error"
                                onClick={() => handleDelete(student.id)}
                            >

                                <DeleteIcon />
                            </IconButton>
                            {displayHistory(student.id)}
                        </Stack>
                    ))}
                </RadioGroup>
            </FormControl>
            <Stack
                spacing={2}
                alignItems="center"
                justifyContent="center"
                direction={'row'}
            >
                <Button variant="contained" onClick={() => setShowNewRegistration(true)}>{Resource.get('register.add_student')}</Button>
                {students.length > 0 && (
                    <Button variant="contained" onClick={handleNext}>{Resource.get('student_selection.select_class')}</Button>
                )}
                <Button variant="contained" onClick={handleExit}>{Resource.get('student_selection.logout')}</Button>


            </Stack>
            {showNewRegistration && (
                <AddAdditionalStudent open={showNewRegistration} onAddStudent={handleCloseAddStudentDialog} onClose={() => setShowNewRegistration(false)} />
            )}
            {deleteConfirm && (
                <AlertDialog
                    onYes={onConfirm}
                    onNo={() => setDeleteConfirm(false)}
                    YesOrNo={true} Open={true}
                    Title={Resource.get('student_selection.delete_title')}
                    Content={Resource.get('student_selection.delete_content')} />
            )}
        </Stack>
    );
}

export default SelectStudent;