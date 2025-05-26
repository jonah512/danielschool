import React, { useState, useEffect } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Defines from '../Defines';

function Topbar() {

    const MODULE = 'Topbar';
    const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.selected_student);

    useEffect(() => {
        EventPublisher.addEventListener(EventDef.onSelectedStudentChanged, MODULE, onSelectedStudentChanged);
        return () => {
            EventPublisher.removeEventListener(EventDef.onSelectedStudentChanged, MODULE);
        };

    }, []);

    const onSelectedStudentChanged = (student) => {
        console.log('onSelectedStudentChanged student : ' + student);
        setSelectedStudent(student);
    };

    return (
        <Stack
            direction="row"
            spacing={2}
            sx={{
                backgroundColor: '#f4f4f4',
                padding: '10px 20px',
                borderBottom: '2px solid #ccc',
                height: '150px', // Full viewport height
                alignItems: 'center', // Center horizontally
                justifyContent: 'center' // Center vertically
            }}
        >
            <img src="daniel_logo.png" width='70' alt='Daniel School Register Web'></img>

            <Typography variant="h4" sx={{ color: '#333', textAlign: 'center' }}>
                2025년 가을학기 수강신청
            </Typography>
            {selectedStudent && (
                <Box>
                    <Typography variant="body1" sx={{ fontSize: '18px', color: '#555', textAlign: 'center' }}>
                        이름: <strong>{selectedStudent.name}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '18px', color: '#555', textAlign: 'center' }}>
                        학년: <strong>{Defines.gradeOptions.find(option => option.value === selectedStudent.grade).label}</strong>
                    </Typography>
                </Box>
            )}
        </Stack>
    );
}

export default Topbar;