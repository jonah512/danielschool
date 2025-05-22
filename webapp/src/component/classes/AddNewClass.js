import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    Stack,
    MenuItem,
} from '@mui/material';
import Resource from '../../framework/resource/Resource';
import ClassesCtrl from '../../control/ClassesCtrl';
import TeachersCtrl from '../../control/TeachersCtrl';
import SessionManager from '../../control/SessionManager';
import Defines from '../Defines';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';

export default function AddNewClass({ open, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        year: 2025,
        term: 'spring',
        teacher_id: 0,
        min_grade: 1,
        max_grade: 5,
        max_students: 10,
        period: 1,
        mendatory: 'no',
        fee: 100.1
    });
    const [teachers, setTeachers] = useState([]);
    const MODULE = 'AddNewClass';

    useEffect(() => {

        const teacherControl = new TeachersCtrl(window.APIURL);
        EventPublisher.addEventListener(EventDef.onTeacherListChange, MODULE, onTeacherListChange);
        teacherControl.getTeachers('');

        return () => {
            EventPublisher.removeEventListener(EventDef.onTeacherListChange, MODULE);
        }
    }, [window.APIURL]);

    const onTeacherListChange = (event) => {
        console.log('onTeacherListChange', event);
        setTeachers(event); // Update teachers state
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        console.log(name, value);
    };

    const handleSubmit = () => {
        // Validate required fields
        if (!formData.name || !formData.year || !formData.term) {
            alert(Resource.get('classes.validation_error')); // Show validation error
            return;
        }
        // Trim whitespace from string fields
        formData.name = formData.name.trim();
        formData.description = formData.description.trim();

        // Convert numeric fields to numbers
        formData.year = Number(formData.year);
        formData.max_students = Number(formData.max_students);
        formData.period = Number(formData.period);
        // Check if the year is a valid number
        if (isNaN(formData.year) || formData.year < 2025 || formData.year > new Date().getFullYear()) {
            alert(Resource.get('classes.year_error')); // Show year error
            return;
        }

        console.log(formData);


        const control = new ClassesCtrl(window.APIURL);
        control.addClass(formData, SessionManager.getSearchWord('Classes')); // Call addClass to save the new class
        onClose(); // Close the dialog
    };

    const years = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => 2025 + i);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{Resource.get('classes.title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <div style={{ marginBottom: '10px' }}></div>
                    <TextField
                        label={Resource.get('classes.name')}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label={Resource.get('classes.description')}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        select
                        label={Resource.get('classes.year')}
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        fullWidth
                        SelectProps={{
                            native: true,
                          }}
                        variant="outlined"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={Resource.get('classes.term')}
                        name="term"
                        value={formData.term}
                        onChange={handleChange}
                        fullWidth
                    >
                        {["spring", "fall"].map((term) => (
                            <MenuItem key={term} value={term}>
                                {term}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={Resource.get('classes.teacher')}
                        name="teacher_id"
                        value={formData.teacher_id}
                        onChange={handleChange}
                        fullWidth
                    >
                        {teachers.map(teacher => (
                            <MenuItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={Resource.get('classes.min_grade')}
                        name="min_grade"
                        value={formData.min_grade}
                        onChange={handleChange}
                        fullWidth
                    >
                        {Defines.gradeOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={Resource.get('classes.max_grade')}
                        name="max_grade"
                        value={formData.max_grade}
                        onChange={handleChange}
                        fullWidth
                    >
                        {Defines.gradeOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label={Resource.get('classes.max_students')}
                        name="max_students"
                        value={formData.max_students}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label={Resource.get('classes.period')}
                        name="period"
                        value={formData.period}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        select
                        label={Resource.get('classes.mendatory')}
                        name="mendatory"
                        value={formData.mendatory}
                        onChange={handleChange}
                        fullWidth
                    >
                        {["yes", "no"].map((term) => (
                            <MenuItem key={term} value={term}>
                                {term}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label={Resource.get('classes.fee')}
                        name="fee"
                        value={formData.fee}
                        onChange={handleChange}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    {Resource.get('common.dialog.cancel')}
                </Button>
                <Button onClick={handleSubmit} color="secondary">
                    {Resource.get('common.dialog.submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
