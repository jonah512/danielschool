// Copyright (c) 2025 Milal Daniel Korean School.
import dayjs from 'dayjs';
import * as React from 'react';
import Box from '@mui/material/Box';
import { Stack, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import AlertDialog from '../common/AlertDialog';
import ClassesCtrl from '../../control/ClassesCtrl';
import TeachersCtrl from '../../control/TeachersCtrl';
import Resource from '../../framework/resource/Resource';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';
import { DataGrid } from '@mui/x-data-grid';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddNewClass from './AddNewClass'; // Import the new component
import EditClass from './EditClass'; // Import the EditClass component
import SessionManager from '../../control/SessionManager';
import Defines from '../Defines';
import AddCircleIcon from '@mui/icons-material/AddCircle';

export default function ClassesTable({search, year, term}) {
    const [userList, setUserList] = useState([]); // State for user list
    const [selectionClass, setSelectionClass] = React.useState([]);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [enableDeleteButton, setEnableDeleteButton] = React.useState(false);
    const [deleteConfirm, setDeleteConfirm] = React.useState(false);
    const [openAddClassDialog, setOpenAddClassDialog] = React.useState(false); // State for dialog
    const [openEditClassDialog, setOpenEditClassDialog] = React.useState(false); // State for edit dialog
    const [selectedClass, setSelectedClass] = React.useState(null); // State for selected class
    const [teachers, setTeachers] = useState([]);
    const MODULE = 'ClassesTable';

    useEffect(() => {
        const control = new ClassesCtrl(window.APIURL);
        EventPublisher.addEventListener(EventDef.onClassListChange, MODULE, onClassListChange);        
        control.getClasses(search=search, year=year, term=term);

        const teacherControl = new TeachersCtrl(window.APIURL);
        EventPublisher.addEventListener(EventDef.onTeacherListChange, MODULE, onTeacherListChange);
        teacherControl.getTeachers('');

        return () => {
            EventPublisher.removeEventListener(EventDef.onClassListChange, MODULE);
            EventPublisher.removeEventListener(EventDef.onTeacherListChange, MODULE);
        }
    }, [search, year, term, window.APIURL]);

    const onTeacherListChange = (event) => {
        console.log('onTeacherListChange', event);
        setTeachers(event); // Update teachers state
    }

    const onClassListChange = (data) => {
        console.log(data);
        setUserList(data); // Update user list state
    }
    const handleSelectionChange = (newSelection) => {
        setSelectionClass(newSelection);
        setSelectedIds(newSelection);
        newSelection.length > 0 ?
            setEnableDeleteButton(true) :
            setEnableDeleteButton(false);
    };

    const handleOpenAddClassDialog = () => {
        setOpenAddClassDialog(true);
    };

    const handleCloseAddClassDialog = () => {
        setOpenAddClassDialog(false);
    };

    const handleRowDoubleClick = (params) => {
        setSelectedClass(params.row); // Set the selected class data
        setOpenEditClassDialog(true); // Open the edit dialog
    };

    const handleCloseEditClassDialog = () => {
        setOpenEditClassDialog(false);
        setSelectedClass(null); // Clear the selected class data
    };

    const onConfirm = async () => {
        setDeleteConfirm(false);
        const control = new ClassesCtrl(window.APIURL);
        await control.deleteClasses(selectedIds,  SessionManager.getSearchWord('Classes')); // Call deleteClasses to remove selected items
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
        { field: 'id', headerName: Resource.get('classes.id'), width: 90 },
        { field: 'name', headerName: Resource.get('classes.name'), width: 150 },
        { field: 'description', headerName: Resource.get('classes.description'), width: 250 },
        { field: 'year', headerName: Resource.get('classes.year'), width: 100 },
        { field: 'term', headerName: Resource.get('classes.term'), width: 100 },
        { 
            field: 'teacher_id', 
            headerName: Resource.get('classes.teacher'), 
            width: 150,
            renderCell: (params) => {
                const teacher = teachers.find(teacher => teacher.id === params.value);
                return teacher ? teacher.name : params.value;
            }
        },
        { 
            field: 'mendatory', 
            headerName: Resource.get('classes.mendatory'), 
            width: 100,
            renderCell: (params) => {                
                return params.value ? 'Yes' : 'No';
            }
        },
        { 
            field: 'min_grade', 
            headerName: Resource.get('classes.min_grade'), 
            width: 150,
            renderCell: (params) => {
                const grade = Defines.gradeOptions.find(option => option.value === params.value);
                return grade ? grade.label : params.value;
            }
        },
        { 
            field: 'max_grade', 
            headerName: Resource.get('classes.max_grade'), 
            width: 150,
            renderCell: (params) => {
                const grade = Defines.gradeOptions.find(option => option.value === params.value);
                return grade ? grade.label : params.value;
            }
        },
        { 
            field: 'min_korean_level', 
            headerName: Resource.get('classes.min_korean_level'), 
            width: 150,
            renderCell: (params) => {
                const grade = Defines.koreanLevelOptions.find(option => option.level === params.value);
                return grade ? grade.label : params.value;
            }
        },
        { 
            field: 'max_korean_level', 
            headerName: Resource.get('classes.max_korean_level'), 
            width: 150,
            renderCell: (params) => {
                const grade = Defines.koreanLevelOptions.find(option => option.level === params.value);
                return grade ? grade.label : params.value;
            }
        },
        { field: 'max_students', headerName: Resource.get('classes.max_students'), width: 150 },
        { field: 'period', headerName: Resource.get('classes.period'), width: 100 },
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
                    rowSelectionModel={selectionClass}
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
                        onClick={handleOpenAddClassDialog} // Open dialog
                        startIcon={<AddCircleIcon />}
                    >
                       {Resource.get('classes.title')}
                    </Button>
                </Stack>
            </Stack>
            {deleteConfirm &&
                <AlertDialog
                    onYes={onConfirm}
                    onNo={onClosePopup}
                    YesOrNo={true} Open={true}
                    Title={Resource.get('classes.deletetitle')}
                    Content={Resource.get('classes.deletecontent', selectedIds.length)} />}
            {openAddClassDialog && (
                <AddNewClass
                    open={openAddClassDialog}
                    onClose={handleCloseAddClassDialog} // Close dialog
                />
            )}
            {openEditClassDialog && (
                <EditClass
                    open={openEditClassDialog}
                    onClose={handleCloseEditClassDialog} // Close dialog
                    class_={selectedClass} // Pass selected class data
                />
            )}
        </div>
    );
}