// Copyright (c) 2025 Milal Daniel Korean School.
import dayjs from 'dayjs';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { Stack, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import StuidentCtrl from '../../control/StudentsCtrl';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';
import ClassesCtrl from '../../control/ClassesCtrl';
import Resource from '../../framework/resource/Resource';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';
import Typography from '@mui/material/Typography';
import Defines from '../Defines';
import ClassroomElement from './ClassroomElement';
import ClassroomElementV2 from './ClassroomElementV2';
import DownloadIcon from '@mui/icons-material/Download';
import Divider from '@mui/material/Divider';
import Logger from '../../framework/logger/Logger';

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

export default function ClassroomTableV2({ search, year, term }) {
    const [studentList, setStudentList] = useState([]); // State for user list
    const [classList, setClassList] = useState([]); // State for class list
    const [classListPeriod1, setClassListPeriod1] = useState([]); // State for class list period 1
    const [classListPeriod2, setClassListPeriod2] = useState([]);
    const [classListPeriod3, setClassListPeriod3] = useState([]); // State for class list period 3
    const [enrollmentList, setEnrollmentList] = useState([]); // State for enrollment list
    const MODULE = 'ClassroomTableV2';

    useEffect(() => {
        const student_control = new StuidentCtrl(window.APIURL);
        const enrollment_control = new EnrollmentCtrl(window.APIURL);
        const class_control = new ClassesCtrl(window.APIURL);
        
        const intervalId = setInterval(() => {
            student_control.getStudentsClassroomManager(search);
            enrollment_control.getEnrollment(year, term);
            class_control.getClasses(null, year, term);
        }, 3000);

        student_control.getStudentsClassroomManager(search);
        enrollment_control.getEnrollment(year, term);
        class_control.getClasses(null, year, term);

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
        Logger.debug('onEnrollmentListChange:');
        setEnrollmentList(data); // Update enrollment list state 
    }

    const onClassListChange = (data) => {
        Logger.debug('onClassListChange:');
        
        // Reusable sort function - Sort by mandatory -> name -> period
        const sortClasses = (classes) => classes.sort((a, b) => {
            if (b.mendatory !== a.mendatory) {
                return b.mendatory - a.mendatory; // Sort mandatory descending
            }
            if (a.name !== b.name) {
                return b.name.localeCompare(a.name); // Sort name descending
            }
            return a.period - b.period; // Sort period ascending
        });

        // Filter and sort classes by period
        const sortedData = sortClasses([...data]);
        const period1Classes = sortClasses(data.filter(classItem => classItem.period === 1));
        const period2Classes = sortClasses(data.filter(classItem => classItem.period === 2));
        const period3Classes = sortClasses(data.filter(classItem => classItem.period === 3));

        // Update all class list states
        setClassList(sortedData);
        setClassListPeriod1(period1Classes);
        setClassListPeriod2(period2Classes);
        setClassListPeriod3(period3Classes);
    }

    const onStudentListChange = (data) => {
        Logger.debug('onStudentListChange:');
        const processedData = data.map((student) => ({
            ...student,
            grade: Defines.gradeOptions.find((grade) => grade.value === student.grade)?.label || student.grade,
            religion: Resource.get('students.' + (student.religion || '')),
            created_at: dayjs(student.created_at).format('YYYY-MM-DD HH:mm:ss'),
            updated_at: dayjs(student.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        }));
        setStudentList(processedData); // Update user list state with formatted data
    };

    const handleDownloadCsv = () => {
        const csvContent = [
            [ ...classList.map(classItem => classItem.name + '_ ' + classItem.period)], // Header row with class names
            ...studentList.map(student => [
                ...classList.map(classItem => {
                    const isEnrolled = enrollmentList.some(enrollment => 
                        enrollment.student_id === student.id && enrollment.class_id === classItem.id
                    );
                    return isEnrolled ? student.name : ''; // Add student name if enrolled, otherwise empty
                })
            ])
        ].map(row => row.join(',')).join('\n');

        const csvRows = csvContent.split('\n');
        const headerRow = csvRows[0].split(','); // First row is the header
        Logger.debug('headerRow', headerRow);
        // create 2d additional array with same size of csvRows and headerRow
        const additionalData = Array.from({ length: headerRow.length * csvRows.length }, () => []);

        for(let i = 0; i < headerRow.length; i++) {
            let data_index = 0;
            for(let j = 1; j < csvRows.length; j++) {
                const row = csvRows[j].split(',');
                if(row[i]) {
                    additionalData[data_index++][i] = row[i]; // Add student name to the additional data
                }
            }
        }

        // Create a CSV content string
        const csvContentWithAdditionalData = [
            headerRow.join(','),
            // use additionalData to create rows
            ...additionalData.map(row => row.join(','))
        ].join('\n');
        Logger.debug('csvContentWithAdditionalData');

        const blob = new Blob(["\uFEFF" + csvContentWithAdditionalData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const file_name = `classroom_students_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.csv`;
        link.setAttribute('download', file_name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

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
                <Stack spacing={0} style={{ width: '100%' }} direction={"row"}>
                    {classList
                        .filter((classItem) => classItem.period === 1)
                        .map((classItem) => (
                            <ClassroomElementV2 key={classItem.id} classItem={classItem} students={studentList} enrollments={enrollmentList} classes={classList} search={search}/>
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
                <Stack spacing={0} style={{ width: '100%' }} direction={"row"}>
                    {classList
                        .filter((classItem) => classItem.period === 2)
                        .map((classItem) => (
                            <ClassroomElementV2 key={classItem.id} classItem={classItem} students={studentList} enrollments={enrollmentList} classes={classList} search={search}/>
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
                <Stack spacing={0} style={{ width: '100%' }} direction={"row"}>
                    {classList
                        .filter((classItem) => classItem.period === 3)
                        .map((classItem) => (
                            <ClassroomElementV2 key={classItem.id} classItem={classItem} students={studentList} enrollments={enrollmentList} classes={classList} search={search}/>
                        ))}
                </Stack>
            </Stack>
            <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        onClick={handleDownloadCsv} // Open dialog
                        startIcon={<DownloadIcon />}
                    >
                        {Resource.get('common.download')}
                    </Button>
        </div>
    );
}