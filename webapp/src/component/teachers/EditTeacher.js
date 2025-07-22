import React, { useState } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    Stack,
} from '@mui/material';
import Resource from '../../framework/resource/Resource';
import TeachersCtrl from '../../control/TeachersCtrl';
import SessionManager from '../../control/SessionManager';
import Logger from '../../framework/logger/Logger';

export default function EditTeacher({ open, onClose, teacher }) {
    const [formData, setFormData] = useState({ 
        ...teacher 
    });

    const [emailError, setEmailError] = useState(''); // State for email error

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

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
        const control = new TeachersCtrl(window.APIURL);
        control.updateTeacher(formData.id, formData, SessionManager.getSearchWord('Teachers'), SessionManager.getSearchWord('Teachers')); // Update teacher details
        onClose(); // Close the dialog
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" spacing={2}>
            <DialogTitle>{Resource.get('teachers.edit_title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <div style={{ marginBottom: '10px' }}></div>
                    <TextField
                        label={Resource.get('teachers.name')}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label={Resource.get('teachers.subject')}
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label={Resource.get('teachers.email')}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        error={!!emailError}
                        helperText={emailError}
                    />
                    <TextField
                        label={Resource.get('teachers.phone')}
                        name="phone"
                        value={formData.phone}
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
                    {Resource.get('common.dialog.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
