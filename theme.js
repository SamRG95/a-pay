import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFE066', // dorado brillante
      contrastText: '#000000',
    },
    secondary: {
      main: '#212121', // negro/gris oscuro
      contrastText: '#FFE066',
    },
    background: {
      default: '#f5f5f5', // gris claro
      paper: '#212121',
    },
    text: {
      primary: '#212121',
      secondary: '#FFE066',
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          '&[color="primary"]': {
            textShadow: '0 0 8px #fffbe6, 0 0 4px #ffe066',
          },
        },
      },
    },
  },
});

export default theme; 