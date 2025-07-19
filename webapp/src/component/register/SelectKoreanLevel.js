import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, Button } from '@mui/material';
import Defines from '../Defines';

export default function SelectKoreanLevel({ open, onClose, onSelect, currentLevel }) {
    const [selectedLevel, setSelectedLevel] = useState(currentLevel);

    const handleSelect = () => {
        if (selectedLevel !== null) {
            onSelect(selectedLevel);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Select Korean Level</DialogTitle>
            <DialogContent>
                <RadioGroup
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(Number(e.target.value))}
                >
                    {Defines.koreanLevelOptions.map((option) => (
                        <FormControlLabel
                            key={option.level}
                            value={option.level}
                            control={<Radio />}
                            label={`${option.level}: ${option.label}`}
                        />
                    ))}
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSelect} disabled={selectedLevel === null}>
                    Select
                    
                </Button>
            </DialogActions>
        </Dialog>
    );
}

