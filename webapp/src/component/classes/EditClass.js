import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    Stack,
    MenuItem
} from '@mui/material';
import Resource from '../../framework/resource/Resource';
import ClassesCtrl from '../../control/ClassesCtrl';
import TeachersCtrl from '../../control/TeachersCtrl';
import dayjs from 'dayjs';
import SessionManager from '../../control/SessionManager';
import Defines from '../Defines';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';

export default function EditClass({ open, onClose, class_ }) {
    const [formData, setFormData] = useState({
        name: class_.name || '',
        description: class_.description || '',
        year: class_.year || 0,
        term: class_.term || 0,
        class__id: class_.class__id ||0,
        min_grade: class_.min_grade || 0,
        max_grade: class_.max_grade || 0,
        max_students: class_.max_students || 0,
        period: class_.period || 0,
        mendatory: class_.mendatory || false,
        fee: class_.fee || 0,
        teacher_id: class_.teacher_id || 0,
        id: class_.id || 0,
    });

    const [emailError, setEmailError] = useState(''); // State for email error
    const [teachers, setTeachers] = useState([]);
    const MODULE = 'EditClass';

    useEffect(() => {
        console.log('EditClass useEffect', class_);
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
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setEmailError('Invalid email format');
            } else {
                setEmailError('');
            }
        }
    };

    const handleSubmit = () => {
        // Validate required fields
        if (!formData.name || !formData.year || !formData.term) {
            alert(Resource.get('classes.validation_error')); // Show validation error
            return;
        }
        const control = new ClassesCtrl(window.APIURL);
        control.updateClass(formData.id, formData); // Update class details
        onClose(); // Close the dialog
    };
    const years = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => 2025 + i);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" spacing={2}>
            <DialogTitle>{Resource.get('classes.edit_title')}</DialogTitle>
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
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                    </TextField>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    {Resource.get('common.dialog.cancel')}
                </Button>
                <Button onClick={handleSubmit} color="secondary">
                    {Resource.get('common.dialog.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
