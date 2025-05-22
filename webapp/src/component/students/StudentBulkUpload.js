import * as React from 'react';
import { useState } from 'react';
import { Stack, Button, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Resource from '../../framework/resource/Resource';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import axios from 'axios';

export default function StudentBulkUpload() {
    const fileInputRef = React.useRef(null);

    const handleFileChange = async (event) => {
        const formData = new FormData();
        formData.append('file', event.target.files[0]);

        try {
            const response = await axios.post(window.APIURL + '/students/upload_csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const successMessage = `Upload successful: ${response.data.message}`;
            alert(successMessage); // Show alert for success
            if (fileInputRef.current) fileInputRef.current.value = null; // Clear the file input
        } catch (error) {
            const errorMessage = `Upload failed: ${error.response?.data?.message || error.message}`;
            alert(errorMessage); // Show alert for failure
            if (fileInputRef.current) fileInputRef.current.value = null; // Clear the file input
        }
    };

    return (
        <Stack spacing={2}>

            <form width='200'>
                <input
                    accept=".csv"
                    style={{ display: 'none' }}
                    id="fileInput"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <label htmlFor="fileInput">
                    <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        startIcon={<FileUploadIcon />}

                    >
                        {Resource.get('students.bulk_upload')}
                    </Button>
                </label>
            </form>
        </Stack>
    );
}
