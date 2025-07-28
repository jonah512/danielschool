import * as React from 'react';
import { useEffect, useState } from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import EditStudent from './EditStudent';
import RegisterCtrl from '../../control/RegisterCtrl';
import SelectClasses from './SelectClasses';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Confirmation from './Confirmation';
import AlertDialog from '../common/AlertDialog';
import ClassesCtrl from '../../control/ClassesCtrl';
import EnrollmentCtrl from '../../control/EnrollmentCtrl';
import TeachersCtrl from '../../control/TeachersCtrl';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Resource from '../../framework/resource/Resource';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Logger from '../../framework/logger/Logger';
import RequestsCtrl from '../../control/RequestsCtrl';
import Register from './Register';

export default function EnrollmentRegister() {

  const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.selected_student);
  const [stage, setStage] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const MODULE = 'EnrollmentRegister';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen size is small

  useEffect(() => {
    EventPublisher.addEventListener(EventDef.onSelectedStudentChanged, MODULE, onSelectedStudentChanged);
    EventPublisher.addEventListener(EventDef.onClassListChange, MODULE, onClassListChange);
    EventPublisher.addEventListener(EventDef.onTeacherListChange, MODULE, onTeacherListChange);
    EventPublisher.addEventListener(EventDef.onEnrollmentListChange, MODULE, onEnrollmentListChange);

    const fetchData = () => {
      const class_control = new ClassesCtrl(window.APIURL);
      class_control.getClasses(null, RegisterCtrl.year, RegisterCtrl.term);
      const teacher_control = new TeachersCtrl(window.APIURL);
      teacher_control.getTeachers();
      const enrollment_control = new EnrollmentCtrl(window.APIURL);
      enrollment_control.getEnrollment(RegisterCtrl.year, RegisterCtrl.term);
    };

    fetchData(); // Initial call

    const intervalId = setInterval(fetchData, 5000); // Call every 60 seconds

    return () => {
      clearInterval(intervalId); // Clear interval on cleanup
      EventPublisher.removeEventListener(EventDef.onSelectedStudentChanged, MODULE);
      EventPublisher.removeEventListener(EventDef.onClassListChange, MODULE);
      EventPublisher.removeEventListener(EventDef.onTeacherListChange, MODULE);
      EventPublisher.removeEventListener(EventDef.onEnrollmentListChange, MODULE);
    };

  }, []);

  const onEnrollmentListChange = (enrollments) => {
    RegisterCtrl.enrollments = enrollments;
  };
  
  const onClassListChange = (classes) => {
    RegisterCtrl.classes = classes;
};

const onTeacherListChange = (teachers) => {
    RegisterCtrl.teachers = teachers;
}


  const onSelectedStudentChanged = (student) => {
    Logger.debug('onSelectedStudentChanged student : ', student);
    setSelectedStudent(student);
  };


  const handleMoveNextFromStudenEdit = () => {
    setStage(1); // Move to the next stage
  };

  const handleMovePrevFromClassSelection = () => {
    setStage(0); // Move to the next stage
  };

  const handleMoveNextFromClassSelection = () => {
    setStage(2); // Move to the next stage
  };

  const handleMovePrevFromFinalCheck = () => {
    setStage(1);
  }

  const handleSubmit = () => {
    // show confirmation dialog
    Logger.debug('handleSubmit called');
    setShowConfirmation(true);
  }

  const submitEnrollment = () => {
    // TODO : submit request content
    // change enrollment status, draft -> confirmed
    if(RegisterCtrl.request !== null, RegisterCtrl.request.message != null, RegisterCtrl.request.message.length > 0){
      const reqControl = new RequestsCtrl(window.APIURL);
      reqControl.addNewRequest(RegisterCtrl.request, RegisterCtrl.selected_student.parent_name);
    }

   // find out enrollment ids by student id
    const enrollments = RegisterCtrl.enrollments.filter(e => e.student_id === RegisterCtrl.selected_student.id);
    Logger.debug('Enrollments for student:', enrollments);

    const enrollment_control = new EnrollmentCtrl(window.APIURL);
    enrollments.forEach(e => {
      e.status = 'enrolled';
      Logger.debug('update enrollment status', e);
      enrollment_control.updateEnrollment(e.id, e);
    });

  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: isMobile ? 2 : 4, // Add padding for mobile
      }}
    >
      <Accordion
        disabled={stage !== 0}
        expanded={stage === 0}
        sx={{ width: '100%', marginBottom: isMobile ? 1 : 2 }} // Adjust spacing for mobile
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography component="span" fontSize={isMobile ? '0.9rem' : '1rem'}> {/* Adjust font size */}
            {Resource.get('register.basic_info')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ width: '92%' }}>
          <EditStudent
            onPrev={() => EventPublisher.publish(EventDef.onMenuChanged, 'SelectStudent')} // Close dialog
            onNext={handleMoveNextFromStudenEdit} // Close dialog
            student={selectedStudent} // Pass selected student data
            sx={{ width: '100%' }}
          />
        </AccordionDetails>
      </Accordion>
      <Accordion
        disabled={stage !== 1}
        expanded={stage === 1}
        sx={{ width: '100%', marginBottom: isMobile ? 1 : 2 }} // Adjust spacing for mobile
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography component="span" fontSize={isMobile ? '0.9rem' : '1rem'}> {/* Adjust font size */}
            {Resource.get('register.select_class')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SelectClasses
            onPrev={handleMovePrevFromClassSelection} // Close dialog
            onNext={handleMoveNextFromClassSelection} // Close dialog
          />
        </AccordionDetails>
      </Accordion>
      <Accordion
        disabled={stage !== 2}
        expanded={stage === 2}
        sx={{ width: '100%' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <Typography component="span" fontSize={isMobile ? '0.9rem' : '1rem'}> {/* Adjust font size */}
            {Resource.get('register.final_confirm')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Confirmation
            student={selectedStudent}
          ></Confirmation>
        </AccordionDetails>
        <AccordionActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleMovePrevFromFinalCheck}
            sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }} // Adjust font size
            startIcon={<ArrowBackIosNewIcon/>}
          >
            {Resource.get('register.prev_select_class')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }} // Adjust font size
            endIcon={<ArrowForwardIosIcon/>}
          >
            {Resource.get('register.submit')}
          </Button>
        </AccordionActions>
      </Accordion>
      {showConfirmation && (<AlertDialog
        YesOrNo={true} Open={true}
        onClose={() => setShowConfirmation(false)}
        Title={Resource.get('register.confirm_title')}
        Content={Resource.get('register.confirm_content')}
        onNo={() => {setShowConfirmation(false);}}
        onYes={() => {
          setShowConfirmation(false);
          submitEnrollment();
          RegisterCtrl.selected_student = null; // Clear selected student
          EventPublisher.publish(EventDef.onSelectedStudentChanged, null); // Notify that the selected student has changed
          EventPublisher.publish(EventDef.onMenuChanged, 'ResultDisplay'); // Go back to student selection
        }}/>)}
    </Box>
  );
}
