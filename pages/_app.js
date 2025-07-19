import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import RouteGuard from '../components/RouteGuard';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouteGuard>
        <Component {...pageProps} />
      </RouteGuard>
    </ThemeProvider>
  );
} 