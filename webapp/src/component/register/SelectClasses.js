import React, { useState, useEffect } from 'react';
import { Stack, Typography, RadioGroup, FormControlLabel, Radio, Button } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Defines from '../Defines';
import dayjs from 'dayjs';
import ClassesCtrl from '../../control/ClassesCtrl';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';
import Resource from '../../framework/resource/Resource';
import ClassDescription from './ClassDescription';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ClassDetailPopup from './ClassDetailPopup'

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
        console.log('onClassListEnrollmentChange enrolledClassPeriod1:', enrolledClassPeriod1);
        console.log('onClassListEnrollmentChange enrolledClassPeriod2:', enrolledClassPeriod2);
        console.log('onClassListEnrollmentChange enrolledClassPeriod3:', enrolledClassPeriod3);
        if (RegisterCtrl.selectedClassPeriod1 == null || RegisterCtrl.selectedClassPeriod1 == undefined) {
            setSelectedClassPeriod1(enrolledClassPeriod1 ? enrolledClassPeriod1.class_id : null);
        }
        if (RegisterCtrl.selectedClassPeriod2 == null || RegisterCtrl.selectedClassPeriod2 == undefined) {
            setSelectedClassPeriod2(enrolledClassPeriod2 ? enrolledClassPeriod2.class_id : null);
        }
        if (RegisterCtrl.selectedClassPeriod3 == null || RegisterCtrl.selectedClassPeriod3 == undefined) {
            setSelectedClassPeriod3(enrolledClassPeriod3 ? enrolledClassPeriod3.class_id : null);
        }

    };

    const handleClassSelection = (period, classId) => {

        const selected_class = RegisterCtrl.classes.find(c => String(c.id) === String(classId));
        console.log('handleClassSelection period:', period, 'classId:', classId, 'selected_class:', selected_class);
        if (selected_class.max_grade < 0) { // kindergarten class
            // find same class name in all periods and select it

            const sameClasses = RegisterCtrl.classes.filter(c => String(c.name) === String(selected_class.name));
            console.log('handleClassSelection sameClasses:', sameClasses);
            sameClasses.forEach(sameClass => {
                if (sameClass.period === 1) { setSelectedClassPeriod1(sameClass.id); RegisterCtrl.selectedClassPeriod1 = sameClass.id; setEvaluationCheck('success');}
                if (sameClass.period === 2) { setSelectedClassPeriod2(sameClass.id); RegisterCtrl.selectedClassPeriod2 = sameClass.id;  setEvaluationCheck('success');}
                if (sameClass.period === 3) { setSelectedClassPeriod3(sameClass.id); RegisterCtrl.selectedClassPeriod3 = sameClass.id;  setEvaluationCheck('success');}                
            });

        }
        else { // other classes
            console.log('handleClassSelection classId:', classId, period);
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

        console.log('evaluateMandatoryClasses selectedClasses:', selectedClasses);

        const mandatoryClasses = RegisterCtrl.classes.filter(c => c.mendatory);
        console.log('evaluateMandatoryClasses mandatoryClasses:', mandatoryClasses);
        const selectedMandatoryClasses = mandatoryClasses.filter(c => selectedClasses.includes(c.id));
        if (selectedMandatoryClasses.length === 0) {
            return Resource.get('register.class_selection_guide_kr') + ' ' + Resource.get('register.class_selection_guide_en');
        }

        console.log('selected class number', selectedClasses.length);
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

        console.log('onSumit selectedClasses:', selectedClasses);
        const enrollments = selectedClasses.map(classId => ({
            student_id: RegisterCtrl.selected_student.id,
            class_id: classId,
            year: RegisterCtrl.year, // Example year, replace with actual value
            term: RegisterCtrl.term, // Example term, replace with actual value
            status: 'draft',
            comment: ''
        }));

        console.log('onSumit enrollments:', enrollments);
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
                {evaluationCheck !== 'success' && evaluationCheck}
            </Typography>

            <Typography variant="h8" textAlign="center" onClick={() => setShowClassDescription(true)}
                sx={{ color: 'blue', cursor: 'pointer' }} >
                {Resource.get('register.class_selection_description')}
            </Typography>
            <div style={{ height: '20px' }}></div>
            <Stack direction="row" spacing={2} justifyContent="center">
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6" textAlign="left">{Resource.get('enrollment.period_1')}</Typography>
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
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6" textAlign="left">{Resource.get('enrollment.period_2')}</Typography>
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
                    <Typography variant="h6" textAlign="left">{Resource.get('enrollment.period_3')}</Typography>
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
            <Typography variant="h8" textAlign="center">
                {evaluationCheck !== 'success' && evaluationCheck}
            </Typography>
            <Stack direction="row" spacing={2}>
                <Button variant="contained" color="secondary" fullWidth onClick={onPrev}>
                    {Resource.get('register.prev_select_basic_info')}
                </Button>
                
                <Button variant="contained" color="secondary" fullWidth onClick={onSumit}
                    disabled={evaluationCheck !== 'success'}>
                    {Resource.get('register.next_confirm')}
                </Button>
            </Stack>
            {showClassDescription && <ClassDescription funcConfirm={() => setShowClassDescription(false)} />}
        </Stack>
    );
}
