import React, { useState, useEffect } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Defines from '../Defines';
import UserMenu from '../user_menu/UserMenu';
import Resource from '../../framework/resource/Resource';

function Topbar({year, term}) {

    const MODULE = 'Topbar';
    const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.selected_student);

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

    return (
        <Stack
            direction="row"
            spacing={4}
            sx={{
                backgroundColor: '#f4f4f4',
                padding: '10px 20px',
                borderBottom: '2px solid #ccc',
                height: '150px', // Full viewport height
                alignItems: 'center', // Center horizontally
                justifyContent: 'space-between', // Spread items across full width
                width: '100%' // Use full width
            }}
        >
            <img src="daniel_logo.png" width='70' alt='Daniel School Register Web'></img>

            <Typography variant="h4" sx={{ color: '#333', textAlign: 'center', flexGrow: 1 }}>
                {Resource.get("topbar.title", year, Resource.get('topbar.' + term))}
            </Typography>
            {selectedStudent && (
                <Box>
                    <Typography variant="body1" sx={{ fontSize: '18px', color: '#555', textAlign: 'center' }}>
                        {Resource.get('topbar.name')} <strong>{selectedStudent.name}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '18px', color: '#555', textAlign: 'center' }}>
                        {Resource.get('topbar.grade')} <strong>{Defines.gradeOptions.find(option => option.value === selectedStudent.grade)?.label}</strong>
                    </Typography>
                </Box>
            )}
            {selectedStudent && (<UserMenu />)}

        </Stack>
    );
}

export default Topbar;