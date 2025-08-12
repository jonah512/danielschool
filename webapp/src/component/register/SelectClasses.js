import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, RadioGroup, FormControlLabel, Radio, Button, TextField, useMediaQuery, useTheme } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import ClassesCtrl from '../../control/ClassesCtrl';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';
import Resource from '../../framework/resource/Resource';
import ClassDescription from './ClassDescription';
import ClassDetailPopup from './ClassDetailPopup'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Logger from '../../framework/logger/Logger';
import RequestsCtrl from '../../control/RequestsCtrl';
import GradingIcon from '@mui/icons-material/Grading';

export default function SelectClasses({ onNext, onPrev }) {

    const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.selected_student);
    const [classes_period_1, setClasses_period_1] = useState([]);
    const [classes_period_2, setClasses_period_2] = useState([]);
    const [classes_period_3, setClasses_period_3] = useState([]);
    const [selectedClassPeriod1, setSelectedClassPeriod1] = useState(null);
    const [selectedClassPeriod2, setSelectedClassPeriod2] = useState(null);
    const [selectedClassPeriod3, setSelectedClassPeriod3] = useState(null);
    const [showClassDescription, setShowClassDescription] = useState(false);
    const [hoveredClass, setHoveredClass] = useState(null);
    const [evaluationCheck, setEvaluationCheck] = useState('');
    const [requestContent, setRequestContent] = useState('');
        const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen size is small
    
    const MODULE = 'SelectClasses';


    useEffect(() => {
        RegisterCtrl.selectedClassPeriod1 = RegisterCtrl.selectedClassPeriod2 = RegisterCtrl.selectedClassPeriod3 = null;
        EventPublisher.addEventListener(EventDef.onClassListChange, MODULE, onClassListChange);
        EventPublisher.addEventListener(EventDef.onSelectedStudentChanged, MODULE, onSelectedStudentChanged);
        EventPublisher.addEventListener(EventDef.onTeacherListChange, MODULE, onTeacherListChange);
        return () => {
            EventPublisher.removeEventListener(EventDef.onClassListChange, MODULE);
            EventPublisher.removeEventListener(EventDef.onSelectedStudentChanged, MODULE);
            EventPublisher.removeEventListener(EventDef.onTeacherListChange, MODULE);
        };
    }, []);

    const onSelectedStudentChanged = (student) => {
        Logger.debug('onSelectedStudentChanged student : ', student);
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
            student.grade >= c.min_grade
            && student.grade <= c.max_grade
            && student.korean_level >= c.min_korean_level
            && student.korean_level <= c.max_korean_level
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
        Logger.debug('onClassListEnrollmentChange enrolledClassPeriod1:', enrolledClassPeriod1);
        Logger.debug('onClassListEnrollmentChange enrolledClassPeriod2:', enrolledClassPeriod2);
        Logger.debug('onClassListEnrollmentChange enrolledClassPeriod3:', enrolledClassPeriod3);
        if (RegisterCtrl.selectedClassPeriod1 == null || RegisterCtrl.selectedClassPeriod1 == undefined) {
            setSelectedClassPeriod1(enrolledClassPeriod1 ? enrolledClassPeriod1.class_id : null);
        }
        if (RegisterCtrl.selectedClassPeriod2 == null || RegisterCtrl.selectedClassPeriod2 == undefined) {
            setSelectedClassPeriod2(enrolledClassPeriod2 ? enrolledClassPeriod2.class_id : null);
        }
        if (RegisterCtrl.selectedClassPeriod3 == null || RegisterCtrl.selectedClassPeriod3 == undefined) {
            setSelectedClassPeriod3(enrolledClassPeriod3 ? enrolledClassPeriod3.class_id : null);
        }

        if(RegisterCtrl.selectedClassPeriod1 == null && RegisterCtrl.selectedClassPeriod2 == null && RegisterCtrl.selectedClassPeriod3 == null){
            setEvaluationCheck(evaluateMandatoryClasses(enrolledClassPeriod1.class_id, enrolledClassPeriod2.class_id, enrolledClassPeriod3.class_id));
        }

    };

    const handleClassSelection = (period, classId) => {
        const selected_class = RegisterCtrl.classes.find(c => String(c.id) === String(classId));
        console.log('handleClassSelection period:', period, 'classId:', classId, 'selected_class:', selected_class);
        if (selected_class.max_grade < 0) { // kindergarten class
            // find same class name in all periods and select it

            const sameClasses = RegisterCtrl.classes.filter(c => String(c.name) === String(selected_class.name));
            Logger.debug('handleClassSelection sameClasses:', sameClasses);
            sameClasses.forEach(sameClass => {
                if (sameClass.period === 1) { setSelectedClassPeriod1(sameClass.id); RegisterCtrl.selectedClassPeriod1 = sameClass.id; setEvaluationCheck('success');}
                if (sameClass.period === 2) { setSelectedClassPeriod2(sameClass.id); RegisterCtrl.selectedClassPeriod2 = sameClass.id;  setEvaluationCheck('success');}
                if (sameClass.period === 3) { setSelectedClassPeriod3(sameClass.id); RegisterCtrl.selectedClassPeriod3 = sameClass.id;  setEvaluationCheck('success');}                
            });

        }
        else if (selected_class.name === '한글초급집중반') { // kindergarten class
            // find same class name in all periods and select it

            const sameClasses = RegisterCtrl.classes.filter(c => String(c.name) === String(selected_class.name));
            Logger.debug('handleClassSelection sameClasses:', sameClasses);
            sameClasses.forEach(sameClass => {
                if (sameClass.period === 1) { setSelectedClassPeriod1(sameClass.id); RegisterCtrl.selectedClassPeriod1 = sameClass.id; setEvaluationCheck('success');}
                if (sameClass.period === 2) { setSelectedClassPeriod2(sameClass.id); RegisterCtrl.selectedClassPeriod2 = sameClass.id;  setEvaluationCheck('success');}
                if (sameClass.period === 3) { setSelectedClassPeriod3(sameClass.id); RegisterCtrl.selectedClassPeriod3 = sameClass.id;  setEvaluationCheck('success');}                
            });

        }
        else { // other classes
            // Check if only one period has '한글초급집중반' selected, remove selection if so
            const selectedNames = [
                period != 1 ? RegisterCtrl.classes.find(c => String(c.id) === String(selectedClassPeriod1))?.name: '',
                period != 2 ? RegisterCtrl.classes.find(c => String(c.id) === String(selectedClassPeriod2))?.name: '',
                period != 3 ? RegisterCtrl.classes.find(c => String(c.id) === String(selectedClassPeriod3))?.name: ''
            ];
            const hangulBeginnerCount = selectedNames.filter(name => name === '한글초급집중반').length;
            console.log('handleClassSelection hangulBeginnerCount:', hangulBeginnerCount, 'selectedNames:', selectedNames);

            if (hangulBeginnerCount === 1) {
                if (period != 1 && selectedClassPeriod1 && RegisterCtrl.classes.find(c => String(c.id) === String(selectedClassPeriod1))?.name === '한글초급집중반') {
                    setSelectedClassPeriod1(null);
                    RegisterCtrl.selectedClassPeriod1 = null;
                }
                if (period != 2 && selectedClassPeriod2 && RegisterCtrl.classes.find(c => String(c.id) === String(selectedClassPeriod2))?.name === '한글초급집중반') {
                    setSelectedClassPeriod2(null);
                    RegisterCtrl.selectedClassPeriod2 = null;
                }
                if (period != 3 && selectedClassPeriod3 && RegisterCtrl.classes.find(c => String(c.id) === String(selectedClassPeriod3))?.name === '한글초급집중반') {
                    setSelectedClassPeriod3(null);
                    RegisterCtrl.selectedClassPeriod3 = null;
                }
            }

            Logger.debug('handleClassSelection classId:', classId, period);
            if (period === 1) {
                setSelectedClassPeriod1(classId);
                RegisterCtrl.selectedClassPeriod1 = classId;
                setEvaluationCheck(evaluateMandatoryClasses(classId, selectedClassPeriod2, selectedClassPeriod3));
            }
            if (period === 2) { setSelectedClassPeriod2(classId); RegisterCtrl.selectedClassPeriod2 = classId; 
                setEvaluationCheck(evaluateMandatoryClasses(selectedClassPeriod1, classId, selectedClassPeriod3));
            }
            if (period === 3) { setSelectedClassPeriod3(classId); RegisterCtrl.selectedClassPeriod3 = classId; 
                setEvaluationCheck(evaluateMandatoryClasses(selectedClassPeriod1, selectedClassPeriod2, classId));
            }
        }
        
    };

    const evaluateMandatoryClasses = (period1, period2, period3) => {

        const selectedClasses = [
            Number(period1),
            Number(period2),
            Number(period3)
        ];

        Logger.debug('evaluateMandatoryClasses selectedClasses:', selectedClasses);
        const student = RegisterCtrl.selected_student;
        const filteredClasses = RegisterCtrl.classes.filter(c =>
            student.grade >= c.min_grade
            && student.grade <= c.max_grade
            && student.korean_level >= c.min_korean_level
            && student.korean_level <= c.max_korean_level
        );
        const mandatoryClasses = filteredClasses.filter(c => c.mendatory);
        Logger.debug('evaluateMandatoryClasses mandatoryClasses:', mandatoryClasses);
        const selectedMandatoryClasses = mandatoryClasses.filter(c => selectedClasses.includes(c.id));
        Logger.debug('evaluateMandatoryClasses selectedMandatoryClasses:', selectedMandatoryClasses);
        if (selectedMandatoryClasses.length === 0) {
            return Resource.get('register.class_selection_guide_kr') + ' ' + Resource.get('register.class_selection_guide_en');
        }

        Logger.debug('selected class number', selectedClasses.length);
        if (selectedClasses.length !== 3 || selectedClasses.includes(0)) {
            return '총 3과목을 선택해야 합니다.';
        }

        return 'success';
    };

    const onSumit = async () => {

        const previousEnrollments = RegisterCtrl.enrollments.filter(
            (enrollment) => enrollment.student_id === RegisterCtrl.selected_student.id
        );

        const prevClassPeriod1 = previousEnrollments.find(e => e.class_id && classes_period_1.some(c => c.id === e.class_id));
        const prevClassPeriod2 = previousEnrollments.find(e => e.class_id && classes_period_2.some(c => c.id === e.class_id));
        const prevClassPeriod3 = previousEnrollments.find(e => e.class_id && classes_period_3.some(c => c.id === e.class_id));

        if (prevClassPeriod1 && prevClassPeriod1.class_id == selectedClassPeriod1) {
            // remove previous enrollment for period 1
            previousEnrollments.splice(previousEnrollments.indexOf(prevClassPeriod1), 1);
        }
        if (prevClassPeriod2 && prevClassPeriod2.class_id == selectedClassPeriod2) {
            // remove previous enrollment for period 2
            previousEnrollments.splice(previousEnrollments.indexOf(prevClassPeriod2), 1);
        }
        if (prevClassPeriod3 && prevClassPeriod3.class_id == selectedClassPeriod3) {
            // remove previous enrollment for period 3
            previousEnrollments.splice(previousEnrollments.indexOf(prevClassPeriod3), 1);
        }


        // Create enrollment for each selected class
        const selectedClasses = [
            prevClassPeriod1 && prevClassPeriod1.class_id == selectedClassPeriod1 ? null : selectedClassPeriod1,
            prevClassPeriod2 && prevClassPeriod2.class_id == selectedClassPeriod2 ? null : selectedClassPeriod2,
            prevClassPeriod3 && prevClassPeriod3.class_id == selectedClassPeriod3 ? null : selectedClassPeriod3,
        ].filter(id => id); // Filter out empty selections

        Logger.debug('onSumit selectedClasses:', selectedClasses);
        const enrollments = selectedClasses.map(classId => ({
            student_id: RegisterCtrl.selected_student.id,
            class_id: classId,
            year: RegisterCtrl.year, // Example year, replace with actual value
            term: RegisterCtrl.term, // Example term, replace with actual value
            status: 'draft',
            comment: ''
        }));

        Logger.debug('onSumit enrollments:', enrollments);
        const enrollment_control = new EnrollmentCtrl(window.APIURL);

        try {

            for (const enrollment of enrollments) {
                await enrollment_control.conditionAddEnrollmentSync(enrollment);
            }

            // Remove previous enrollments for the selected student
            try {
                for (const enrollment of previousEnrollments) {
                    await enrollment_control.deleteEnrollmentSync(enrollment.id);
                }
            } catch (error) {
                console.error('Error during enrollment removal:', error);

            }

            enrollment_control.getEnrollment(RegisterCtrl.year, RegisterCtrl.term);
            sendRequest();
            onNext();

        } catch (enrollmentData) {
            console.error('Error during enrollment submission:', enrollmentData);
            const className = RegisterCtrl.classes.find(c => Number(c.id) === Number(enrollmentData.class_id))?.name || 'Unknown';
            alert(Resource.get('register.enrollment_fail', className));

            for (const enrollment of enrollments) {
                try {
                    await enrollment_control.deleteEnrollmentSync(enrollment.id);
                }
                catch (error) {
                    console.error('Error during enrollment removal:', error);
                }
            }
            enrollment_control.getEnrollment(RegisterCtrl.year, RegisterCtrl.term);
        }

        RegisterCtrl.selectedClassPeriod1 = RegisterCtrl.selectedClassPeriod2 = RegisterCtrl.selectedClassPeriod3 = null;
    };

    const sendRequest = () =>{
        Logger.debug('sendRequest:', RegisterCtrl.selected_student);
        const request = {
            "email": RegisterCtrl.selected_student.email,
            "name": RegisterCtrl.selected_student.parent_name,
            "phone": RegisterCtrl.selected_student.phone,
            "students": RegisterCtrl.selected_student.name,
            "message": requestContent || '', 
            "status": "REQUESTED",
            "memo": ""
        };
        Logger.debug('sendRequest request:', request); // Add logging to debug

        RegisterCtrl.request = request;
    }

    const onRequestChange = (value) => {
        setRequestContent(value.target.value );
    }

    return (
        <Stack
            direction="column"
            spacing={1}
        >
            <Typography variant="h5" textAlign="center">
                {Resource.get('register.select_class_guide')}
            </Typography>

            <div style={{ height: '20px' }}></div>
            <Typography variant="h8" textAlign="center" sx={{color:'#ff0000'}}>
                {evaluationCheck !== 'success' && evaluationCheck}
            </Typography>

            <Typography variant="h8" textAlign="center" onClick={() => setShowClassDescription(true)}
                sx={{ color: 'blue', cursor: 'pointer' }} >
                {Resource.get('register.class_selection_description')}
            </Typography>
            <div style={{ height: '20px' }}></div>
            <Stack direction={isMobile?"column":"row"} spacing={2} justifyContent="center">
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6" textAlign="left">[ {Resource.get('enrollment.period_1')} ]</Typography>
                    <RadioGroup
                        value={selectedClassPeriod1}
                        onChange={(e) => handleClassSelection(1, e.target.value)}                        
                    >
                        {classes_period_1.map((classItem) => (
                            <FormControlLabel
                                key={classItem.id}
                                value={classItem.id}
                                control={<Radio />}
                                disabled={classItem.enrolled_number >= classItem.max_students}
                                sx={{ marginBottom: 2 }} // Add spacing between items
                                label={
                                    <div
                                        onMouseEnter={() => setHoveredClass(classItem)}
                                        onMouseLeave={() => setHoveredClass(null)}
                                    >
                                        {classItem.enrolled_number < classItem.max_students ?
                                            <Typography
                                                sx={{ color: classItem.mendatory ? 'blue' : 'inherit' }}
                                            >
                                                {Resource.get('register.enroll_status', classItem.name)}
                                            </Typography> :
                                            <Typography
                                                sx={{ color: 'inherit' }}
                                            >
                                                {Resource.get('register.occupied_status', classItem.name, classItem.max_students)}
                                            </Typography>
                                        }
                                        {hoveredClass === classItem && <ClassDetailPopup classItem={classItem} />}

                                    </div>
                                }
                            />
                        ))}
                    </RadioGroup>
                </Stack>
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6" textAlign="left">[ {Resource.get('enrollment.period_2')} ] </Typography>
                    <RadioGroup
                        value={selectedClassPeriod2}
                        onChange={(e) => handleClassSelection(2, e.target.value)}
                    >
                        {classes_period_2.map((classItem) => (
                            <FormControlLabel
                                key={classItem.id}
                                value={classItem.id}
                                control={<Radio />}
                                disabled={classItem.enrolled_number >= classItem.max_students}
                                sx={{ marginBottom: 2 }} // Add spacing between items
                                label={
                                    <div
                                        onMouseEnter={() => setHoveredClass(classItem)}
                                        onMouseLeave={() => setHoveredClass(null)}
                                    >
                                        {classItem.enrolled_number < classItem.max_students ?
                                            <Typography
                                                sx={{ color: classItem.mendatory ? 'blue' : 'inherit' }}
                                            >
                                                {Resource.get('register.enroll_status', classItem.name, classItem.enrolled_number, classItem.max_students)}
                                            </Typography> :
                                            <Typography
                                                sx={{ color: 'inherit' }}
                                            >
                                                {Resource.get('register.occupied_status', classItem.name)}
                                            </Typography>
                                        }
                                        {hoveredClass === classItem && <ClassDetailPopup classItem={classItem} />}
                                    </div>
                                }
                            />
                        ))}
                    </RadioGroup>
                </Stack>
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6" textAlign="left">[ {Resource.get('enrollment.period_3')} ]</Typography>
                    <RadioGroup
                        value={selectedClassPeriod3}
                        onChange={(e) => handleClassSelection(3, e.target.value)}
                    >
                        {classes_period_3.map((classItem) => (
                            <FormControlLabel
                                key={classItem.id}
                                value={classItem.id}
                                control={<Radio />}
                                disabled={classItem.enrolled_number >= classItem.max_students}
                                sx={{ marginBottom: 2 }} // Add spacing between items
                                label={
                                    <div
                                        onMouseEnter={() => setHoveredClass(classItem)}
                                        onMouseLeave={() => setHoveredClass(null)}
                                    >
                                        {classItem.enrolled_number < classItem.max_students ?
                                            <Typography
                                                sx={{ color: classItem.mendatory ? 'blue' : 'inherit' }}
                                            >
                                                {Resource.get('register.enroll_status', classItem.name, classItem.enrolled_number, classItem.max_students)}
                                            </Typography> :
                                            <Typography
                                                sx={{ color: 'inherit' }}
                                            >
                                                {Resource.get('register.occupied_status', classItem.name, classItem.max_students)}
                                            </Typography>
                                        }
                                        {hoveredClass === classItem && <ClassDetailPopup classItem={classItem} />}
                                    </div>
                                }
                            />
                        ))}
                    </RadioGroup>
                    
                </Stack>
            </Stack>
            <Typography variant="h8" textAlign="center" sx={{color:'#ff0000'}}>
                {evaluationCheck !== 'success' && evaluationCheck}
            </Typography>
            <TextField
                label={Resource.get('register.request')}
                name="memo"
                value={requestContent}
                onChange={onRequestChange}                                        
                multiline
                sx={{maxWidth:1200}}
            />
            <Typography variant="h8" textAlign="center" sx={{color:'#3700ffff'}}>
                {Resource.get('register.contacts')}
            </Typography>
            <Box height={20}></Box>
            <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary" fullWidth onClick={onPrev} startIcon={<ArrowBackIosNewIcon/>}>
                    {Resource.get('register.prev_select_basic_info')}
                </Button>
                
                <Button variant="contained" color="primary" fullWidth onClick={onSumit}
                    disabled={evaluationCheck !== 'success'} endIcon={<ArrowForwardIosIcon/>}>
                    {Resource.get('register.next_confirm')}
                </Button>
            </Stack>
            {showClassDescription && <ClassDescription funcConfirm={() => setShowClassDescription(false)} />}
        </Stack>
    );
}
