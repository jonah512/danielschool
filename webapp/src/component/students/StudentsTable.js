// Copyright (c) 2025 Milal Daniel Korean School.
import dayjs from 'dayjs';
import * as React from 'react';
import Box from '@mui/material/Box';
import { Stack, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import AlertDialog from '../common/AlertDialog';
import StuidentCtrl from '../../control/StudentsCtrl';
import Resource from '../../framework/resource/Resource';
import { EventDef } from '../../framework/event/EventDef';
import EventPublisher from '../../framework/event/EventPublisher';
import { DataGrid } from '@mui/x-data-grid';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddNewStudent from './AddNewStudent'; // Import the new component
import EditStudent from './EditStudent'; // Import the EditStudent component
import SessionManager from '../../control/SessionManager';
import Defines from '../Defines';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import StudentBulkUpload from './StudentBulkUpload';
import DownloadIcon from '@mui/icons-material/Download';

export default function StudentsTable({ search }) {
    const [userList, setUserList] = useState([]); // State for user list
    const [selectionStudent, setSelectionStudent] = React.useState([]);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [enableDeleteButton, setEnableDeleteButton] = React.useState(false);
    const [deleteConfirm, setDeleteConfirm] = React.useState(false);
    const [openAddStudentDialog, setOpenAddStudentDialog] = React.useState(false); // State for dialog
    const [openEditStudentDialog, setOpenEditStudentDialog] = React.useState(false); // State for edit dialog
    const [selectedStudent, setSelectedStudent] = React.useState(null); // State for selected student
    const MODULE = 'StudentsTable';

    useEffect(() => {
        const control = new StuidentCtrl(window.APIURL);
        control.getStudents(search);
        EventPublisher.addEventListener(EventDef.onStudentListChange, MODULE, onStudentListChange);
        return () => {
            EventPublisher.removeEventListener(EventDef.onStudentListChange, MODULE);
        }
    }, [search, window.APIURL]);

    const onStudentListChange = (data) => {
        setUserList(data); // Update user list state
    }
    const handleSelectionChange = (newSelection) => {
        setSelectionStudent(newSelection);
        setSelectedIds(newSelection);
        newSelection.length > 0 ?
            setEnableDeleteButton(true) :
            setEnableDeleteButton(false);
    };

    const handleOpenAddStudentDialog = () => {
        setOpenAddStudentDialog(true);
    };

    const handleCloseAddStudentDialog = () => {
        setOpenAddStudentDialog(false);
    };

    const handleRowDoubleClick = (params) => {
        setSelectedStudent(params.row); // Set the selected student data
        setOpenEditStudentDialog(true); // Open the edit dialog
    };

    const handleCloseEditStudentDialog = () => {
        setOpenEditStudentDialog(false);
        setSelectedStudent(null); // Clear the selected student data
    };

    const onConfirm = async () => {
        setDeleteConfirm(false);
        const control = new StuidentCtrl(window.APIURL);
        await control.deleteStudentsSync(selectedIds, SessionManager.getSearchWord('Students')); // Call deleteStudentsSync to remove selected items
        setEnableDeleteButton(false); // Disable delete button after deletion
        setSelectedIds([]); // Clear selected IDs
    };

    const onClosePopup = () => {
        setDeleteConfirm(false);
    };

    const deleteSelectedFiles = () => {
        if (selectedIds.length === 0) {
            return;
        }
        setDeleteConfirm(true);
    };

    const handleDownloadCsv = () => {
        // const control = new StuidentCtrl(window.APIURL);
        // control.downloadCsv();
        const csvContent = [
            ['ID', 'Name', 'Birth Date', 'Grade', 'Korean Level', 'Email', 'Phone', 'Parent Name', 'Address', 'Religion', 'Church'],
            ...userList.map(student => [
            student.id,
            student.name,
            student.birth_date,
            Defines.gradeOptions.find(grade => grade.value === student.grade)?.label || student.grade,
            student.korean_level,
            student.email,
            student.phone,
            student.parent_name,
            student.address,
            Resource.get('students.' + student.religion),
            student.church
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const file_name = `students_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.csv`;
        link.setAttribute('download', file_name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    }

    const columns = [
        { field: 'id', headerName: Resource.get('students.id'), width: 90 },
        { field: 'name', headerName: Resource.get('students.name'), width: 150 },
        { field: 'birth_date', headerName: Resource.get('students.birthdate'), width: 150 },
        { field: 'grade', headerName: Resource.get('students.grade'), width: 150, 
            renderCell: (params) => {
                const grade = Defines.gradeOptions.find(grade => grade.value === params.value);
                return grade ? grade.label : params.value;
            }
        },
        { field: 'korean_level', headerName: Resource.get('students.korean_level'), width: 150 },
        { field: 'email', headerName: Resource.get('students.email'), width: 250 },
        { field: 'phone', headerName: Resource.get('students.phone'), width: 150 },
        { field: 'parent_name', headerName: Resource.get('students.parent_name'), width: 150 },
        { field: 'address', headerName: Resource.get('students.address'), width: 250 },
        { field: 'religion', headerName: Resource.get('students.religion'), width: 150,
            renderCell: (params) => {
                return Resource.get('students.' + params.value);
            }
         },
        { field: 'church', headerName: Resource.get('students.church'), width: 150 },

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
                    rowSelectionModel={selectionStudent}
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
                        onClick={handleOpenAddStudentDialog} // Open dialog
                        startIcon={<AddCircleIcon />}
                    >
                        {Resource.get('students.title')}
                    </Button>
                    <StudentBulkUpload />
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
                    Title={Resource.get('students.deletetitle')}
                    Content={Resource.get('students.deletecontent', selectedIds.length)} />) : ('')}
            {openAddStudentDialog && (
                <AddNewStudent
                    open={openAddStudentDialog}
                    onClose={handleCloseAddStudentDialog} // Close dialog
                />
            )}
            {openEditStudentDialog && (
                <EditStudent
                    open={openEditStudentDialog}
                    onClose={handleCloseEditStudentDialog} // Close dialog
                    student={selectedStudent} // Pass selected student data
                />
            )}
        </div>
    );
}