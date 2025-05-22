// Copyright (c) 2025 Milal Daniel Korean School.
import * as React from 'react';
import { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import Logger from '../../framework/logger/Logger';

const Input = styled(MuiInput)`
  width: 42px;
`;

export default function InputSlider(props) {
  const [value, setValue] = React.useState(props.Value);
  const [title, setTitle] = React.useState(props.Title);
  const [min, setMin] = React.useState(props.Min);
  const [max, setMax] = React.useState(props.Max);
  const [step, setStep] = React.useState(props.Step);

  let modifiable = props.Modifiable !== undefined ? props.Modifiable : true;

  useEffect(() => {
    setValue(props.Value);
    setStep(props.step);
    setTitle(props.Title);
  }, [props]);


  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
    Logger.debug('slider changed:' + newValue);
    if (props.onValueChanged !== undefined) props.onValueChanged(newValue);

  };

  const handleInputChange = (event) => {
    let value = Number(event.target.value) < min ? min : Number(event.target.value);
    value = Number(event.target.value) > max ? max : value;
    Logger.debug('input changed:' + value);
    if (props.onValueChanged !== undefined) props.onValueChanged(value);
    setValue(event.target.value === '' ? 0 : value);
  };

  const handleBlur = () => {
    if (value < min) {
      setValue(min);
    } else if (value > max) {
      setValue(max);
    }
  };

  return (
    <Box sx={{ width: props.Width }}>
      <Typography id={"input-slider"} gutterBottom >
        { title}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <Slider
            value={typeof value === 'number' ? value : { value }}
            min={typeof min === 'number' ? min : { min }}
            max={typeof max === 'number' ? max : { max }}
            step={step}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            disabled={!modifiable}
          />
        </Grid>
        <Grid item>
          <Input
            value={value}
            size="small"
            disabled= {props.isTextDisabled}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={!modifiable}
            inputProps={{
              step: step,
              min: {min},
              max: { max },
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
            sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#2D393B"}, width: props.TextWidth}}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
