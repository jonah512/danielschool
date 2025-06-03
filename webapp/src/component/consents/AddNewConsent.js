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


export default function AddNewConsent({ open, onClose }) {
    const [formData, setFormData] = useState({
        title: '', 
        content: '',
        content_eng: ''
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        const control = new ConsentsCtrl(window.APIURL);

        control.addNewConsent(formData); // Call addNewConsent to save the new consent
        onClose(); // Close the dialog
    };
    const years = Array.from({ length: 2050 - 2025 + 1 }, (_, i) => 2025 + i);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{Resource.get('consents.title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <div style={{ marginBottom: '10px' }}></div>
                    <TextField
                        label={Resource.get('consents.name')}
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                    />
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
                    {Resource.get('common.dialog.submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
