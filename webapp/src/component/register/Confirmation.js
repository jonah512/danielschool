import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@mui/material';
import Resource from '../../framework/resource/Resource';
import dayjs from 'dayjs';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';
import RegisterCtrl from '../../control/RegisterCtrl';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Logger from '../../framework/logger/Logger';

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
        Logger.debug('onEnrollmentListChange studentEnrollments:', studentEnrollments);
        const classes = studentEnrollments.map(e => {
            const classInfo = RegisterCtrl.classes.find(c => c.id === e.class_id);
            return {
            name: classInfo?.name || 'N/A',
            period: classInfo?.period || 'N/A',
            };
        }).sort((a, b) => a.period - b.period);

        setEnrolledClasses(classes);

        RegisterCtrl.email_content = Resource.get('register.request_email_content', formData.name, RegisterCtrl.year, RegisterCtrl.term, classes.map(c => `${c.period} ${Resource.get('enrollment.period')}: ${c.name}`).join('\n'));
        console.log('Email content:', RegisterCtrl.email_content);
    };
    
    return (
        <Box>
            <Stack spacing={2}>
                <Typography variant="h6" textAlign="center">
                    {Resource.get('register.basic_info')}
                </Typography>
                <Box sx={{ textAlign: 'left', marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '3px', borderRadius: '5px' }}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell align="center">{Resource.get('students.name')}</TableCell>
                                <TableCell align="left">{formData.name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">{Resource.get('students.grade')}</TableCell>
                                <TableCell align="left">{formData.grade}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">{Resource.get('students.birthdate')}</TableCell>
                                <TableCell align="left">{formData.birth_date}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">{Resource.get('students.gender')}</TableCell>
                                <TableCell align="left">{formData.gender}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">{Resource.get('students.religion')}</TableCell>
                                <TableCell align="left">{Resource.get('students.' + (formData.religion || ''))}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">{Resource.get('students.church')}</TableCell>
                                <TableCell align="left">{formData.church}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">{Resource.get('students.korean_level')}</TableCell>
                                <TableCell align="left">{formData.korean_level}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">{Resource.get('students.email')}</TableCell>
                                <TableCell align="left">{formData.email}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">{Resource.get('students.phone')}</TableCell>
                                <TableCell align="left">{formData.phone}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">{Resource.get('students.parent_name')}</TableCell>
                                <TableCell align="left">{formData.parent_name}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>

                <Typography variant="h6" textAlign="center">
                    {Resource.get('register.selected_class')}
                </Typography>
                <Box sx={{ textAlign: 'left', marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                    <Table>
                        <TableBody>
                            {enrolledClasses.map((enrolledClass, index) => (
                                <TableRow key={index}>
                                    <TableCell align="center">{`${Resource.get('enrollment.period')} ${enrolledClass.period}`}</TableCell>
                                    <TableCell align="left">{enrolledClass.name}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>

                <Box sx={{ textAlign: 'left', marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell align="center">{Resource.get('register.request_confirm')}</TableCell>
                                <TableCell align="left">{RegisterCtrl.request?.message}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>
                <Box>
                    <Typography variant="body1" textAlign="center">
                        {Resource.get('register.')}
                    </Typography>
                </Box>
            </Stack>
        </Box>
    );
}
