import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import Resource from '../../framework/resource/Resource';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Defines from '../Defines';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AlertDialog from '../common/AlertDialog';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';
import SessionManager from '../../control/SessionManager';
import FindStudentDialog from './FindStudentDialog';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';
import Logger from '../../framework/logger/Logger';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.white,
        fontSize: 14,
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
    height: '19px',
}));

export default function ClassroomElementV2({ classItem, students, enrollments, classes, search }) {

    const [studentsInClass, setStudentsInClass] = React.useState([]);
    const [enrollmentsInClass, setEnrollmentsInClass] = React.useState([]);
    const [deleteConfirm, setDeleteConfirm] = React.useState(false);
    const [selectedStudent, setSelectedStudent] = React.useState(null);
    const [selectedStudentName, setSelectedStudentName] = React.useState(null);
    const [addConfirm, setAddConfirm] = React.useState(false);

    useEffect(() => {

        const enrollments_ = enrollments.filter(enrollment => enrollment.class_id === classItem.id);
        const students_ = students.filter(student => enrollmentsInClass.some(enrollment => enrollment.student_id === student.id));

        setStudentsInClass(students_);
        console.log('studentsInClass', students_);
        setEnrollmentsInClass(enrollments_);
        EventPublisher.addEventListener(EventDef.onEnrollmentDelete + classItem.id, 'Classroom' + classItem.id, onEnrollmentDelete);
        return () => {
            EventPublisher.removeEventListener(EventDef.onEnrollmentDelete + classItem.id, 'Classroom' + classItem.id);
        }
    }, [classItem, students, enrollments]);

    const onEnrollmentDelete = (deleted_enrollments) => {

        for (const deleted_enrollment of deleted_enrollments) {
            setStudentsInClass((prev) => {
                const updatedStudents = prev.filter(student => student.id !== deleted_enrollment.student_id);
                return updatedStudents;
            });
            setEnrollmentsInClass((prev) => {
                const updatedEnrollments = prev.filter(enrollment => enrollment.student_id !== deleted_enrollment.student_id);
                return updatedEnrollments;
            });
        }
    }

    const handleDeleteStudent = (student_id, student_name) => {

        setSelectedStudent(student_id);
        setSelectedStudentName(student_name);
        setDeleteConfirm(true);
    }

    const handleAddStudent = () => {
        // remove previous enrollment and add new enrollment
        // open dialog to select students
        setAddConfirm(true);
    }

    const onDeleteConfirm = async () => {
        // remove enrollment
        const year = SessionManager.getSearchWord('Enrollment_Year');
        const term = SessionManager.getSearchWord('Enrollment_Term');

        const enrollment_control = new EnrollmentCtrl(window.APIURL);

        const enrollment = enrollmentsInClass.find(enrollment => enrollment.student_id === selectedStudent && enrollment.class_id === classItem.id);

        if (enrollment) {
            await enrollment_control.deleteEnrollment(enrollment.id, year, term);
            //enrollment_control.getEnrollment(year, term); // Refresh the student list
            const restEnrollments = enrollmentsInClass ? enrollmentsInClass.filter(enrollment => enrollment.student_id !== selectedStudent) : [];
            const restStudents = studentsInClass ? studentsInClass.filter(student => student.id !== selectedStudent) : [];

            console.log('restStudents', restStudents);
            Logger.debug('restEnrollments', restEnrollments);
            setStudentsInClass(restStudents);
            setEnrollmentsInClass(restEnrollments);
        }

        onCloseDeletePopup();
    }

    const onAddStudent = async (selectionStudent) => {
        const year = SessionManager.getSearchWord('Enrollment_Year');
        const term = SessionManager.getSearchWord('Enrollment_Term');
        const enrollmentControl = new EnrollmentCtrl(window.APIURL);

        for (const studentId of selectionStudent) {
            Logger.debug('Selected student ID:', studentId);
            // Add logic to handle each selected student ID
            const newEnrollment = {
                student_id: studentId,
                class_id: classItem.id,
                status: 'draft',
                comment: '',
                year: year,
                term: term
            };
            Logger.debug('newEnrollment', newEnrollment);
            await enrollmentControl.addEnrollmentSync(newEnrollment);
        }

        if (enrollments && classes) {
            // find out enrollments with the same student id
            const sameStudentEnrollments = enrollments.filter(enrollment => selectionStudent.includes(enrollment.student_id));
            Logger.debug('Enrollments with the same student ID:', sameStudentEnrollments);
            // find out enrollments which class id has same  period with the selected class
            const samePeriodEnrollments = sameStudentEnrollments.filter(enrollment => {
                const class_ = classes.find(classItem => classItem.id === enrollment.class_id);
                return class_ && class_.period === classItem.period && class_.id !== classItem.id;
            });
            Logger.debug('Enrollments with the same period:', samePeriodEnrollments);
            // Create a map to store enrollments by class ID
            const enrollmentsByClassId = new Map();

            Logger.debug('Enrollments grouped by class ID:', enrollmentsByClassId);
            // remove enrollments with the same student id and class id
            for (const enrollment of samePeriodEnrollments) {
                Logger.debug('Remove enrollment:', enrollment);
                await enrollmentControl.deleteEnrollment(enrollment.id, year, term);
                Logger.debug('Remove enrollment Publish:', EventDef.onEnrollmentDelete + enrollment.class_id);
                if (!enrollmentsByClassId.has(enrollment.class_id)) {
                    enrollmentsByClassId.set(enrollment.class_id, []);
                }
                enrollmentsByClassId.get(enrollment.class_id).push(enrollment);
            }
            // Publish the event for each class ID
            for (const [classId, enrollments] of enrollmentsByClassId) {
                EventPublisher.publish(EventDef.onEnrollmentDelete + classId, enrollments);
            }
        }

        enrollmentControl.getEnrollment(year, term);
    }

    const onCloseAddPopup = () => {
        setAddConfirm(false);
        setStudentsInClass([]);
        setEnrollmentsInClass([]);
    }

    const onCloseDeletePopup = () => {
        setSelectedStudent(null);
        setSelectedStudentName(null);
        setDeleteConfirm(false);
    }
    const getGradeLabel = (grade) => {
        return grade.replace('Grade ', '').replace('Senior Kindergarten', 'SK').replace('Junior Kindergarten', 'JK');
    };
    const getClassName = (name) => {
        if(name.length < 3){
            return '[ ' +name.substring(0, 1) + ' ' + name.substring(1, 2) + ' ]';
        }
        else if (name.length == 3){
            return '[ ' +name.substring(0, 1) + ' ' + name.substring(1, 2) + ' ' + name.substring(2, 3) + ' ]';
        }
        else if(name.length > 5){
            return name.substring(0, 5) + '...';
        }
        return name;
    };
    const getStudentName = (name) => {
        if(name.length > 5){
            return name.substring(0, 5) + '...';
        }
        return name;
    };
    return (
        <Box sx={{ border: 0.5, borderRadius: 1, padding: 0, marginBottom: 1 }} minWidth={80} textAlign="center">
            <Tooltip
                title={
                    <Stack spacing={1}>
                        <Typography variant="body2">{classItem.name}</Typography>
                        <Typography variant="body2">{Resource.get('classes.grade')}: {Defines.gradeOptions.find(option => option.value === classItem.min_grade).label}~{Defines.gradeOptions.find(option => option.value === classItem.max_grade).label}</Typography>
                        <Typography variant="body2">{Resource.get('classes.max_students')}: {classItem.max_students}</Typography>
                        <Typography variant="body2">{Resource.get('students.korean_level')}: {classItem.min_korean_level}~{classItem.max_korean_level}</Typography>
                    </Stack>
                }
                arrow
            >
                {studentsInClass.length > classItem.max_students ? 
                      (<Box backgroundColor="#dddddd" sx={{ padding: 1, borderRadius: 1 }}>
                        <Typography variant="h8" style={{ color: 'red', fontSize:'13px' }}>{getClassName(classItem.name)}</Typography>
                        <Typography variant="h8" style={{ color: 'red', fontSize:'13px' }}> [{studentsInClass.length}/{classItem.max_students}]</Typography>
                        </Box>)
                    : (<Box backgroundColor="#dddddd" sx={{ padding: 1, borderRadius: 1 }}>
                        <Typography variant="h8" style={{ color: 'black', fontSize:'13px'}} >{getClassName(classItem.name)}</Typography>
                        <Typography variant="h8" style={{ color: 'black', fontSize:'13px' }} > [{studentsInClass.length}/{classItem.max_students}]</Typography>
                        </Box>)}

            </Tooltip>
            <Stack direction="column" justifyContent="space-between" alignItems="center" spacing={0} sx={{ padding: 0 }}>
                {studentsInClass.map((row) => (
                        <Tooltip
                                title={
                                    <Stack spacing={1}>
                                        <Typography variant="body2">{Resource.get('students.name')}: {row.name}</Typography>
                                        <Typography variant="body2">{Resource.get('students.parent_name')}: {row.parent_name}</Typography>
                                        <Typography variant="body2">{Resource.get('students.korean_level')}: {row.korean_level}</Typography>
                                        <Typography variant="body2">{Resource.get('students.grade')}: {row.grade}</Typography>
                                    </Stack>
                                }
                                arrow
                            >
                        <TextField value={getStudentName(row.name) + '(' + getGradeLabel(row.grade) + ')'} key={row.id} variant="standard" size="small" sx={{ width: '100%' }} InputProps={{
                            readOnly: true,
                            disableUnderline: true,                        
                            style: { fontSize: '14px' },
                            onDoubleClick: (e) => {
                                e.stopPropagation();
                                handleDeleteStudent(row.id, row.name);
                            }
                        }}>
                        </TextField>
                        
                    </Tooltip>
                ))}
                <IconButton
                    aria-label="add"
                    onClick={() => {
                        handleAddStudent();
                    }}
                >
                <Box><AddCircleOutlineIcon /></Box>   
                </IconButton>
            </Stack>

            {deleteConfirm &&
                (<AlertDialog
                    onYes={onDeleteConfirm}
                    onNo={onCloseDeletePopup}
                    YesOrNo={true} Open={true}
                    Title={Resource.get("classroom.remove_student_tilte")}
                    Content={Resource.get("classroom.remove_student_content", selectedStudentName)} />)}
            {addConfirm &&
                <FindStudentDialog classId={classItem.id} onClose={onCloseAddPopup} onAddStudent={onAddStudent} />}

        </Box>
    );
}
