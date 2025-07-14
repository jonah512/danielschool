import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Stack,
    MenuItem,
} from '@mui/material';
import Resource from '../../framework/resource/Resource';
import dayjs from 'dayjs';
import SessionManager from '../../control/SessionManager';
import Defines from '../Defines';
import RegisterCtrl from '../../control/RegisterCtrl';

export default function EditStudent({onPrev, onNext, student }) {
    const [formData, setFormData] = useState({
        ...student,
        id: student?.id || '',
        name: student?.name || '',
        birth_date: student?.birth_date ? dayjs(student.birth_date).format('YYYY-MM-DD') : '',
        gender: student?.gender || '',
        church: student?.church || '',
        korean_level: student?.korean_level || 1,
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
        RegisterCtrl.updateStudent(formData.id, formData); // Update student details
        onNext();
    };

    return (
        <Box 
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} 
            id='EditStudent' 
            spacing={4}
        >
            <Stack spacing={2} alignItems={'center'} justifyContent={'center'}> {/* Center alignment */}
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
                {/*  do not show korean level to user
                <TextField
                    select
                    label={Resource.get('students.korean_level')}
                    name="korean_level"
                    value={formData.korean_level}
                    onChange={handleChange}
                    fullWidth
                >
                    {Defines.koreanLevelOptions.map((option) => (
                        <MenuItem key={option.label} value={option.level}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField> */}
                <Stack spacing={2} direction="row" justifyContent="center" style={{ marginTop: '20px' }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={onPrev}
                        fullWidth
                    >Prev(학생선택 단계로 이동)</Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSubmit}
                        fullWidth
                    >Next (과목선택 단계로로 이동)</Button>
                </Stack>
            </Stack>
        </Box>
    );
}
