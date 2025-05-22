// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function BasicSelect(props) {
  const [value, setValue] = React.useState(props.Value);
  let modifiable = props.Modifiable !== undefined ? props.Modifiable : true;

  useEffect(() => {
    setValue(props.Value);
  }, [props]);

  const handleChange = (event) => {
    setValue(event.target.value);
    if (props.onValueChanged !== undefined) props.onValueChanged(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">{props.Title}</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          label={ props.Title}
          onChange={handleChange}
          disabled={!modifiable}
        >
          {
            props.List.map((item, index) => (<MenuItem key={index} value={index}>{item}</MenuItem>))
          }

        </Select>
      </FormControl>
    </Box>
  );
}
