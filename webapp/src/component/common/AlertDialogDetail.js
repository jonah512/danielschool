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
import { Stack } from '@mui/material';
import Resource from '../../framework/resource/Resource';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Typography from '@mui/material/Typography';

export default function AlertDialogDetail(props) {
  const [open, setOpen] = React.useState(props.Open);
  const [yesOrNo, setYesOrNo] = React.useState(props.YesOrNo);

  const onNo = () => {
    if (props.onNo !== undefined) props.onNo();
  };

  const onYes = () => {
    if (props.onYes !== undefined) props.onYes();
  };

  const onConfirm = () => {
    if (props.onConfirm !== undefined) props.onConfirm();
  }
  const handleClose = () => {
    onNo();
    onConfirm();
    setOpen(false);
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
          <Stack direction='column'>
            <DialogContentText id="alert-dialog-description">
              {props.SummaryContent ?
                (<span dangerouslySetInnerHTML={{ __html: props.SummaryContent }} />) : (props.Content)}
            </DialogContentText>
            <Accordion>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                <Typography>{Resource.get('upgrade.seedetails')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                {props.HtmlContent ?
                (<span dangerouslySetInnerHTML={{ __html: props.HtmlContent }} />) : (props.Content)}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </DialogContent>
        <DialogActions>
          {yesOrNo ? (<Stack direction='row' spacing={1}>
            <Button variant="contained" startIcon={<CancelIcon />}
              onClick={onNo}>{Resource.get('common.dialog.no')}</Button><Button onClick={onYes} variant="contained" startIcon={<CheckIcon />} autoFocus>{Resource.get('common.dialog.yes')}</Button></Stack>)
            : (<Button variant="contained" onClick={onConfirm} startIcon={<CheckIcon />} autoFocus>{props.ConfirmLabel ? props.ConfirmLabel : Resource.get('common.dialog.confirm')}</Button>)}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
