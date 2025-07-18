import React, { useState, useEffect } from 'react';
import { FormControlLabel, Checkbox, Stack, Box, Paper, Typography, Button } from '@mui/material';
import RegisterCtrl from '../../control/RegisterCtrl';
import EventPublisher from '../../framework/event/EventPublisher';
import { EventDef } from '../../framework/event/EventDef';
import Resource from '../../framework/resource/Resource';
import ConsentCtrl from '../../control/ConsentsCtrl';
import Cookies from 'js-cookie'; // Import js-cookie library
import DoneAllIcon from '@mui/icons-material/DoneAll';

function ConfirmConsent({ consentList }) {
    const [consents, setConsents] = useState(consentList); // List of consents
    const [agreements, setAgreements] = useState({}); // Track agreement for each consent

    useEffect(() => {
        const consentKey = `consents_${RegisterCtrl.year}_${RegisterCtrl.term}`;
        const storedConsentStatus = Cookies.get(consentKey); // Retrieve consent status from cookies
        console.log('consent status', consentKey, storedConsentStatus);
        if (storedConsentStatus === 'agreed') {
            EventPublisher.publish(EventDef.onMenuChanged, 'Login');
            return;
        } else {
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
    }, [RegisterCtrl.year, RegisterCtrl.term]);

    const handleAgreementChange = (consentId) => {
        setAgreements((prev) => ({
            ...prev,
            [consentId]: !prev[consentId], // Toggle agreement state
        }));
    };

    const handleStartEnrollment = () => {
        const consentKey = `consents_${RegisterCtrl.year}_${RegisterCtrl.term}`;
        Cookies.set(consentKey, 'agreed', { expires: 365 }); // Store consent status in cookies for 1 year
        console.log('consent saved', consentKey);
        EventPublisher.publish(EventDef.onMenuChanged, 'Login');
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
                    <div key={consent.id}>
                        <Typography variant="h6" sx={{ color: '#333', textAlign: 'left' }}>
                            [{consent.title}]
                        </Typography>
                        <Paper style={{
                            padding: 16,
                            maxHeight: 500,
                            maxWidth: 900,
                            overflowY: 'auto',
                            backgroundColor: 'white',
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
                    onClick={handleStartEnrollment}
                    disabled={agreements == {} || !Object.values(agreements).every(v => v !== false)}
                    startIcon={<DoneAllIcon/>}
                >{Resource.get('consents.start_enrollment')}</Button>
            </Stack>
        </Box>
    );
}

export default ConfirmConsent;