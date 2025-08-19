// Copyright (c) 2025 Milal Daniel Korean School.
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
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
import { TablePagination, TableSortLabel } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import Defines from '../Defines';
import Logger from '../../framework/logger/Logger';

dayjs.extend(utc);

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

export default function EnrollmentStudentTable({ search, year, term }) {
    const [studentList, setStudentList] = useState([]); // State for user list
    const [classList, setClassList] = useState([]); // State for class list
    const [enrollmentList, setEnrollmentList] = useState([]); // State for enrollment list
    const MODULE = 'EnrollmentStudentTable';
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('id');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        Logger.debug('EnrollmentStudentTable useEffect', search, year, term);
        const student_control = new StuidentCtrl(window.APIURL);
        const enrollment_control = new EnrollmentCtrl(window.APIURL);
        const class_control = new ClassesCtrl(window.APIURL);
        student_control.getStudentsEnrollment(search);
        enrollment_control.getEnrollment(year, term);
        const intervalId = setInterval(() => {
            enrollment_control.getEnrollment(year, term);
        }, 3000); // Refresh every 60 seconds

        class_control.getClassesForEnrollment(null, year, term);
        EventPublisher.addEventListener(EventDef.onStudentListChange, MODULE, onStudentListChange);
        EventPublisher.addEventListener(EventDef.onEnrollmentListChange, MODULE, onEnrollmentListChange);
        EventPublisher.addEventListener(EventDef.onClassListChange, MODULE, onClassListChange);

        return () => {
            EventPublisher.removeEventListener(EventDef.onStudentListChange, MODULE);
            EventPublisher.removeEventListener(EventDef.onEnrollmentListChange, MODULE);
            EventPublisher.removeEventListener(EventDef.onClassListChange, MODULE);
            clearInterval(intervalId);
        };
    }, [search, year, term, window.APIURL]);

    const onEnrollmentListChange = (data) => {
        Logger.debug('onEnrollmentListChange:');
        setEnrollmentList(data); // Update enrollment list state 
    }

    const onClassListChange = (data) => {
        Logger.debug('onClassListChange:');
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

    const enrollmentMap = React.useMemo(() => {
        const map = new Map();
        enrollmentList.forEach((enrollment) => {
            if (!map.has(enrollment.student_id)) {
                map.set(enrollment.student_id, []);
            }
            map.get(enrollment.student_id).push(enrollment);
        });
        return map;
    }, [enrollmentList]);

    const getEnrolledClass = (studentId, period) => {
        const studentEnrollments = enrollmentMap.get(studentId) || [];
        const enrollment = studentEnrollments.find((enrollment) =>
            classList.find((classItem) => classItem.id === enrollment.class_id)?.period === period
        );
        console.log('getEnrolledClass', enrollment);
        return enrollment ? { class_id: enrollment.class_id, created_at: enrollment.created_at } : { class_id: -1, created_at: null };
    }

    const handleChange = async (studentId, period, classId) => {
        const enrollment = enrollmentList.find((enrollment) =>
            enrollment.student_id === studentId &&
            classList.find((classItem) => classItem.id === enrollment.class_id)?.period === period
        );

        if (enrollment) {
            // update existing enrollment
            const enrollment_control = new EnrollmentCtrl(window.APIURL);
            enrollment.class_id = classId;
            await enrollment_control.updateEnrollmentSync(enrollment.id, enrollment);
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
        enrollmentList.map(async (enrollment) => {
            if (enrollment.student_id === studentId) {
                enrollment.status = status;
                await enrollment_control.updateEnrollmentSync(enrollment.id, enrollment);
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
    const handleDownloadCsv = () => {
        const csvContent = [
            ['Student ID', 'Student Name', 'Grade', 'Korean Level', 'Birth Date', 'Period 1 Class', 'Period 2 Class', 'Period 3 Class', 'Status', 'Email', 'Phone',
                'Created At', 'Religion', 'Church', 'Total Fee'
            ],
            ...studentList.map(student => [
                student.id,
                student.name,
                student.grade,
                student.korean_level || '',
                student.birth_date ? dayjs(student.birth_date).format('YYYY-MM-DD') : '',
                classList.find(classItem => classItem.id === getEnrolledClass(student.id, 1).class_id)?.name || '',
                classList.find(classItem => classItem.id === getEnrolledClass(student.id, 2).class_id)?.name || '',
                classList.find(classItem => classItem.id === getEnrolledClass(student.id, 3).class_id)?.name || '',
                getStatus(student.id),
                student.email || '',
                student.phone || '',
                getEnrolledClass(student.id, 1).created_at ? dayjs(getEnrolledClass(student.id, 1).created_at).utcOffset(Defines.UTC_GAP).format('YYYY-MM-DD HH:mm:ss') : '',
                student.religion || '',
                student.church || '',
                classList
                    .filter(classItem => 
                        [1, 2, 3].includes(classItem.period) && 
                        getEnrolledClass(student.id, classItem.period).class_id === classItem.id
                    )
                    .reduce((sum, classItem) => sum + (classItem.fee || 0), 0)
                    .toFixed(2)                
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const file_name = `enrollments_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.csv`;
        link.setAttribute('download', file_name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedStudentList = React.useMemo(() => {
        return [...studentList].sort((a, b) => {
            let aValue = a[orderBy];
            let bValue = b[orderBy];

            // Handle special cases for sorting
            if (orderBy === 'grade') {
                aValue = Defines.gradeOptions.find(g => g.label === aValue)?.value || 0;
                bValue = Defines.gradeOptions.find(g => g.label === bValue)?.value || 0;
            } else if (orderBy === 'enrollment_date') {
                // Sort by enrollment date
                aValue = getEnrolledClass(a.id, 1).created_at;
                bValue = getEnrolledClass(b.id, 1).created_at;
                // Handle null dates
                if (!aValue && !bValue) return 0;
                if (!aValue) return 1;
                if (!bValue) return -1;
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) {
                return order === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [studentList, orderBy, order, enrollmentList, classList]);

    return (
        <div style={{ width: '100%' }}>
            <Stack spacing={1} style={{ width: '100%' }}>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align="center">
                                    <TableSortLabel
                                        active={orderBy === 'id'}
                                        direction={orderBy === 'id' ? order : 'asc'}
                                        onClick={() => handleRequestSort('id')}
                                    >
                                        {Resource.get('enrollment.id')}
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                    <TableSortLabel
                                        active={orderBy === 'name'}
                                        direction={orderBy === 'name' ? order : 'asc'}
                                        onClick={() => handleRequestSort('name')}
                                    >
                                        {Resource.get('enrollment.student_name')}
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                    <TableSortLabel
                                        active={orderBy === 'grade'}
                                        direction={orderBy === 'grade' ? order : 'asc'}
                                        onClick={() => handleRequestSort('grade')}
                                    >
                                        {Resource.get('enrollment.grade')}
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                    <TableSortLabel
                                        active={orderBy === 'korean_level'}
                                        direction={orderBy === 'korean_level' ? order : 'asc'}
                                        onClick={() => handleRequestSort('korean_level')}
                                    >
                                        {Resource.get('students.korean_level')}
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                    <TableSortLabel
                                        active={orderBy === 'birth_date'}
                                        direction={orderBy === 'birth_date' ? order : 'asc'}
                                        onClick={() => handleRequestSort('birth_date')}
                                    >
                                        {Resource.get('students.birthdate')}
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('enrollment.period_1')}</StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('enrollment.period_2')}</StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('enrollment.period_3')}</StyledTableCell>
                                <StyledTableCell align="center">
                                        {Resource.get('enrollment.status')}
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                    <TableSortLabel
                                        active={orderBy === 'email'}
                                        direction={orderBy === 'email' ? order : 'asc'}
                                        onClick={() => handleRequestSort('email')}
                                    >
                                        {Resource.get('students.email')}
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                    <TableSortLabel
                                        active={orderBy === 'phone'}
                                        direction={orderBy === 'phone' ? order : 'asc'}
                                        onClick={() => handleRequestSort('phone')}
                                    >
                                        {Resource.get('students.phone')}
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                    <TableSortLabel
                                        active={orderBy === 'enrollment_date'}
                                        direction={orderBy === 'enrollment_date' ? order : 'asc'}
                                        onClick={() => handleRequestSort('enrollment_date')}
                                    >
                                        {'Date'}
                                    </TableSortLabel>
                                </StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('students.religion')}</StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('students.church')}</StyledTableCell>
                                <StyledTableCell align="center">{Resource.get('classes.fee')}</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedStudentList
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                    <StyledTableRow key={row.id}>
                                        <StyledTableCell align="center">{row.id}</StyledTableCell>
                                        <StyledTableCell align="center">{row.name}</StyledTableCell>
                                        <StyledTableCell align="center">{row.grade}</StyledTableCell>
                                        <StyledTableCell align="center">{row.korean_level}</StyledTableCell>
                                        <StyledTableCell align="center">{dayjs(row.birth_date).format('YYYY-MM-DD')}</StyledTableCell>
                                        <StyledTableCell align="center">
                                            <TextField
                                                select
                                                name="period_3"
                                                value={getEnrolledClass(row.id, 1).class_id}
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
                                                value={getEnrolledClass(row.id, 2).class_id}
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
                                                value={getEnrolledClass(row.id, 3).class_id}
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

                                        <StyledTableCell align="center">{row.email}</StyledTableCell>
                                        <StyledTableCell align="center">{row.phone}</StyledTableCell>
                                        <StyledTableCell align="center">{getEnrolledClass(row.id, 1).created_at ? dayjs(getEnrolledClass(row.id, 1).created_at).utcOffset(Defines.UTC_GAP).format('YYYY-MM-DD HH:mm:ss') : ''}</StyledTableCell>
                                        <StyledTableCell align="center">{row.religion}</StyledTableCell>
                                        <StyledTableCell align="center">{row.church}</StyledTableCell>
                                        <StyledTableCell align="center">
                                            {classList
                                                .filter(classItem => 
                                                    [1, 2, 3].includes(classItem.period) && 
                                                    getEnrolledClass(row.id, classItem.period).class_id === classItem.id
                                                )
                                                .reduce((sum, classItem) => sum + (classItem.fee || 0), 0)
                                                .toFixed(2) // Ensure proper rounding to two decimal places
                                            }
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={sortedStudentList.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                <Box sx={{ flexGrow: 1 }} >
                <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    onClick={handleDownloadCsv} // Open dialog
                    startIcon={<DownloadIcon />}
                >
                    {Resource.get('common.download')}
                </Button>
                </Box>
            </Stack>
        </div>
    );
}