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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SelectKoreanLevel from '../students/SelectKoreanLevel';
import Logger from '../../framework/logger/Logger';
import GradeConfirm from './GradeConfirm';

export default function EditStudent({ onPrev, onNext, student }) {
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
        grade: student?.grade || 0,
    });

    const [emailError, setEmailError] = useState(''); // State for email error
    const [showSelectKoreanLevel, setShowSelectKoreanLevel] = useState(false);
    const [showKoreanLevel, setShowKoreanLevel] = useState(student.korean_level === 0 || student.korean_level_confirmed == 0);
    const [gradeConfirmed, setGradeConfirmed] = useState(false);
    const [trySubmit, setTrySubmit] = useState(false);

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

        if (name === 'grade') {
            setGradeConfirmed(true);
        }
    };

    const handleSubmit = () => {
        if (!formData.grade) {
            alert(Resource.get('students.grade_missing'));
            return;
        }

        if (formData.korean_level === 0) {
            alert(Resource.get('students.korean_level_missing'));
            return;
        }

        if (formData.gender === '') {
            alert(Resource.get('students.gender_missing'));
            return;
        }

        if (formData.parent_name.trim() === '') {
            alert(Resource.get('students.parent_name_missing'));
            return;
        }

        Object.assign(RegisterCtrl.selected_student, {
            korean_level: formData.korean_level,
            grade: formData.grade,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            parent_name: formData.parent_name.trim(),
            church: formData.church.trim(),
        });

        Logger.debug('formData', formData);

        // if birth data is 2000-01-01 return here
        if (formData.birth_date.indexOf('2000-01-01') === 0) {
            alert(Resource.get('students.birthdate_missing'));
            return;
        }

        RegisterCtrl.updateStudent(formData.id, formData); // Update student details
        onNext();
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
        <Box
            sx={{  flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}
            id='EditStudent'
            spacing={4}
            fullWidth
        >
            <Stack spacing={2} alignItems={'center'} justifyContent={'center'}> {/* Center alignment */}
                <div style={{ marginBottom: '10px' }}></div>
                <TextField
                    label={Resource.get('students.name')}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    mandatory={true}
                />
                <TextField
                    select
                    label={Resource.get('students.grade')}
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    fullWidth
                    error={!gradeConfirmed}
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
                    error={formData.birth_date === '2000-01-01'}
                />
                <TextField
                    select
                    label={Resource.get('students.gender')}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    fullWidth
                    error={formData.gender===''}
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
                    disabled={!showKoreanLevel}
                    value={formData.korean_level}
                    onChange={handleChange}
                    onClick={() => showKoreanLevel?setShowSelectKoreanLevel(true):null}
                    fullWidth
                    InputProps={{ readOnly: true }}
                >
                    <MenuItem key={formData.korean_level} value={formData.korean_level}>
                        {getKoreanLevelLabel(formData.korean_level)}
                    </MenuItem>
                </TextField>
                <TextField
                    label={Resource.get('students.email_recommand')}
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
                    error={formData.parent_name.trim() === ''}
                />

                <Stack spacing={2} direction="row" justifyContent="center" style={{ marginTop: '20px' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onPrev}
                        fullWidth
                        startIcon={<ArrowBackIosNewIcon />}
                    >{Resource.get('register.prev_select_student')}</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            gradeConfirmed ? handleSubmit() : setTrySubmit(true);
                        }}
                        fullWidth
                        endIcon={<ArrowForwardIosIcon />}
                        disabled={formData.grade === 0}
                    >{Resource.get('register.next_select_class')}</Button>
                </Stack>
            </Stack>
            {trySubmit && !gradeConfirmed &&
                <GradeConfirm 
                    student = {student}
                    funcConfirm={() => {
                        setGradeConfirmed(true);
                        handleSubmit();
                    }}  
                    funcCancel={() => {
                        setTrySubmit(false);
                        setGradeConfirmed(true);
                    }}
                />
            }
            <SelectKoreanLevel
                open={showSelectKoreanLevel}
                onClose={() => setShowSelectKoreanLevel(false)}
                onSelect={handleSelectKoreanLevel}
                currentLevel={formData.korean_level}
                hideUnknown={true}
            />
        </Box>
    );
}
