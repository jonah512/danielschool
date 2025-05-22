// Copyright (c) 2025 Milal Daniel Korean School.
import dayjs from 'dayjs';
import * as React from 'react';
import Box from '@mui/material/Box';
import { Stack, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import AlertDialog from '../common/AlertDialog';
import TeachersCtrl from '../../control/TeachersCtrl';
import Resource from '../../framework/resource/Resource';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';
import { DataGrid } from '@mui/x-data-grid';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddNewTeacher from './AddNewTeacher'; // Import the new component
import EditTeacher from './EditTeacher'; // Import the EditTeacher component
import SessionManager from '../../control/SessionManager';
import AddCircleIcon from '@mui/icons-material/AddCircle';

export default function TeachersTable({search}) {
    const [userList, setUserList] = useState([]); // State for user list
    const [selectionTeacher, setSelectionTeacher] = React.useState([]);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [enableDeleteButton, setEnableDeleteButton] = React.useState(false);
    const [deleteConfirm, setDeleteConfirm] = React.useState(false);
    const [openAddTeacherDialog, setOpenAddTeacherDialog] = React.useState(false); // State for dialog
    const [openEditTeacherDialog, setOpenEditTeacherDialog] = React.useState(false); // State for edit dialog
    const [selectedTeacher, setSelectedTeacher] = React.useState(null); // State for selected teacher
    const MODULE = 'TeachersTable';

    useEffect(() => {
        const control = new TeachersCtrl(window.APIURL);
        EventPublisher.addEventListener(EventDef.onTeacherListChange, MODULE, onTeacherListChange);
        control.getTeachers(search);
        return () => {
            EventPublisher.removeEventListener(EventDef.onTeacherListChange, MODULE);
        }
    }, [search, window.APIURL]);

    const onTeacherListChange = (data) => {
        console.log(data);
        setUserList(data); // Update user list state
    }
    const handleSelectionChange = (newSelection) => {
        setSelectionTeacher(newSelection);
        setSelectedIds(newSelection);
        newSelection.length > 0 ?
            setEnableDeleteButton(true) :
            setEnableDeleteButton(false);
    };

    const handleOpenAddTeacherDialog = () => {
        setOpenAddTeacherDialog(true);
    };

    const handleCloseAddTeacherDialog = () => {
        setOpenAddTeacherDialog(false);
    };

    const handleRowDoubleClick = (params) => {
        setSelectedTeacher(params.row); // Set the selected teacher data
        setOpenEditTeacherDialog(true); // Open the edit dialog
    };

    const handleCloseEditTeacherDialog = () => {
        setOpenEditTeacherDialog(false);
        setSelectedTeacher(null); // Clear the selected teacher data
    };

    const onConfirm = () => {
        setDeleteConfirm(false);
        const control = new TeachersCtrl(window.APIURL);
        control.deleteTeachers(selectedIds, SessionManager.getSearchWord('Teachers')); // Call deleteTeachers to remove selected items
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
        { field: 'id', headerName: Resource.get('teachers.id'), width: 90 },
        { field: 'name', headerName: Resource.get('teachers.name'), width: 150 },
        { field: 'subject', headerName: Resource.get('teachers.subject'), width: 150 },
        { field: 'email', headerName: Resource.get('teachers.email'), width: 250 },
        { field: 'phone', headerName: Resource.get('teachers.phone'), width: 150 },
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
                    rowSelectionModel={selectionTeacher}
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
                        disabled={!enableDeleteButton }
                        onClick={deleteSelectedFiles}
                        startIcon={<DeleteForeverIcon />}
                    >{Resource.get('common.delete')}</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        onClick={handleOpenAddTeacherDialog} // Open dialog
                        startIcon={<AddCircleIcon />}
                    >
                       {Resource.get('teachers.title')}
                    </Button>
                </Stack>
            </Stack>
            {deleteConfirm ?
                (<AlertDialog
                    onYes={onConfirm}
                    onNo={onClosePopup}
                    YesOrNo={true} Open={true}
                    Title={Resource.get('teachers.deletetitle')}
                    Content={Resource.get('teachers.deletecontent', selectedIds.length)} />) : ('')}
            {openAddTeacherDialog && (
                <AddNewTeacher
                    open={openAddTeacherDialog}
                    onClose={handleCloseAddTeacherDialog} // Close dialog
                />
            )}
            {openEditTeacherDialog && (
                <EditTeacher
                    open={openEditTeacherDialog}
                    onClose={handleCloseEditTeacherDialog} // Close dialog
                    teacher={selectedTeacher} // Pass selected teacher data
                />
            )}
        </div>
    );
}