import React, { useState, useEffect } from 'react';
import { Stack, Typography, Tooltip, CircularProgress, Dialog, DialogContent } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Defines from '../Defines';
import ClassesCtrl from '../../control/ClassesCtrl';
import TeachersCtrl from '../../control/TeachersCtrl';
import Logger from '../../framework/logger/Logger';
import Resource from '../../framework/resource/Resource';

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

        EventPublisher.addEventListener(EventDef.onWaitingPosition, MODULE, onWaitingPositionChange);

        return () => {

            EventPublisher.removeEventListener(EventDef.onWaitingPosition, MODULE);
        };
    }, []);

    const onWaitingPositionChange = (position) => {
        Logger.debug('onWaitingPositionChange position:', position);
        setWaitingPosition(position);
        
        if( position <= Defines.MAX_WAITING_POSITION) {
            setShowPopup(false);
            EventPublisher.publish(EventDef.onMenuChanged, "EnrollmentRegister");
        } else {
            setShowPopup(true); // Show popup when position exceeds max waiting position
        }
    };


    return (
        <Stack
            direction="column"
            spacing={1}
        >
            <Dialog open={showPopup} onClose={() => setShowPopup(true)}>
                <DialogContent sx={{ textAlign: 'center', padding: '20px' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ marginTop: '10px' }}>
                        {Resource.get('waiting.message', waitingPosition - Defines.MAX_WAITING_POSITION)}
                    </Typography>
                </DialogContent>
            </Dialog>
        </Stack>
    );
}
