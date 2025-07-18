import React, { useState, useEffect } from 'react';
import { Stack, Typography, RadioGroup, FormControlLabel, Radio, Button, Tooltip, CircularProgress, Dialog, DialogContent } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Defines from '../Defines';
import dayjs from 'dayjs';
import ClassesCtrl from '../../control/ClassesCtrl';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';
import TeachersCtrl from '../../control/TeachersCtrl';


export default function WaitingRoom({ onNext, onPrev }) {

    const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.selected_student);

    const [classes_period_1, setClasses_period_1] = useState([]);
    const [classes_period_2, setClasses_period_2] = useState([]);
    const [classes_period_3, setClasses_period_3] = useState([]);


    const [selectedClassPeriod1, setSelectedClassPeriod1] = useState(null);
    const [selectedClassPeriod2, setSelectedClassPeriod2] = useState(null);
    const [selectedClassPeriod3, setSelectedClassPeriod3] = useState(null);

    const MODULE = 'WaitingRoom';

    const [waitingPosition, setWaitingPosition] = useState(RegisterCtrl.waitingPosition);
    const [showPopup, setShowPopup] = useState(true); // State to control popup visibility

    useEffect(() => {
        EventPublisher.addEventListener(EventDef.onClassListChange, MODULE, onClassListChange);
        EventPublisher.addEventListener(EventDef.onSelectedStudentChanged, MODULE, onSelectedStudentChanged);
        EventPublisher.addEventListener(EventDef.onTeacherListChange, MODULE, onTeacherListChange);
        EventPublisher.addEventListener(EventDef.onWaitingPosition, MODULE, onWaitingPositionChange);

        const class_control = new ClassesCtrl(window.APIURL);
        class_control.getClasses(null, RegisterCtrl.year, RegisterCtrl.term);
        const teacher_control = new TeachersCtrl(window.APIURL);
        teacher_control.getTeachers();

        return () => {
            EventPublisher.removeEventListener(EventDef.onClassListChange, MODULE);
            EventPublisher.removeEventListener(EventDef.onSelectedStudentChanged, MODULE);
            EventPublisher.removeEventListener(EventDef.onTeacherListChange, MODULE);
            EventPublisher.removeEventListener(EventDef.onWaitingPosition, MODULE);
        };
    }, []);

    const onSelectedStudentChanged = (student) => {
        console.log('onSelectedStudentChanged student : ', student);
        setSelectedStudent(student);
        const class_control = new ClassesCtrl(window.APIURL);
        class_control.getClasses(null, RegisterCtrl.year, RegisterCtrl.term);
    };

    const onClassListChange = (classes) => {
        RegisterCtrl.classes = classes;
        onClassListEnrollmentChange(classes);
    };

    const onTeacherListChange = (teachers) => {
        RegisterCtrl.teachers = teachers;
    }

    const onClassListEnrollmentChange = (classes) => {
        if (!classes) return;
        if (classes.length == 0) return;

        const student = RegisterCtrl.selected_student;

        const filteredClasses = classes.filter(c =>
            student.grade >= c.min_grade && student.grade <= c.max_grade
        );

        const period1 = filteredClasses.filter(c => c.period === 1);
        const period2 = filteredClasses.filter(c => c.period === 2);
        const period3 = filteredClasses.filter(c => c.period === 3);

        setClasses_period_1(period1);
        setClasses_period_2(period2);
        setClasses_period_3(period3);

        // find out classes that are already enrolled by student for each period
        const enrolledClasses = RegisterCtrl.enrollments.filter(e => e.student_id === student.id);
        const enrolledClassPeriod1 = enrolledClasses.find(e => e.class_id && period1.some(c => c.id === e.class_id));
        const enrolledClassPeriod2 = enrolledClasses.find(e => e.class_id && period2.some(c => c.id === e.class_id));
        const enrolledClassPeriod3 = enrolledClasses.find(e => e.class_id && period3.some(c => c.id === e.class_id));
        if (selectedClassPeriod1 == null) {
            setSelectedClassPeriod1(enrolledClassPeriod1 ? enrolledClassPeriod1.class_id : null);
        }
        if (selectedClassPeriod2 == null) {
            setSelectedClassPeriod2(enrolledClassPeriod2 ? enrolledClassPeriod2.class_id : null);
        }
        if (selectedClassPeriod3 == null) {
            setSelectedClassPeriod3(enrolledClassPeriod3 ? enrolledClassPeriod3.class_id : null);
        }

    };

    const onWaitingPositionChange = (position) => {
        console.log('onWaitingPositionChange position:', position);
        setWaitingPosition(position);
        
        if( position <= Defines.MAX_WAITING_POSITION) {
            setShowPopup(false);
            EventPublisher.publish(EventDef.onMenuChanged, "EnrollmentRegister");
        } else {
            setShowPopup(true); // Show popup when position exceeds max waiting position
        }
    };

    const getTeacherName = (classItem) => {
        if (!classItem || !classItem.teacher_id) return 'N/A';
        const teacher = RegisterCtrl.teachers.find(t => t.id === classItem.teacher_id);
        return teacher ? teacher.name : 'N/A';
    };

    return (
        <Stack
            direction="column"
            spacing={1}
        >
            <Typography variant="h8" textAlign="center">
                필수과목은 파란색으로 표시됩니다. 
            </Typography>
            <Typography variant="h8" textAlign="center">
                Mendatory classes are marked in blue. 
            </Typography>
            <div style={{ height: '20px' }}></div>
            <Stack direction="row" spacing={2} justifyContent="center">
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6" textAlign="left">1교시(Period 1)</Typography>

                    {classes_period_1.map((classItem) => (

                        <Tooltip
                            title={`${getTeacherName(classItem)} 선생님,  Grade ${classItem.min_grade} ~ ${classItem.max_grade}`}
                            arrow
                        >
                            <Typography
                                sx={{ color: classItem.mendatory ? 'blue' : 'inherit' }}
                            >
                                {`${classItem.name} (${classItem.enrolled_number}명/${classItem.max_students}명)`}
                            </Typography>
                        </Tooltip>

                    ))}

                </Stack>
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6" textAlign="left">2교시(Period 2)</Typography>

                    {classes_period_2.map((classItem) => (

                        <Tooltip
                            title={`${getTeacherName(classItem)} 선생님,  Grade ${classItem.min_grade} ~ ${classItem.max_grade}`}
                            arrow
                        >
                            <Typography
                                sx={{ color: classItem.mendatory ? 'blue' : 'inherit' }}
                            >
                                {`${classItem.name} (${classItem.enrolled_number}명/${classItem.max_students}명)`}
                            </Typography>
                        </Tooltip>

                    ))}

                </Stack>
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6" textAlign="left">3교시(Period 3)</Typography>

                    {classes_period_3.map((classItem) => (

                        <Tooltip
                            title={`${getTeacherName(classItem)} 선생님, Grade ${classItem.min_grade} ~ ${classItem.max_grade}`}
                            arrow
                        >
                            <Typography
                                sx={{ color: classItem.mendatory ? 'blue' : 'inherit' }}
                            >
                                {`${classItem.name} (${classItem.enrolled_number}명/${classItem.max_students}명)`}
                            </Typography>
                        </Tooltip>

                    ))}

                </Stack>
            </Stack>
            <Dialog open={showPopup} onClose={() => setShowPopup(true)}>
                <DialogContent sx={{ textAlign: 'center', padding: '20px' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ marginTop: '10px' }}>
                        현재 {waitingPosition - Defines.MAX_WAITING_POSITION} 명이 대기 중입니다. 
                        잠시 기다려 주세요. 자동으로 화면으로 이동합니다.
                    </Typography>
                </DialogContent>
            </Dialog>
        </Stack>
    );
}
