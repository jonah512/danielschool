import React, { useState, useEffect } from 'react';
import { FormControl, FormLabel, FormControlLabel, Checkbox, Stack, Box, Paper, Typography, Button } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl'; // Import the RegisterCtrl
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Resource from '../../framework/resource/Resource';
import ConsentCtrl from '../../control/ConsentsCtrl';
import Register from './Register';

function ConfirmConsent({ consentList }) {
    const [consents, setConsents] = useState(consentList); // List of consents
    const [agreements, setAgreements] = useState({}); // Track agreement for each consent

    useEffect(() => {

        console.log('consents agree:', localStorage.getItem('consents' + RegisterCtrl.year + RegisterCtrl.term));
        if (localStorage.getItem('consents' + RegisterCtrl.year + RegisterCtrl.term) === 'agreed') {
            EventPublisher.publish(EventDef.onMenuChanged, 'Login');
            return;
        }
        else {
            // Fetch consents from RegisterCtrl or API
            const fetchConsents = async () => {
                const consent_control = new ConsentCtrl(window.APIURL);
                const fetchedConsents = await consent_control.getConsentsSync();
                if (!fetchedConsents || fetchedConsents.length === 0) {
                    EventPublisher.publish(EventDef.onMenuChanged, 'Login');
                }
                setConsents(fetchedConsents);
                setAgreements(fetchedConsents.reduce((acc, consent) => {
                    acc[consent.id] = false;
                    return acc;
                }, {}));
            };

            fetchConsents();
        }
    }, []);

    const handleAgreementChange = (consentId) => {
        setAgreements((prev) => ({
            ...prev,
            [consentId]: !prev[consentId], // Toggle agreement state
        }));
    };

    return (
        <Box sx={{ width: '100%', maxHeight: '70vh', overflowY: 'auto', backgroundColor: '#f4f4f4' }}>
            <Box sx={{ height: 10 }} />
            <Stack
                spacing={3}
                alignItems="center"
                justifyContent="center"
            >
                <Typography variant="h4" sx={{ color: '#333', textAlign: 'center' }}>
                    {Resource.get('consents.consent_title')}</Typography>

                {consents?.map((consent) => (
                    <div>
                        <Typography variant="h6" sx={{ color: '#333', textAlign: 'left' }}>
                            [{consent.title}]
                        </Typography>
                        <Paper style={{
                            padding: 16,
                            maxHeight: 500,  // Adjusted for potential header space
                            maxWidth: 900,
                            overflowY: 'auto',
                            backgroundColor: 'white',  // Background to black for the whole component
                        }}>

                            <Typography component="pre" style={{
                                whiteSpace: 'pre-wrap',
                                color: 'black',
                                fontSize: '14px'
                            }}>
                                {consent.content + consent.content_eng}
                            </Typography>

                        </Paper>
                        <FormControlLabel
                            key={consent.id}
                            control={
                                <Checkbox
                                    checked={agreements[consent.id] || false}
                                    onChange={() => handleAgreementChange(consent.id)}
                                />
                            }
                            label={Resource.get('consents.agree')}
                        />
                    </div>
                ))}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        EventPublisher.publish(EventDef.onMenuChanged, 'Login');
                        localStorage.setItem('consents' + RegisterCtrl.year + RegisterCtrl.term, 'agreed');
                    }}
                    disabled={agreements == {} || !Object.values(agreements).every(v => v != false)}
                >{Resource.get('consents.start_enrollment')}</Button>
            </Stack>
        </Box>
    );
}

export default ConfirmConsent;