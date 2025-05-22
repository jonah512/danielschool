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
import { Stack, TextField } from '@mui/material';
import Resource from '../../framework/resource/Resource';

export default function AlertDialog(props) {
  const [open, setOpen] = React.useState(props.Open);
  const [yesOrNo, setYesOrNo] = React.useState(props.YesOrNo);
  const [textInput, setTextInput] = React.useState(''); // State to store text field input

  const onNo = () => {
    if (props.onNo !== undefined) props.onNo();
  };

  const onYes = () => {
    if (props.onYes !== undefined) props.onYes(textInput); // Pass input value to onYes handler
  };

  const onConfirm = () => {
    if (props.onConfirm !== undefined) props.onConfirm(textInput); // Pass input value to onConfirm handler
  }

  const handleClose = () => {
    onNo();
    onConfirm();
    setOpen(false);
  };

  const handleTextChange = (event) => {
    setTextInput(event.target.value); // Update text input on change
  };

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
          {props.Title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.HtmlContent ? (
              <span dangerouslySetInnerHTML={{ __html: props.HtmlContent }} />
            ) : (
              props.Content
            )}
          </DialogContentText>

          {/* Add TextField for user input */}
          {props.showTextField && (
            <TextField
              autoFocus
              margin="dense"
              label={props.TextFieldLabel || 'Enter your text'}
              fullWidth
              variant="outlined"
              value={textInput}
              onChange={handleTextChange}
            />
          )}
        </DialogContent>
        <DialogActions>
          {yesOrNo ? (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<CancelIcon />}
                onClick={onNo}
              >
                {Resource.get('common.dialog.no')}
              </Button>
              <Button
                onClick={onYes}
                variant="contained"
                startIcon={<CheckIcon />}
                autoFocus
              >
                {Resource.get('common.dialog.yes')}
              </Button>
            </Stack>
          ) : (
            <Button
              variant="contained"
              onClick={onConfirm}
              startIcon={<CheckIcon />}
              autoFocus
            >
              {props.ConfirmLabel
                ? props.ConfirmLabel
                : Resource.get('common.dialog.confirm')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
