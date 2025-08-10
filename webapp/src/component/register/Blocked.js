// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Logger from '../../framework/logger/Logger';
import Resource from '../../framework/resource/Resource'
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import { Stack } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';

const defaultTheme = createTheme({
    palette: {
        primary: {
            main: '#2D393B',
        },
    },
});

export default function Blocked() {

    const [openingTime, setOpeningTime] = React.useState(RegisterCtrl.openingDate);
    const [closingTime, setClosingTime] = React.useState(RegisterCtrl.closingDate);
    const [currentTime, setCurrentTime] = React.useState(new Date(new Date().getTime() + (RegisterCtrl.timeCompensation || 0)));
    const MODULE = 'Blocked';

    useEffect(() => {
        EventPublisher.addEventListener(EventDef.onScheduleListChange, MODULE, onScheduleListChange);
        const intervalId = setInterval(() => {
            const present = new Date(new Date().getTime() + (RegisterCtrl.timeCompensation || 0));
            setCurrentTime(new Date(new Date().getTime() + (RegisterCtrl.timeCompensation || 0)));

            Logger.debug('Current Time:', present);
            if (RegisterCtrl.openingDate <= present && present <= RegisterCtrl.closingDate) {
                EventPublisher.publish(EventDef.onMenuChanged, 'Login');
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
            EventPublisher.removeEventListener(EventDef.onScheduleListChange, MODULE);
        };

    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onScheduleListChange = (schedules) => {
        setOpeningTime(RegisterCtrl.openingDate);
        setClosingTime(RegisterCtrl.closingDate);
    }

    return (

        <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={{
                width: '100%',
                height: '50vh', // Full viewport height
                textAlign: 'center', // Center text alignment
                backgroundColor: '#f9f9f9', // Optional background color
            }}
        >
            {(openingTime - currentTime >= 0) && <div>

                <Typography variant="h6" component="div">
                    {Resource.get('blocked.opening_time', openingTime ? openingTime.toLocaleDateString() + ' ' + openingTime.toTimeString().slice(0, 8) : 'Not Set')}
                </Typography>
                <Typography variant="h6" component="div">
                    {Resource.get('blocked.closing_time',closingTime ? closingTime.toLocaleDateString() + ' ' + closingTime.toTimeString().slice(0, 8) : 'Not Set')}
                </Typography>
                <Box sx={{ height: 50 }} />
                <Typography variant="h4" component="div" sx={{ color: 'blue' }}>
                    {Resource.get('blocked.remaining_time', openingTime ? (() => {
                        const diff = openingTime - currentTime;
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                        if (days > 0) return Resource.get('blocked.time_format_1', days, hours, minutes, seconds);
                        else if (hours > 0) return Resource.get('blocked.time_format_2', hours, minutes, seconds);
                        else if (minutes > 0) return Resource.get('blocked.time_format_3', minutes, seconds);
                        else return Resource.get('blocked.time_format_4', seconds);
                    })() : 'Not Set')}
                </Typography>
                <Box sx={{ height: 15 }} />
                <Typography variant="h6" component="div">
                    {Resource.get('blocked.automatic_refresh')}
                </Typography>
            </div>
            }
            {
                (closingTime-currentTime < 0) && <div>
                <Typography variant="h6" component="div">
                    {Resource.get('blocked.closed_enrollment')} ({closingTime ? closingTime.toLocaleDateString() + ' ' + closingTime.toTimeString().slice(0, 8) : 'Not Set'})
                </Typography>
                </div>
            }
        </Stack>

    );
}