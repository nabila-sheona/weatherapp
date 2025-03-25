// app/theme/palette.ts
import { PaletteMode } from '@mui/material';

const lightPalette = {
  mode: 'light' as PaletteMode,
  primary: {
    main: '#FF8A00', // example from the design
  },
  secondary: {
    main: '#00B4D8',
  },
  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#333333',
    secondary: '#555555',
  },
};

const darkPalette = {
  mode: 'dark' as PaletteMode,
  primary: {
    main: '#FF8A00',
  },
  secondary: {
    main: '#00B4D8',
  },
  background: {
    default: '#121212',
    paper: '#1F1F1F',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
  },
};

export { lightPalette, darkPalette };
