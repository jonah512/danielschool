// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { Stack, TextField, Typography } from '@mui/material';
import Resource from '../../framework/resource/Resource';
import { DataGrid } from '@mui/x-data-grid';
import Defines from '../Defines';
import { useEffect, useState } from 'react';
import StuidentCtrl from '../../control/StudentsCtrl';
import SearchIcon from '@mui/icons-material/Search';
import Logger from '../../framework/logger/Logger';
import SessionManager from '../../control/SessionManager';

export default function FindStudentDialog({ classId, onClose, onAddStudent }) {
  const [studentList, setStudentList] = useState([]); // State for user list
  const [selectionStudent, setSelectionStudent] = React.useState([]);
  const MODULE = 'FindStudentDialog';
  const [search, setSearch] = React.useState(SessionManager.getSearchWord(MODULE));

  const handleSearchChange = async (event) => {
    const control = new StuidentCtrl(window.APIURL);
    if(search === event.target.value) {
      return;
    }
    setSearch(event.target.value);
    console.log("handleSearchChange Search text changed:", event.target.value);
    const result = await control.getStudentsSync(event.target.value); // Await the async function
    console.log('handleSearchChange students_ : ', result.search, result.students);
    if(result.search !== event.target.value) {
      return;
    }
    setStudentList(result.students);
  };

  useEffect(() => {
    const control = new StuidentCtrl(window.APIURL);
    const fetchStudents = async () => {
      const result = await control.getStudentsSync(SessionManager.getSearchWord(MODULE));
      if (result) {
        setStudentList(result.students);
      }
    };
    fetchStudents();
  }, [classId]);


  const handleSelectionChange = (newSelection) => {
    setSelectionStudent(newSelection);
    
  };
  const handleClose = () => {
    onClose();
  };

  const handleAddStudent = async () => {
    console.log('handleAddStudent', selectionStudent);
    onAddStudent(selectionStudent);
    onClose();

  };

  const columns = [
    { field: 'name', headerName: Resource.get('students.name'), width: 150 },
    {
      field: 'grade', headerName: Resource.get('students.grade'), width: 150,
      renderCell: (params) => {
        const grade = Defines.gradeOptions.find(grade => grade.value === params.value);
        return grade ? grade.label : params.value;
      }
    },
    { field: 'korean_level', headerName: Resource.get('students.korean_level'), width: 150 },
    { field: 'email', headerName: Resource.get('students.email'), width: 250 },
    { field: 'phone', headerName: Resource.get('students.phone'), width: 150 },
    { field: 'parent_name', headerName: Resource.get('students.parent_name'), width: 150 },

  ];
  return (
    <React.Fragment>
      <Dialog
        open={true}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth // Make the dialog take the full width
        maxWidth="lg" // Set the maximum width to large
        style={{
          margin: 'auto',
          zIndex: 9999,
        }}
      >
        <DialogTitle id="alert-dialog-title">

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Typography variant="h6" style={{ marginRight: 'auto' }}>
              {Resource.get('classroom.add_student')}
            </Typography>
            <TextField
              label={Resource.get("common.search")}
              variant="outlined"
              value={search}
              onChange={handleSearchChange}
            />
            <Button variant="contained" startIcon={<SearchIcon />} />
          </Stack>
        </DialogTitle>
        <DialogContent >
          <DialogContentText id="alert-dialog-description">
            <DataGrid
              rows={studentList}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 50]}
              checkboxSelection
              rowSelectionModel={selectionStudent}
              onRowSelectionModelChange={handleSelectionChange}
              localeText={{
                MuiTablePagination: {
                  labelRowsPerPage: Resource.get('common.rowsperpage'),
                }
              }}
            />

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<CancelIcon />}
              onClick={handleClose}
            >
              {Resource.get('common.dialog.cancel')}
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              autoFocus
              onClick={handleAddStudent}
            >
              {Resource.get('common.dialog.yes')}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
