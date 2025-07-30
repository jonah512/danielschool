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
} from '@mui/material';
import Resource from '../../framework/resource/Resource';
import StudentsCtrl from '../../control/StudentsCtrl';
import dayjs from 'dayjs';
import SessionManager from '../../control/SessionManager';
import Defines from '../Defines';
import Logger from '../../framework/logger/Logger';

export default function EditStudent({ open, onClose, student }) {
    const [formData, setFormData] = useState({
        ...student,
        id: student?.id || '',
        name: student?.name || '',
        birth_date: student?.birth_date ? dayjs(student.birth_date).format('YYYY-MM-DD') : '',
        gender: student?.gender || '',
        church: student?.church || '',
        korean_level: student?.korean_level || 0,
        korean_level_confirmed: student?.korean_level_confirmed || 0,
        created_at: student?.created_at || '',
        updated_at: student?.updated_at || '',
        religion: Defines.religion.find((religion) => religion.label === student.religion)?.value || student.religion,
        grade: Defines.gradeOptions.find((grade) => grade.label === student.grade)?.value || student.grade,
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
        const control = new StudentsCtrl(window.APIURL);
        control.updateStudent(formData.id, formData, SessionManager.getSearchWord('Students')); // Update student details
        onClose(); // Close the dialog
    };

    Logger.debug(formData, student);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" spacing={2}>
            <DialogTitle>{Resource.get('students.edit_title')}</DialogTitle>
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
                        value={formData.grade}
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
                            {option.level}. {option.label}
                        </MenuItem>
                    ))}
                    </TextField>
                    <TextField
                        select
                        label={Resource.get('students.korean_level_confirmed')}
                        name="korean_level_confirmed"
                        value={formData.korean_level_confirmed}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem key={1} value={1}>
                            YES
                        </MenuItem>
                        <MenuItem key={0} value={0}>
                            NO
                        </MenuItem>
                    </TextField>
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
