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
import Defines from '../Defines'
import RegisterCtrl from '../../control/RegisterCtrl';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SelectKoreanLevel from '../students/SelectKoreanLevel';
import Logger from '../../framework/logger/Logger';

export default function AddAdditionalStudent({ open, onClose, onAddStudent}) {
    const [formData, setFormData] = useState({
        name: '',
        birth_date: dayjs().format('YYYY-MM-DD'), // Default to today's date
        email: RegisterCtrl.parent_email,
        phone: '',
        parent_name: RegisterCtrl.parent_name,
        address: '',
        gender: '',
        church: '',
        korean_level: 0,
        religion: '',
        grade: 0,
        korean_level_confirmed: 0,
    });

    const [emailError, setEmailError] = useState(''); // State for email error
    const [showSelectKoreanLevel, setShowSelectKoreanLevel] = useState(false);

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
    const getKoreanLevelLabel = (level) => {
        const option = Defines.koreanLevelOptions.find(opt => opt.level === level);
        return option ? option.level + ". " + option.label : 'Unknown';
    };
    const handleSelectKoreanLevel = (level) => {
        setFormData({ ...formData, korean_level: level });
        setShowSelectKoreanLevel(false);
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
                        error={!formData.name}
                    />
                    <TextField
                        select
                        label={Resource.get('students.grade')}
                        name="grade"
                        value={formData.grade || ''}
                        onChange={handleChange}
                        fullWidth
                        error={!formData.grade}
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
                        error={!formData.gender}
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
                        error={!formData.religion}
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
                        onClick={() => setShowSelectKoreanLevel(true)}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        error={!formData.korean_level}
                    >
                        <MenuItem key={formData.korean_level} value={formData.korean_level}>
                            {getKoreanLevelLabel(formData.korean_level)}
                        </MenuItem>
                    </TextField>
                    <TextField
                        label={Resource.get('students.phone')}
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        fullWidth
                        error={!formData.phone}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" startIcon={<CancelIcon/>}>
                    {Resource.get('common.dialog.cancel')}
                </Button>
                <Button onClick={handleSubmit} color="secondary" startIcon={<ArrowUpwardIcon/>}>
                    {Resource.get('common.dialog.submit')}
                </Button>
            </DialogActions>
            <SelectKoreanLevel
                open={showSelectKoreanLevel}
                onClose={() => setShowSelectKoreanLevel(false)}
                onSelect={handleSelectKoreanLevel}
                currentLevel={formData.korean_level}
                hideUnknown={true}
            />
        </Dialog>
    );
}
