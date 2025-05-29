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
import SchedulesCtrl from '../../control/SchedulesCtrl';
import dayjs from 'dayjs';


export default function AddNewSchedule({ open, onClose }) {
    const [formData, setFormData] = useState({
        year: dayjs().year(), // Default to current year
        term: 'spring', // Default term
        opening_time: dayjs().format('YYYY-MM-DD HH:mm:ss'), // Default to today's date
        closing_time: dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss'), // Default to one year later
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        const control = new SchedulesCtrl(window.APIURL);

        control.addNewSchedule(formData); // Call addNewSchedule to save the new schedule
        onClose(); // Close the dialog
    };
    const years = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => 2025 + i);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{Resource.get('schedules.title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <div style={{ marginBottom: '10px' }}></div>
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
                        label={Resource.get('schedule.opening_time')}
                        name="opening_time"
                        type="datetime-local"
                        value={formData.opening_time}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                    <TextField
                        label={Resource.get('schedule.closing_time')}
                        name="closing_time"
                        type="datetime-local"
                        value={formData.closing_time}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
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
