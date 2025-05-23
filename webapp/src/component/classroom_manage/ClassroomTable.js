// Copyright (c) 2025 Milal Daniel Korean School.
import dayjs from 'dayjs';
import * as React from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Stack, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import StuidentCtrl from '../../control/StudentsCtrl';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';
import ClassesCtrl from '../../control/ClassesCtrl';
import Resource from '../../framework/resource/Resource';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { TablePagination } from '@mui/material';
import Typography from '@mui/material/Typography';
import SessionManager from '../../control/SessionManager';
import Defines from '../Defines';
import ClassroomElement from './ClassroomElement';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.white,
        color: theme.palette.common.black,
        fontSize: 16,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function ClassroomTable({ search, year, term }) {
    const [studentList, setStudentList] = useState([]); // State for user list
    const [classList, setClassList] = useState([]); // State for class list
    const [enrollmentList, setEnrollmentList] = useState([]); // State for enrollment list
    const MODULE = 'ClassroomTable';

    useEffect(() => {
        const student_control = new StuidentCtrl(window.APIURL);
        const enrollment_control = new EnrollmentCtrl(window.APIURL);
        const class_control = new ClassesCtrl(window.APIURL);
        
        const intervalId = setInterval(() => {
            student_control.getStudents(search);
            enrollment_control.getEnrollment(year, term);
            class_control.getClasses(search, year, term);
        }, 3000);

        student_control.getStudents(search);
        enrollment_control.getEnrollment(year, term);
        class_control.getClasses(search, year, term);

        EventPublisher.addEventListener(EventDef.onStudentListChange, MODULE, onStudentListChange);
        EventPublisher.addEventListener(EventDef.onEnrollmentListChange, MODULE, onEnrollmentListChange);
        EventPublisher.addEventListener(EventDef.onClassListChange, MODULE, onClassListChange);

        return () => {
            clearInterval(intervalId);
            EventPublisher.removeEventListener(EventDef.onStudentListChange, MODULE);
            EventPublisher.removeEventListener(EventDef.onEnrollmentListChange, MODULE);
            EventPublisher.removeEventListener(EventDef.onClassListChange, MODULE);
        };
    }, [search, year, term, window.APIURL]);

    const onEnrollmentListChange = (data) => {
        console.log('onEnrollmentListChange:');
        setEnrollmentList(data); // Update enrollment list state 
    }

    const onClassListChange = (data) => {
        console.log('onClassListChange:');
        setClassList(data); // Update class list state
    }

    const onStudentListChange = (data) => {
        console.log('onStudentListChange:');
        const processedData = data.map((student) => ({
            ...student,
            grade: Defines.gradeOptions.find((grade) => grade.value === student.grade)?.label || student.grade,
            religion: Resource.get('students.' + (student.religion || '')),
            created_at: dayjs(student.created_at).format('YYYY-MM-DD HH:mm:ss'),
            updated_at: dayjs(student.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        }));
        setStudentList(processedData); // Update user list state with formatted data
    };

    return (
        <div style={{ width: '100%' }}>
            <Stack spacing={2} style={{ width: '100%' }} direction={"column"}>
                <Divider />
                <Typography
                    variant="h5"
                    textAlign="center"
                    width={'100%'}
                    style={{ color: '#0A0A0A', fontWeight: 'bold' }} // Dark purple color
                >
                    {Resource.get('enrollment.period_1')}
                </Typography>
                <Stack spacing={2} style={{ width: '100%' }} direction={"row"}>
                    {classList
                        .filter((classItem) => classItem.period === 1)
                        .map((classItem) => (
                            <ClassroomElement key={classItem.id} classItem={classItem} students={studentList} enrollments={enrollmentList} classes={classList}/>
                        ))}
                </Stack>
                <Divider />
                <Typography
                    variant="h5"
                    textAlign="center"
                    width={'100%'}
                    style={{ color: '#0A0A0A', fontWeight: 'bold' }} // Dark purple color
                >
                    {Resource.get('enrollment.period_2')}
                </Typography>
                <Stack spacing={2} style={{ width: '100%' }} direction={"row"}>
                    {classList
                        .filter((classItem) => classItem.period === 2)
                        .map((classItem) => (
                            <ClassroomElement key={classItem.id} classItem={classItem} students={studentList} enrollments={enrollmentList} classes={classList}/>
                        ))}
                </Stack>
                <Divider />
                <Typography
                    variant="h5"
                    textAlign="center"
                    width={'100%'}
                    style={{ color: '#0A0A0A', fontWeight: 'bold' }} // Dark purple color
                >
                    {Resource.get('enrollment.period_3')}
                </Typography>
                <Stack spacing={2} style={{ width: '100%' }} direction={"row"}>
                    {classList
                        .filter((classItem) => classItem.period === 3)
                        .map((classItem) => (
                            <ClassroomElement key={classItem.id} classItem={classItem} students={studentList} enrollments={enrollmentList} classes={classList}/>
                        ))}
                </Stack>
            </Stack>
        </div>
    );
}