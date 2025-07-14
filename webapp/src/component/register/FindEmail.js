// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CheckIcon from '@mui/icons-material/Check';
import { Stack, TextField, Typography } from '@mui/material';
import Resource from '../../framework/resource/Resource';
import RegisterCtrl from '../../control/RegisterCtrl';

export default function FindEmail({funcConfirm}) {
  const [open, setOpen] = React.useState(true);
  const [textInput, setTextInput] = React.useState('');
  const [candidateEmails, setCandidateEmails] = React.useState([]);

  const handleClose = () => {
    if (funcConfirm !== undefined) funcConfirm(); // Pass input value to onConfirm handler
    setOpen(false);
  };

  const handleTextChange = (event) => {
    setTextInput(event.target.value);
    if(event.target.value.length >= 2){
      RegisterCtrl.searchEmail(event.target.value, onSearch)
    }
  };

  const onSearch = (event) => {
    console.log('onSearch', event);
    const emails = event.map(item => item.email);

    const maskedEmails = emails.map(email => {
      const atIndex = email.indexOf('@');
      if (atIndex > 4) {
      return email.substring(0, atIndex - 4) + '****' + email.substring(atIndex);
      }
      return '****' + email.substring(atIndex);
    });
    setCandidateEmails(maskedEmails);
  }

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        style={{
          margin: 'auto',
          zIndex: 9999,
        }}
      >
        <DialogTitle id="alert-dialog-title">
          {Resource.get('register.find_email_by_name')}
        </DialogTitle>
        <DialogContent>
          <Stack direction='column' spacing={2}>
            <div ></div>
            <TextField
              autoFocus
              margin="dense"
              label={ Resource.get('register.student_name') }
              fullWidth
              variant="outlined"
              value={textInput}
              onChange={handleTextChange}
            />
              {textInput.length> 2 && candidateEmails.length > 0 && candidateEmails.map((email, index) => (
                <Typography variant="h7" sx={{ color: '#333', textAlign: 'center' }}>{email}</Typography>
              ))}
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
