import React, { useState } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    Stack,
    MenuItem,
    Box,
} from '@mui/material';
import Resource from '../../framework/resource/Resource';
import StudentsCtrl from '../../control/StudentsCtrl';
import dayjs from 'dayjs';
import SessionManager from '../../control/SessionManager';
import Defines from '../Defines'
import Typography from '@mui/material/Typography';

export default function AddNewStudent({ open, onClose, onAddStudent }) {
    const [formData, setFormData] = useState({
        name: '',
        birth_date: dayjs().format('YYYY-MM-DD'), // Default to today's date
        email: '',
        phone: '',
        parent_name: '',
        address: '',
        gender: '',
        church: '',
        korean_level: 1,
        religion: 'no',
        grade: 1
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

    const handleSubmit = async () => {
        const control = new StudentsCtrl(window.APIURL);
        formData.name = formData.name.trim();
        formData.email = formData.email.trim();
        formData.phone = formData.phone.trim();
        formData.parent_name = formData.parent_name.trim();
        formData.church = formData.church.trim();

        // check if anything missing
        const requiredFields = ['name', 'email', 'phone', 'parent_name', 'gender', 'grade'];
        for (const field of requiredFields) {
            if (!formData[field]) {
                const msg = Resource.get(`students.${field}`);
                alert(Resource.get('students.missing', msg));
            return;
            }
        }

        await control.addNewStudentSync(formData, SessionManager.getSearchWord('Students')); // Call addNewStudent to save the new student

        onAddStudent(formData); // Close the dialog
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{Resource.get('students.title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <div style={{ marginBottom: '10px' }}></div>
                    <TextField
                        label={Resource.get('students.name')}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        select
                        label={Resource.get('students.grade')}
                        name="grade"
                        value={formData.grade || ''}
                        onChange={handleChange}
                        fullWidth
                    >
                        {Defines.gradeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label={Resource.get('students.birthdate')}
                        name="birth_date"
                        type="date"
                        value={formData.birth_date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                    <TextField
                        label={Resource.get('students.email')}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        error={!!emailError}
                        helperText={emailError}
                    />
                    <TextField
                        label={Resource.get('students.phone')}
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label={Resource.get('students.parent_name')}
                        name="parent_name"
                        value={formData.parent_name}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        select
                        label={Resource.get('students.gender')}
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        fullWidth
                    >
                        {["Male", "Female"].map((gender) => (
                            <MenuItem key={gender} value={gender}>
                                {gender}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={Resource.get('students.religion')}
                        name="religion"
                        value={formData.religion}
                        onChange={handleChange}
                        fullWidth
                    >
                        {["protestant", "catholic", "other", "no"].map((option) => (
                            <MenuItem key={option} value={option}>
                                {Resource.get(`students.${option}`)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label={Resource.get('students.church')}
                        name="church"
                        value={formData.church}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        select
                        label={Resource.get('students.korean_level')}
                        name="korean_level"
                        value={formData.korean_level}
                        onChange={handleChange}
                        fullWidth
                    >
                    {Defines.koreanLevelOptions.map((option) => (
                        <MenuItem key={option.level} value={option.level}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography>{option.level}. {option.label}</Typography>
                            {option.example !== '' &&<Typography> [예: {option.example}]</Typography>}
                            </Box>
                        </MenuItem>
                    ))}
                    </TextField>
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
