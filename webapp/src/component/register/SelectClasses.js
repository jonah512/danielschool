import React, { useState, useEffect } from 'react';
import { Stack, Typography, RadioGroup, FormControlLabel, Radio, Button } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Defines from '../Defines';
import dayjs from 'dayjs';
import ClassesCtrl from '../../control/ClassesCtrl';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';

export default function SelectClasses({ onNext, onPrev }) {

    const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.selected_student);

    const [classes_period_1, setClasses_period_1] = useState([]);
    const [classes_period_2, setClasses_period_2] = useState([]);
    const [classes_period_3, setClasses_period_3] = useState([]);
    const [classList, setClassList] = useState([]); // State for class list
    const [enrollmentList, setEnrollmentList] = useState([]); // State for enrollment list

    const [selectedClassPeriod1, setSelectedClassPeriod1] = useState('');
    const [selectedClassPeriod2, setSelectedClassPeriod2] = useState('');
    const [selectedClassPeriod3, setSelectedClassPeriod3] = useState('');
    const year = 2025; // Example year, replace with actual value
    const term = 'spring'; // Example term, replace with actual value
    const MODULE = 'SelectClasses';


    useEffect(() => {
        const class_control = new ClassesCtrl(window.APIURL);
        class_control.getClasses(null, year, term);
        const enrollment_control = new EnrollmentCtrl(window.APIURL);
        enrollment_control.getEnrollment(year, term);
        EventPublisher.addEventListener(EventDef.onClassListChange, MODULE, onClassListChange);
        EventPublisher.addEventListener(EventDef.onSelectedStudentChanged, MODULE, onSelectedStudentChanged);
        EventPublisher.addEventListener(EventDef.onEnrollmentListChange, MODULE, onEnrollmentListChange);
        return () => {
            EventPublisher.removeEventListener(EventDef.onClassListChange, MODULE);
            EventPublisher.removeEventListener(EventDef.onSelectedStudentChanged, MODULE);
            EventPublisher.removeEventListener(EventDef.onEnrollmentListChange, MODULE);
        };
    }, []);

    const onSelectedStudentChanged = (student) => {
        console.log('onSelectedStudentChanged student : ', student);
        setSelectedStudent(student);
        const class_control = new ClassesCtrl(window.APIURL);
        class_control.getClasses(null, year, term);
    };

    const onClassListChange = (classes) => {
        const student = RegisterCtrl.selected_student;
        console.log('onClassListChange:', classes, student);
        setClassList(classes); // Update class list state

        const filteredClasses = classes.filter(c =>
            student.grade >= c.min_grade && student.grade <= c.max_grade
        );

        const period1 = filteredClasses.filter(c => c.period === 1);
        const period2 = filteredClasses.filter(c => c.period === 2);
        const period3 = filteredClasses.filter(c => c.period === 3);

        // Add enrolled_students parameter to each class
        period1.forEach(c => {
            c.enrolled_students = enrollmentList.filter(e => e.class_id === c.id).length;
        });
        period2.forEach(c => {
            c.enrolled_students = enrollmentList.filter(e => e.class_id === c.id).length;
        });
        period3.forEach(c => {
            c.enrolled_students = enrollmentList.filter(e => e.class_id === c.id).length;
        });

        setClasses_period_1(period1);
        setClasses_period_2(period2);
        setClasses_period_3(period3);
    };

    const onEnrollmentListChange = (data) => {

        const student = RegisterCtrl.selected_student;

        const filteredClasses = classList.filter(c =>
            student.grade >= c.min_grade && student.grade <= c.max_grade
        );

        const period1 = filteredClasses.filter(c => c.period === 1);
        const period2 = filteredClasses.filter(c => c.period === 2);
        const period3 = filteredClasses.filter(c => c.period === 3);

        // Add enrolled_students parameter to each class
        period1.forEach(c => {
            c.enrolled_students = data.filter(e => e.class_id === c.id).length;
        });
        period2.forEach(c => {
            c.enrolled_students = data.filter(e => e.class_id === c.id).length;
        });
        period3.forEach(c => {
            c.enrolled_students = data.filter(e => e.class_id === c.id).length;
        });

        setClasses_period_1(period1);
        setClasses_period_2(period2);
        setClasses_period_3(period3);

        setEnrollmentList(data); // Update enrollment list state
    };

    const handleClassSelection = (period, classId) => {
        if (period === 1) setSelectedClassPeriod1(classId);
        if (period === 2) setSelectedClassPeriod2(classId);
        if (period === 3) setSelectedClassPeriod3(classId);
    };

    const onSumit = () => {
        onNext();
    }

    return (
        <Stack
            direction="column"
            spacing={2}
        >

            <Stack direction="row" spacing={2} justifyContent="center">
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6" textAlign="left">1교시(Period 1)</Typography>
                    <RadioGroup
                        value={selectedClassPeriod1}
                        onChange={(e) => handleClassSelection(1, e.target.value)}
                    >
                        {classes_period_1.map((classItem) => (
                            <FormControlLabel
                                key={classItem.id}
                                value={classItem.id}
                                control={<Radio />}
                                disabled={classItem.enrolled_students >= classItem.max_students}
                                label={`${classItem.name} (${classItem.enrolled_students}명/${classItem.max_students}명)`}
                            />
                        ))}
                    </RadioGroup>
                </Stack>
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6" textAlign="left">2교시(Period 2)</Typography>
                    <RadioGroup
                        value={selectedClassPeriod2}
                        onChange={(e) => handleClassSelection(2, e.target.value)}
                    >
                        {classes_period_2.map((classItem) => (
                            <FormControlLabel
                                key={classItem.id}
                                value={classItem.id}
                                control={<Radio />}
                                disabled={classItem.enrolled_students >= classItem.max_students}
                                label={`${classItem.name} (${classItem.enrolled_students}명/${classItem.max_students}명)`}
                            />
                        ))}
                    </RadioGroup>
                </Stack>
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6" textAlign="left">3교시(Period 3)</Typography>
                    <RadioGroup
                        value={selectedClassPeriod3}
                        onChange={(e) => handleClassSelection(3, e.target.value)}
                    >
                        {classes_period_3.map((classItem) => (
                            <FormControlLabel
                                key={classItem.id}
                                value={classItem.id}
                                control={<Radio />}
                                disabled={classItem.enrolled_students >= classItem.max_students}
                                label={`${classItem.name} (${classItem.enrolled_students}명/${classItem.max_students}명)`}
                            />
                        ))}
                    </RadioGroup>
                </Stack>
            </Stack>

            <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary" fullWidth onClick={onPrev}>
                    Prev(기본정보확인 단계로 이동)
                </Button>
                <Button variant="contained" color="primary" fullWidth onClick={onSumit}>
                    Next (최종확인 단계로 이동)
                </Button>
            </Stack>
        </Stack>
    );
}
