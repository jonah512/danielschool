// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import dayjs from 'dayjs';
import { Stack, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import AlertDialog from '../common/AlertDialog';
import RequestsCtrl from '../../control/RequestsCtrl';
import Resource from '../../framework/resource/Resource';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';
import { DataGrid } from '@mui/x-data-grid';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditRequest from './EditRequest'; // Import the EditRequest component
import SessionManager from '../../control/SessionManager';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DownloadIcon from '@mui/icons-material/Download';
import Logger from '../../framework/logger/Logger';

export default function RequestsTable({search}) {
    const [userList, setUserList] = useState([]); // State for user list
    const [selectionRequest, setSelectionRequest] = React.useState([]);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [enableDeleteButton, setEnableDeleteButton] = React.useState(false);
    const [deleteConfirm, setDeleteConfirm] = React.useState(false);
    const [openEditRequestDialog, setOpenEditRequestDialog] = React.useState(false); // State for edit dialog
    const [selectedRequest, setSelectedRequest] = React.useState(null); // State for selected request
    const MODULE = 'RequestsTable';

    useEffect(() => {
        const control = new RequestsCtrl(window.APIURL);
        EventPublisher.addEventListener(EventDef.onRequestListChange, MODULE, onRequestListChange);
        control.getRequests(search);
        return () => {
            EventPublisher.removeEventListener(EventDef.onRequestListChange, MODULE);
        }
    }, [search, window.APIURL]);

    const onRequestListChange = (data) => {
        Logger.debug(data);
        setUserList(data); // Update user list state
    }
    const handleSelectionChange = (newSelection) => {
        setSelectionRequest(newSelection);
        setSelectedIds(newSelection);
        newSelection.length > 0 ?
            setEnableDeleteButton(true) :
            setEnableDeleteButton(false);
    };

    const handleRowDoubleClick = (params) => {
        setSelectedRequest(params.row); // Set the selected request data
        setOpenEditRequestDialog(true); // Open the edit dialog
    };

    const handleCloseEditRequestDialog = () => {
        setOpenEditRequestDialog(false);
        setSelectedRequest(null); // Clear the selected request data
    };

    const onConfirm = () => {
        setDeleteConfirm(false);
        const control = new RequestsCtrl(window.APIURL);
        control.deleteRequests(selectedIds, SessionManager.getSearchWord('Requests')); // Call deleteRequests to remove selected items
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


    const handleDownloadCsv = () => {
      const csvContent = [
        ['Name', 'Students', 'Email', 'Phone', 'Message', 'Memo', 'Request Time', 'Status'],
        ...userList.map(request => [
            request.name,
            request.students,
            request.email,
            request.phone,
            request.message,
            request.memo,
            dayjs(request.request_time).format('YYYY-MM-DD HH:mm:ss'),
            Resource.get('requests.status_' + request.status.toLowerCase())
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const file_name = `requests_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.csv`;
      link.setAttribute('download', file_name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    const columns = [
        
        { field: 'name', headerName: Resource.get('requests.name'), width: 100 },
        { field: 'students', headerName: Resource.get('requests.students'), width: 150 },
        { field: 'email', headerName: Resource.get('requests.email'), width: 200 },
        { field: 'phone', headerName: Resource.get('requests.phone'), width: 130 },
        { field: 'message', headerName: Resource.get('requests.message'), width: 300 },
        { field: 'memo', headerName: Resource.get('requests.memo'), width: 250 },
        { field: 'request_time', headerName: Resource.get('requests.request_time'), width: 200,
            renderCell: (params) => {
                return dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        { field: 'status', headerName: Resource.get('requests.status'), width: 150,
            renderCell: (params) => {
                return Resource.get('requests.status_' + params.value.toLowerCase());
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
                    rowSelectionModel={selectionRequest}
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
                        onClick={handleDownloadCsv} // Open dialog
                        startIcon={<DownloadIcon />}
                    >
                        {Resource.get('common.download')}
                    </Button>
                </Stack>
            </Stack>
            {deleteConfirm ?
                (<AlertDialog
                    onYes={onConfirm}
                    onNo={onClosePopup}
                    YesOrNo={true} Open={true}
                    Title={Resource.get('requests.deletetitle')}
                    Content={Resource.get('requests.deletecontent', selectedIds.length)} />) : ('')}

            {openEditRequestDialog && (
                <EditRequest
                    open={openEditRequestDialog}
                    onClose={handleCloseEditRequestDialog} // Close dialog
                    request={selectedRequest} // Pass selected request data
                />
            )}
        </div>
    );
}