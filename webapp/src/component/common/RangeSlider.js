// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Logger from '../../framework/logger/Logger';

function valuetext(value) {
  return `${value}°C`;
}

export default function RangeSlider(props) {
  const [value, setValue] = React.useState([props.ValueA, props.ValueB]);
  const [title, setTitle] = React.useState(props.Title);
  const [min, setMin] = React.useState(props.Min);
  const [max, setMax] = React.useState(props.Max)

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: 450 }}>
      <Typography id="input-slider" gutterBottom>
        { title}
      </Typography>
      <Slider
        getAriaLabel={() => 'Temperature range'}
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
      />
    </Box>
  );
}
