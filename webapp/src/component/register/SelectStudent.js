import React, { useState, useEffect } from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Stack, Box, Button } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl'; // Import the RegisterCtrl
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';

function SelectStudent() {
    const [students, setStudents] = useState(RegisterCtrl.students); // List of students
    const [selectedStudent, setSelectedStudent] = useState(RegisterCtrl.students[0].id);

    useEffect(() => {
        console.log('SelectStudent students:', students);
        RegisterCtrl.selected_student =- students[0]; // Set the first student as selected by default
    }, []);

    const handleNext = () => {
        const selected = students.find(student => String(student.id) === String(selectedStudent));
        RegisterCtrl.selected_student = selected;
        console.log('Selected student:', RegisterCtrl.selected_student, students, selectedStudent);
        // Handle the next button click, if needed
        EventPublisher.publish(EventDef.onSelectedStudentChanged, RegisterCtrl.selected_student);
        EventPublisher.publish(EventDef.onMenuChanged, "EnrollmentRegister");
    }

    return (
        <Stack 
            spacing={2} 
            alignItems="center" 
            justifyContent="center" 

        >
            <Box component="h2" textAlign="center">수강생 선택</Box>

            <FormControl>
                <FormLabel id="select-student-label"></FormLabel>
                <RadioGroup
                    aria-labelledby="select-student-label"
                    name="selectedStudent"
                    onChange={(event) => {
                        console.log('Selected student ID:', event.target.value);
                        const id = event.target.value;
                        setSelectedStudent(id);
                    }}
                    value={selectedStudent}
                >
                    {students.map((student) => (
                        <FormControlLabel
                            key={student.id}
                            value={student.id}
                            control={<Radio />}
                            label={student.name}
                        />
                    ))}
                </RadioGroup>
            </FormControl>
            <Button variant="contained" onClick={handleNext}>다음</Button>
        </Stack>
    );
}

export default SelectStudent;