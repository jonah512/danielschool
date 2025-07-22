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
    TextareaAutosize,
    Box,
} from '@mui/material';
import Resource from '../../framework/resource/Resource';
import ConsentsCtrl from '../../control/ConsentsCtrl';
import Logger from '../../framework/logger/Logger';

export default function EditConsent({ open, onClose, consent }) {
    const [formData, setFormData] = useState({ 
        ...consent 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        const control = new ConsentsCtrl(window.APIURL);
        control.updateConsent(formData.id, formData); // Update consent details
        onClose(); // Close the dialog
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" spacing={2}>
            <DialogTitle>{Resource.get('consents.edit_title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <div style={{ marginBottom: '10px' }}></div>
                    <TextField
                        label={Resource.get('consents.title')}
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    >
                    </TextField>
                    <Box>
                        <label>{Resource.get('consents.content')}</label>
                        <TextareaAutosize
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            minRows={10}
                            variant="outlined"
                            style={{ width: '100%', overflow: 'auto' }}
                        />
                    </Box>
                    <Box>
                        <label>{Resource.get('consents.content_eng')}</label>
                        <TextareaAutosize
                            name="content_eng"
                            value={formData.content_eng}
                            onChange={handleChange}
                            minRows={10}
                            variant="outlined"
                            style={{ width: '100%', overflow: 'auto' }}
                        />
                    </Box>
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
