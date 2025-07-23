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
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import Resource from '../../framework/resource/Resource';
import RequestsCtrl from '../../control/RequestsCtrl';
import SessionManager from '../../control/SessionManager';
import Logger from '../../framework/logger/Logger';
import dayjs from 'dayjs';

export default function EditRequest({ open, onClose, request }) {
    const [formData, setFormData] = useState({ 
        ...request 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleStatusChange = (e) => {
        setFormData({ ...formData, status: e.target.value });
    };

    const handleSubmit = () => {
        const control = new RequestsCtrl(window.APIURL);
        control.updateRequest(formData.id, formData, SessionManager.getSearchWord('Requests'), SessionManager.getSearchWord('Requests')); // Update request details
        onClose(); // Close the dialog
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" spacing={2}>
            <DialogTitle>{Resource.get('requests.edit_title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <div style={{ marginBottom: '10px' }}></div>
                    <TextField
                        label={Resource.get('requests.name')}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        label={Resource.get('requests.students')}
                        name="students"
                        value={formData.students}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        label={Resource.get('requests.email')}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        label={Resource.get('requests.phone')}
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        label={Resource.get('requests.request_time')}
                        name="request_time"
                        value={dayjs(formData.request_time).format('YYYY-MM-DD HH:mm:ss')}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        label={Resource.get('requests.message')}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        multiline
                    />
                    <TextField
                        label={Resource.get('requests.memo')}
                        name="memo"
                        value={formData.memo}
                        onChange={handleChange}
                        fullWidth                        
                        multiline
                    />
                    <FormControl fullWidth>
                        <InputLabel>{Resource.get('requests.status')}</InputLabel>
                        <Select
                            name="status"
                            value={formData.status || "REQUESTED"}
                            onChange={handleStatusChange}
                            sx={{ backgroundColor: '#FFFFE0' }} // Set background color to light yellow
                        >
                            <MenuItem value="COMPLETE">{Resource.get('requests.status_complete')}</MenuItem>
                            <MenuItem value="PENDING">{Resource.get('requests.status_pending')}</MenuItem>
                            <MenuItem value="REQUESTED">{Resource.get('requests.status_requested')}</MenuItem>
                        </Select>
                    </FormControl>
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
