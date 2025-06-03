// Copyright (c) 2025 Milal Daniel Korean School.
import dayjs from 'dayjs';
import * as React from 'react';
import Box from '@mui/material/Box';
import { Stack, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import AlertDialog from '../common/AlertDialog';
import ConsentsCtrl from '../../control/ConsentsCtrl';
import Resource from '../../framework/resource/Resource';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';
import { DataGrid } from '@mui/x-data-grid';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddNewConsent from './AddNewConsent'; // Import the new component
import EditConsent from './EditConsent'; // Import the EditConsent component
import SessionManager from '../../control/SessionManager';
import AddCircleIcon from '@mui/icons-material/AddCircle';

export default function ConsentsTable() {
    const [userList, setUserList] = useState([]); // State for user list
    const [selectionConsent, setSelectionConsent] = React.useState([]);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [enableDeleteButton, setEnableDeleteButton] = React.useState(false);
    const [deleteConfirm, setDeleteConfirm] = React.useState(false);
    const [openAddConsentDialog, setOpenAddConsentDialog] = React.useState(false); // State for dialog
    const [openEditConsentDialog, setOpenEditConsentDialog] = React.useState(false); // State for edit dialog
    const [selectedConsent, setSelectedConsent] = React.useState(null); // State for selected consent
    const MODULE = 'ConsentsTable';

    useEffect(() => {
        const control = new ConsentsCtrl(window.APIURL);
        EventPublisher.addEventListener(EventDef.onConsentListChange, MODULE, onConsentListChange);
        control.getConsents();
        return () => {
            EventPublisher.removeEventListener(EventDef.onConsentListChange, MODULE);
        }
    }, [ window.APIURL]);

    const onConsentListChange = (data) => {
        const filteredData = data.filter(item => item.id >= 0); // Exclude items with id less than 0
        console.log(filteredData);
        setUserList(filteredData); // Update user list state
    }
    const handleSelectionChange = (newSelection) => {
        setSelectionConsent(newSelection);
        setSelectedIds(newSelection);
        newSelection.length > 0 ?
            setEnableDeleteButton(true) :
            setEnableDeleteButton(false);
    };

    const handleOpenAddConsentDialog = () => {
        setOpenAddConsentDialog(true);
    };

    const handleCloseAddConsentDialog = () => {
        setOpenAddConsentDialog(false);
    };

    const handleRowDoubleClick = (params) => {
        setSelectedConsent(params.row); // Set the selected consent data
        setOpenEditConsentDialog(true); // Open the edit dialog
    };

    const handleCloseEditConsentDialog = () => {
        setOpenEditConsentDialog(false);
        setSelectedConsent(null); // Clear the selected consent data
    };

    const onConfirm = () => {
        setDeleteConfirm(false);
        const control = new ConsentsCtrl(window.APIURL);
        control.deleteConsents(selectedIds, SessionManager.getSearchWord('Consents')); // Call deleteConsents to remove selected items
        setEnableDeleteButton(false); // Disable delete button after deletion
        setSelectedIds([]); // Clear selected IDs
    }

    const onClosePopup = () => {
        setDeleteConfirm(false);
    }
    const deleteSelectedFiles = () => {
        if (selectedIds.length === 0) {
            return;
        }
        setDeleteConfirm(true);
    }

    const columns = [
        { field: 'id', headerName: Resource.get('consents.id'), width: 90 },
        { field: 'title', headerName: Resource.get('consents.name'), width: 150 },
        {
            field: 'content', headerName: Resource.get('consents.content'), width: 400,
            renderCell: (params) => {
                return params.value.length > 30 
                    ? `${params.value.substring(0, 30)}...` 
                    : params.value;
            }
        },
        {
            field: 'content_eng', headerName: Resource.get('consents.content_eng'), width: 400,
            renderCell: (params) => {
                return params.value.length > 30 
                    ? `${params.value.substring(0, 30)}...` 
                    : params.value;
            }
        }
    ];

    return (
        <div style={{ width: '100%' }}>
            <Stack spacing={2} style={{ width: '100%' }}>
                <DataGrid
                    rows={userList}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[10, 50]}
                    checkboxSelection
                    disableRowSelectionOnClick // Prevent row selection on click
                    rowSelectionModel={selectionConsent}
                    onRowSelectionModelChange={handleSelectionChange}
                    onRowDoubleClick={handleRowDoubleClick} // Handle double-click event
                    localeText={{
                        MuiTablePagination: {
                            labelRowsPerPage: Resource.get('common.rowsperpage'),
                        }
                    }}
                />
                <Stack direction='row' spacing={2}>
                    <Button
                        variant="contained"
                        color="red"
                        component="span"
                        disabled={!enableDeleteButton}
                        onClick={deleteSelectedFiles}
                        startIcon={<DeleteForeverIcon />}
                    >{Resource.get('common.delete')}</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        onClick={handleOpenAddConsentDialog} // Open dialog
                        startIcon={<AddCircleIcon />}
                    >
                        {Resource.get('consents.title')}
                    </Button>

                </Stack>
            </Stack>
            {deleteConfirm ?
                (<AlertDialog
                    onYes={onConfirm}
                    onNo={onClosePopup}
                    YesOrNo={true} Open={true}
                    Title={Resource.get('consents.deletetitle')}
                    Content={Resource.get('consents.deletecontent', selectedIds.length)} />) : ('')}
            {openAddConsentDialog && (
                <AddNewConsent
                    open={openAddConsentDialog}
                    onClose={handleCloseAddConsentDialog} // Close dialog
                />
            )}
            {openEditConsentDialog && (
                <EditConsent
                    open={openEditConsentDialog}
                    onClose={handleCloseEditConsentDialog} // Close dialog
                    consent={selectedConsent} // Pass selected consent data
                />
            )}
        </div>
    );
}