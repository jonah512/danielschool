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
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box } from '@mui/material';
import UserMenu from '../user_menu/UserMenu';

export default function EnrollmentRegister() {

  const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.selected_student);
  const [stage, setStage] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const MODULE = 'EnrollmentRegister';

  useEffect(() => {
    EventPublisher.addEventListener(EventDef.onSelectedStudentChanged, MODULE, onSelectedStudentChanged);
    return () => {
      EventPublisher.removeEventListener(EventDef.onSelectedStudentChanged, MODULE);
    };

  }, []);

  const onSelectedStudentChanged = (student) => {
    console.log('onSelectedStudentChanged student : ', student);
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
    console.log('handleSubmit called');
    setShowConfirmation(true);
  }

  return (
    <div>

      <Accordion disabled={stage !== 0} expanded={stage === 0}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"

        >
          <Typography component="span">기본정보확인</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <EditStudent
            onPrev={() => EventPublisher.publish(EventDef.onMenuChanged, 'SelectStudent')} // Close dialog
            onNext={handleMoveNextFromStudenEdit} // Close dialog
            student={selectedStudent} // Pass selected student data
          />
        </AccordionDetails>

      </Accordion>
      <Accordion disabled={stage !== 1} expanded={stage === 1}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography component="span">과목선택</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SelectClasses
            onPrev={handleMovePrevFromClassSelection} // Close dialog
            onNext={handleMoveNextFromClassSelection} // Close dialog
          />
        </AccordionDetails>
      </Accordion>
      <Accordion disabled={stage !== 2} expanded={stage === 2}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <Typography component="span">최종확인</Typography>
        </AccordionSummary>
        <AccordionDetails>

          <Confirmation
            student={selectedStudent}
            ></Confirmation>
        </AccordionDetails>
        <AccordionActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleMovePrevFromFinalCheck}>Prev(과목선택 단계로 이동)</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
            >Submit(제출하기)</Button>
        </AccordionActions>
      </Accordion>
      {showConfirmation && (<AlertDialog
        YesOrNo={true} Open={true}
        onClose={() => setShowConfirmation(false)}
        Title="등록 확인"
        Content="등록을 완료하시겠습니까?"
        onNo={() => setShowConfirmation(false)}
        onYes={() => {
          setShowConfirmation(false);
          RegisterCtrl.selected_student = null; // Clear selected student
          EventPublisher.publish(EventDef.onSelectedStudentChanged, null); // Notify that the selected student has changed
          EventPublisher.publish(EventDef.onMenuChanged, 'SelectStudent'); // Go back to student selection
        }}/>)}
    </div>
  );
}
