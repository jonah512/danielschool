// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CheckIcon from '@mui/icons-material/Check';
import { Stack } from '@mui/material';
import Resource from '../../framework/resource/Resource';
import Logger from '../../framework/logger/Logger';

export default function ClassDescription({funcConfirm}) {

  const handleClose = () =>{
    if(funcConfirm){
      funcConfirm();
    }
  }
  return (
    <React.Fragment>
      <Dialog
        open={true}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        style={{
          margin: 'auto',
          zIndex: 9999,
        }}
      >
        <DialogTitle id="alert-dialog-title">
          {Resource.get('register.class_description')}
        </DialogTitle>
        <DialogContent>
          <Stack direction='column'>
            <img src='register01.jpg' alt='Class Description' style={{ width: '100%' }} />
            <img src='register02.jpg' alt='Class Description' style={{ width: '100%' }} />
            <img src='register04.jpg' alt='Class Description' style={{ width: '100%' }} />
            <img src='register05.jpg' alt='Class Description' style={{ width: '100%' }} />            
            <img src='register03.jpg' alt='Class Description' style={{ width: '100%' }} />
          </Stack>
        </DialogContent>
        <DialogActions>
            <Button
              variant="contained"
              onClick={handleClose}
              startIcon={<CheckIcon />}
              autoFocus
            >
             {Resource.get('common.dialog.close')}
            </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
