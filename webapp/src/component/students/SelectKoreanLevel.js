import React, { useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, Button, Typography } from '@mui/material';
import Defines from '../Defines';
import Resource from '../../framework/resource/Resource';
import Logger from '../../framework/logger/Logger';

export default function SelectKoreanLevel({ open, onClose, onSelect, currentLevel, hideUnknown = false }) {
    const [selectedLevel, setSelectedLevel] = useState(currentLevel);

    const handleSelect = () => {
        if (selectedLevel !== null) {
            onSelect(selectedLevel);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{Resource.get('students.select_korean_level_title')}</DialogTitle>
            <DialogContent>
                <RadioGroup
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(Number(e.target.value))}
                >
                    {Defines.koreanLevelOptions.map((option) => (
                        !(hideUnknown && option.level==0) && 
                        <Box><FormControlLabel
                            key={option.level}
                            value={option.level}
                            control={<Radio />}
                            label={`${option.level}. ${option.label}`}
                        />
                        {option.example && (
                            <Typography variant="body2" color="textSecondary" sx={{ marginLeft: 4 }}>
                                {`예) ${option.example}`}
                            </Typography>
                        )}
                        </Box>
                    ))}
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose}>{Resource.get('common.dialog.cancel')}</Button>
                <Button variant="contained" onClick={handleSelect}>
                    {Resource.get('common.dialog.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

