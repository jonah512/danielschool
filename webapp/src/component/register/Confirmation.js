import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Stack,
} from '@mui/material';
import Resource from '../../framework/resource/Resource';
import dayjs from 'dayjs';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';
import RegisterCtrl from '../../control/RegisterCtrl';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';

export default function Confirmation({ onNext, student }) {
    const formData = {
        ...student,
        birth_date: student?.birth_date ? dayjs(student.birth_date).format('YYYY-MM-DD') : '',
    };

    const [enrolledClasses, setEnrolledClasses] = useState([]);
    const MODULE = 'Confirmation';

    useEffect(() => {
        EventPublisher.addEventListener(EventDef.onEnrollmentListChange, MODULE, onEnrollmentListChange);

        const enrollment_control = new EnrollmentCtrl(window.APIURL);
        enrollment_control.getEnrollment(RegisterCtrl.year, RegisterCtrl.term);
        
        return () => {
            EventPublisher.removeEventListener(EventDef.onEnrollmentListChange, MODULE);
        };
    }, [student.id]);

    const onEnrollmentListChange = (enrollments) => {
        RegisterCtrl.enrollments = enrollments;
        const studentEnrollments = RegisterCtrl.enrollments.filter(e => e.student_id === student.id);
        console.log('onEnrollmentListChange studentEnrollments:', studentEnrollments);
        const classes = studentEnrollments.map(e => {
            const classInfo = RegisterCtrl.classes.find(c => c.id === e.class_id);
            return {
                name: classInfo?.name || 'N/A',
                period: classInfo?.period || 'N/A',
            };
        });
        setEnrolledClasses(classes);
    };
    
    return (
        <Box>
            <Stack spacing={2}>
                <Typography variant="h6" textAlign="center">
                    {Resource.get('register.basic_info')}
                </Typography>
                <Box sx={{ textAlign: 'left', marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                    <Typography>
                        {Resource.get('students.name')}: {formData.name}
                    </Typography>
                    <Typography>
                        {Resource.get('students.grade')}: {formData.grade}
                    </Typography>
                    <Typography>
                        {Resource.get('students.birthdate')}: {formData.birth_date}
                    </Typography>
                    <Typography>
                        {Resource.get('students.email')}: {formData.email}
                    </Typography>
                    <Typography>
                        {Resource.get('students.phone')}: {formData.phone}
                    </Typography>
                    <Typography>
                        {Resource.get('students.parent_name')}: {formData.parent_name}
                    </Typography>

                    <Typography>
                        {Resource.get('students.gender')}: {formData.gender}
                    </Typography>
                    <Typography>
                        {Resource.get('students.religion')}: {formData.religion}
                    </Typography>
                    <Typography>
                        {Resource.get('students.church')}: {formData.church}
                    </Typography>
                    <Typography>
                        {Resource.get('students.korean_level')}: {formData.korean_level}
                    </Typography>
                </Box>

                <Typography variant="h6" textAlign="center">
                    {Resource.get('register.selected_class')}
                </Typography>
                <Box sx={{ textAlign: 'left', marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                    {enrolledClasses.map((enrolledClass, index) => (
                        <Typography key={index}>
                            {`Period ${enrolledClass.period}: ${enrolledClass.name}`}
                        </Typography>
                    ))}
                </Box>
            </Stack>
        </Box>
    );
}
