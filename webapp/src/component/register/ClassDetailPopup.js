import React from 'react';
import RegisterCtrl from '../../control/RegisterCtrl';
import Resource from '../../framework/resource/Resource';
import { Box, Stack } from '@mui/material';

export default function ClassDetailPopup({ classItem }) {
    const getTeacherName = (classItem) => {
        if (!classItem || !classItem.teacher_id) return 'N/A';
        const teacher = RegisterCtrl.teachers.find(t => t.id === classItem.teacher_id);
        return teacher ? teacher.name : 'N/A';
    };

    return (
        <Box
            sx={{
                position: 'absolute',
                backgroundColor: '#FFF9C4', // Pastel yellow
                border: '1px solid #ccc',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                padding: '16px',
                zIndex: 1000,
                width: '300px',
            }}
        >
            <Stack direction="column">
                <Box>
                    {Resource.get('register.detail_title',classItem.name)}
                </Box>
                <Box>

                    {Resource.get('register.detail_grade', classItem.min_grade,classItem.max_grade)}
                </Box>                
                {
                    classItem.min_korean_level > 1 || classItem.max_korean_level < 12 ? (
                        <Box>
                            {Resource.get('register.detail_korean_level', classItem.min_korean_level)}
                        </Box>
                    ) : null
                }
                <Box>
                    {Resource.get('register.detail_description')} {classItem.description}
                </Box>
            </Stack>
        </Box>
    );
}

