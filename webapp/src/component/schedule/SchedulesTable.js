// Copyright (c) 2025 Milal Daniel Korean School.
import dayjs from 'dayjs';
import * as React from 'react';
import { Stack, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import AlertDialog from '../common/AlertDialog';
import SchedulesCtrl from '../../control/SchedulesCtrl';
import Resource from '../../framework/resource/Resource';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';
import { DataGrid } from '@mui/x-data-grid';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddNewSchedule from './AddNewSchedule'; // Import the new component
import EditSchedule from './EditSchedule'; // Import the EditSchedule component
import SessionManager from '../../control/SessionManager';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Logger from '../../framework/logger/Logger';

export default function SchedulesTable() {
    const [userList, setUserList] = useState([]); // State for user list
    const [selectionSchedule, setSelectionSchedule] = React.useState([]);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [enableDeleteButton, setEnableDeleteButton] = React.useState(false);
    const [deleteConfirm, setDeleteConfirm] = React.useState(false);
    const [openAddScheduleDialog, setOpenAddScheduleDialog] = React.useState(false); // State for dialog
    const [openEditScheduleDialog, setOpenEditScheduleDialog] = React.useState(false); // State for edit dialog
    const [selectedSchedule, setSelectedSchedule] = React.useState(null); // State for selected schedule
    const MODULE = 'SchedulesTable';

    useEffect(() => {
        const control = new SchedulesCtrl(window.APIURL);
        EventPublisher.addEventListener(EventDef.onScheduleListChange, MODULE, onScheduleListChange);
        control.getSchedules();
        return () => {
            EventPublisher.removeEventListener(EventDef.onScheduleListChange, MODULE);
        }
    }, [ window.APIURL]);

    const onScheduleListChange = (data) => {
        const filteredData = data.filter(item => item.id >= 0); // Exclude items with id less than 0
        Logger.debug(filteredData);
        setUserList(filteredData); // Update user list state
    }
    const handleSelectionChange = (newSelection) => {
        setSelectionSchedule(newSelection);
        setSelectedIds(newSelection);
        newSelection.length > 0 ?
            setEnableDeleteButton(true) :
            setEnableDeleteButton(false);
    };

    const handleOpenAddScheduleDialog = () => {
        setOpenAddScheduleDialog(true);
    };

    const handleCloseAddScheduleDialog = () => {
        setOpenAddScheduleDialog(false);
    };

    const handleRowDoubleClick = (params) => {
        setSelectedSchedule(params.row); // Set the selected schedule data
        setOpenEditScheduleDialog(true); // Open the edit dialog
    };

    const handleCloseEditScheduleDialog = () => {
        setOpenEditScheduleDialog(false);
        setSelectedSchedule(null); // Clear the selected schedule data
    };

    const onConfirm = () => {
        setDeleteConfirm(false);
        const control = new SchedulesCtrl(window.APIURL);
        control.deleteSchedules(selectedIds, SessionManager.getSearchWord('Schedules')); // Call deleteSchedules to remove selected items
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
        { field: 'id', headerName: Resource.get('schedules.id'), width: 90 },
        { field: 'year', headerName: Resource.get('schedules.year'), width: 150 },
        { field: 'term', headerName: Resource.get('schedules.term'), width: 150 },
        {
            field: 'opening_time', headerName: Resource.get('schedules.opening_time'), width: 250,
            renderCell: (params) => {
                return dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        {
            field: 'closing_time', headerName: Resource.get('schedules.closing_time'), width: 250,
            renderCell: (params) => {
                return dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
            }
        },
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
                    rowSelectionModel={selectionSchedule}
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
                        onClick={handleOpenAddScheduleDialog} // Open dialog
                        startIcon={<AddCircleIcon />}
                    >
                        {Resource.get('schedules.title')}
                    </Button>

                </Stack>
            </Stack>
            {deleteConfirm ?
                (<AlertDialog
                    onYes={onConfirm}
                    onNo={onClosePopup}
                    YesOrNo={true} Open={true}
                    Title={Resource.get('schedules.deletetitle')}
                    Content={Resource.get('schedules.deletecontent', selectedIds.length)} />) : ('')}
            {openAddScheduleDialog && (
                <AddNewSchedule
                    open={openAddScheduleDialog}
                    onClose={handleCloseAddScheduleDialog} // Close dialog
                />
            )}
            {openEditScheduleDialog && (
                <EditSchedule
                    open={openEditScheduleDialog}
                    onClose={handleCloseEditScheduleDialog} // Close dialog
                    schedule={selectedSchedule} // Pass selected schedule data
                />
            )}
        </div>
    );
}