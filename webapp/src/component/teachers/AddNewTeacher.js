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

export default function AddNewTeacher({ open, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        email: '',
        phone: '',
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
        // Trim whitespace from string fields
        formData.name = formData.name.trim();
        formData.subject = formData.subject.trim();
        formData.email = formData.email.trim();
        formData.phone = formData.phone.trim();
        // Check if the email is valid
        if (emailError) {
            alert(emailError); // Show email error
            return;
        }
        control.addNewTeacher(formData, SessionManager.getSearchWord('Teachers')); // Call addNewTeacher to save the new teacher
        onClose(); // Close the dialog
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{Resource.get('teachers.title')}</DialogTitle>
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
                    {Resource.get('common.dialog.submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
