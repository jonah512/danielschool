// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect } from 'react';
import WifiTetheringOffIcon from '@mui/icons-material/WifiTetheringOff';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import IconButton from '@mui/material/IconButton';
import SessionManager from '../../control/SessionManager';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Resource from '../../framework/resource/Resource';
import Snackbar from '@mui/material/Snackbar';
import Fade from '@mui/material/Fade';
import Logger from '../../framework/logger/Logger';

export default function ConnectionStatus(props) {
  const [ deviceConnectionStatus, setDeviceConnectionStatus] = React.useState(SessionManager.getLoginStatus());
  const [occupied, setOccupied] = React.useState(false);
  const [showMessage, setShowMessage] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');

  const MODULE = 'ConnectionStatus';
  useEffect(() => {
    SessionManager.addDeviceConnectionArbiter(MODULE, onConnectionStatus)
    EventPublisher.addEventListener(EventDef.onOccupiedByOtherApp, MODULE, onOccupied);
    EventPublisher.addEventListener(EventDef.onReleasedByOtherApp, MODULE, onReleased);

    return () => {
      SessionManager.removeDeviceConnectionArbiter(MODULE)
      EventPublisher.removeEventListener(EventDef.onOccupiedByOtherApp, MODULE);
      EventPublisher.removeEventListener(EventDef.onReleasedByOtherApp, MODULE);

    };
  }, [props]);

  const onConnectionStatus = (status, changed) => {
    setDeviceConnectionStatus(status);

    if (changed && status) {
      setShowMessage(true);
      setAlertMessage(Resource.get('cmsconnection.connected'));
    }
    else if (changed && !status) {
      setShowMessage(true);
      setAlertMessage(Resource.get('cmsconnection.disconnected'));
    }
  }
  const onOccupied = (clientId) => {
    setOccupied(true);
  }

  const onReleased = (clientId) => {
    setOccupied(false);
  }

  const handleClose = () => {
    setShowMessage(false);
  }

  return (
    <IconButton color="inherit">
      {deviceConnectionStatus && !occupied ? (<WifiTetheringIcon style={{ color: '#05FF00' }} />) : ('')}
      {deviceConnectionStatus && occupied ? (<WifiTetheringIcon style={{ color: 'red' }} />) : ('')}
      {!deviceConnectionStatus ? (<WifiTetheringOffIcon style={{ color: 'red' }}/>) : ('')}
      { showMessage
        && (<Snackbar
        open={ true }
          onClose={handleClose}
        TransitionComponent={Fade}
        message={alertMessage }
          key={'fade'}
          autoHideDuration={5000}
        />)}
    </IconButton>
  );
}
