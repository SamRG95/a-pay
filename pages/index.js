import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Redirigir según el rol
        if (user.rol === 'admin') {
          router.push('/admin');
        } else if (user.rol === 'modulo') {
          router.push('/modulo');
        } else if (user.rol === 'banco') {
          router.push('/banco');
        }
      }
    }
  }, [user, loading, router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#23272b',
        color: '#FFE066'
      }}
    >
      <CircularProgress sx={{ color: '#FFE066', mb: 2 }} />
      <Typography variant="h6">Redirigiendo...</Typography>
    </Box>
  );
} 