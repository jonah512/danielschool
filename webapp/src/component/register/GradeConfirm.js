// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CheckIcon from '@mui/icons-material/Check';
import { Stack, Typography } from '@mui/material';
import Resource from '../../framework/resource/Resource';
import Logger from '../../framework/logger/Logger';
import CancelIcon from '@mui/icons-material/Cancel';

export default function GradeConfirm({funcConfirm, funcCancel, student}) {

  return (
    <React.Fragment>
      <Dialog
        open={true}
        onClose={funcCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        style={{
          margin: 'auto',
          zIndex: 9999,
        }}
      >
        <DialogTitle id="alert-dialog-title">
        {Resource.get('students.grade_confirm_missing')}
        </DialogTitle>
        <DialogContent>
          <Stack direction='column'>
            <Typography variant="body1" gutterBottom>
              {Resource.get('students.grade')}: {student.grade}
            </Typography>

          </Stack>
        </DialogContent>
        <DialogActions>
        <Button
              variant="contained"
              onClick={funcCancel}
              startIcon={<CancelIcon />}
              autoFocus
            >
             {Resource.get('common.dialog.no')}
            </Button>
            <Button
              variant="contained"
              onClick={funcConfirm}
              startIcon={<CheckIcon />}
              autoFocus
            >
             {Resource.get('common.dialog.confirm')}
            </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
