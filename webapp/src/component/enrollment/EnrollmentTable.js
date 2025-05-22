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

import SessionManager from '../../control/SessionManager';
import Defines from '../Defines';

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

export default function EnrollmentTable({ search, year, term }) {
    const [studentList, setStudentList] = useState([]); // State for user list
    const [classList, setClassList] = useState([]); // State for class list
    const [enrollmentList, setEnrollmentList] = useState([]); // State for enrollment list
    const MODULE = 'EnrollmentTable';
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        console.log('EnrollmentTable useEffect', search, year, term);
        const student_control = new StuidentCtrl(window.APIURL);
        const enrollment_control = new EnrollmentCtrl(window.APIURL);
        const class_control = new ClassesCtrl(window.APIURL);
        student_control.getStudents(search);
        enrollment_control.getEnrollment(year, term);
        class_control.getClasses(null, year, term);
        EventPublisher.addEventListener(EventDef.onStudentListChange, MODULE, onStudentListChange);
        EventPublisher.addEventListener(EventDef.onEnrollmentListChange, MODULE, onEnrollmentListChange);
        EventPublisher.addEventListener(EventDef.onClassListChange, MODULE, onClassListChange);

        return () => {
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
        const processedData = data.map((student) => ({
            ...student,
            grade: Defines.gradeOptions.find((grade) => grade.value === student.grade)?.label || student.grade,
            religion: Resource.get('students.' + (student.religion || '')),
            created_at: dayjs(student.created_at).format('YYYY-MM-DD HH:mm:ss'),
            updated_at: dayjs(student.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        }));
        setStudentList(processedData); // Update user list state with formatted data
    };

    const getEnrolledClass = (studentId, period) => {

        if (enrollmentList == null || enrollmentList.length === 0) {
            return -1;
        }

        const enrollment = enrollmentList.find((enrollment) =>
            enrollment.student_id === studentId &&
            classList.find((classItem) => classItem.id === enrollment.class_id)?.period === period
        );

        if (enrollment) {
            return enrollment.class_id;
        }
        return -1;
    }

    const handleChange = (studentId, period, classId) => {
        const enrollment = enrollmentList.find((enrollment) =>
            enrollment.student_id === studentId &&
            classList.find((classItem) => classItem.id === enrollment.class_id)?.period === period
        );

        if (enrollment) {
            // update existing enrollment
            const enrollment_control = new EnrollmentCtrl(window.APIURL);
            enrollment.class_id = classId;
            enrollment_control.updateEnrollmentSync(enrollment.id, enrollment);
            enrollment_control.getEnrollment(year, term);
        }
        else {
            // create a new enrollment object
            const newEnrollment = {
                student_id: studentId,
                class_id: classId,
                status: 'draft',
                comment: '',
                year: year,
                term: term
            };
            const enrollment_control = new EnrollmentCtrl(window.APIURL);
            enrollment_control.addEnrollment(newEnrollment);
        }

    }
    
    const statusMap = React.useMemo(() => {
        const map = new Map();
        enrollmentList.forEach((enrollment) => {
            map.set(enrollment.student_id, enrollment.status);
        });
        return map;
    }, [enrollmentList]);

    const getStatus = (studentId) => {

        if (enrollmentList == null || enrollmentList.length === 0) {
            return 'draft';
        }
        return statusMap.get(studentId) || 'draft';
    }

    const handleStatusChange = (studentId, status) => {

        const enrollment_control = new EnrollmentCtrl(window.APIURL);
        enrollmentList.map((enrollment) => {
            if (enrollment.student_id === studentId) {
                enrollment.status = status;
                enrollment_control.updateEnrollmentSync(enrollment.id, enrollment);
            }
        });

        enrollment_control.getEnrollment(year, term);
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div style={{ width: '100%' }}>
            <Stack spacing={2} style={{ width: '100%' }}>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align="center"> {Resource.get('enrollment.id')} </StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('enrollment.student_name')}</StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('enrollment.grade')}</StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('enrollment.period_1')}</StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('enrollment.period_2')}</StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('enrollment.period_3')}</StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('enrollment.status')}</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {studentList
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell align="center">{row.id}</StyledTableCell>
                                    <StyledTableCell align="center">{row.name}</StyledTableCell>
                                    <StyledTableCell align="center">{row.grade}</StyledTableCell>
                                    <StyledTableCell align="center">
                                        <TextField
                                            select
                                            name="period_3"
                                            value={getEnrolledClass(row.id, 1)}
                                            onChange={(event) => { handleChange(row.id, 1, event.target.value) }}
                                            InputProps={{
                                                style: {
                                                    fontSize: '15px',
                                                    height: '30px',
                                                    width: '150px'
                                                },
                                            }}
                                            disabled={getStatus(row.id) !== 'draft'}
                                        >
                                            {classList.map((classItem) => (
                                                classItem.period === 1 &&
                                                <MenuItem key={classItem.id} value={classItem.id}>
                                                    {classItem.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <TextField
                                            select
                                            name="period_2"
                                            value={getEnrolledClass(row.id, 2)}
                                            onChange={(event) => { handleChange(row.id, 2, event.target.value) }}
                                            InputProps={{
                                                style: {
                                                    fontSize: '15px',
                                                    height: '30px',
                                                    width: '150px'
                                                },
                                            }}
                                            disabled={getStatus(row.id) !== 'draft'}
                                        >
                                            {classList.map((classItem) => (
                                                classItem.period === 2 &&
                                                <MenuItem key={classItem.id} value={classItem.id}>
                                                    {classItem.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <TextField
                                            select
                                            name="period_3"
                                            value={getEnrolledClass(row.id, 3)}
                                            onChange={(event) => { handleChange(row.id, 3, event.target.value) }}
                                            InputProps={{
                                                style: {
                                                    fontSize: '15px',
                                                    height: '30px',
                                                    width: '150px'
                                                },
                                            }}
                                            disabled={getStatus(row.id) !== 'draft'}
                                        >
                                            {classList.map((classItem) => (
                                                classItem.period === 3 &&
                                                <MenuItem key={classItem.id} value={classItem.id}>
                                                    {classItem.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <TextField
                                            select
                                            name="status"
                                            value={getStatus(row.id)}
                                            onChange={(event) => { handleStatusChange(row.id, event.target.value) }}
                                            InputProps={{
                                                style: {
                                                    fontSize: '15px',
                                                    height: '30px',
                                                    width: '150px'
                                                },
                                            }}
                                        >
                                            <MenuItem value="draft">Draft</MenuItem>
                                            <MenuItem value="enrolled">Enrolled</MenuItem>
                                            <MenuItem value="dropped">Dropped</MenuItem>
                                        </TextField>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={studentList.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Stack>
        </div>
    );
}