import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SensorsIcon from '@mui/icons-material/esm/SensorsOutlined';
import VisibilityIcon from '@mui/icons-material/esm/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/esm/VisibilityOffOutlined';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isSubmitting = status === 'loading';

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/', { replace: true });
    }
  }, [status, navigate]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: FieldErrors = {};

    if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Informe um e-mail válido';
    }

    if (password.length === 0) {
      errors.password = 'Informe sua senha';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    void dispatch(login({ email, password }));
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Stack spacing={1} sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h1">Boas-vindas!</Typography>
            <Typography color="text.secondary">
              Preencha as informações para acessar sua conta
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="E-mail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                autoComplete="email"
                autoFocus
                required
                fullWidth
              />

              <TextField
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
                autoComplete="current-password"
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar com e-mail e senha'}
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexShrink: 0,
          flexDirection: 'column',
          justifyContent: 'center',
          width: { xs: '100%', md: '45%' },
          p: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #3B162C 0%, #250d1c 100%)',
        }}
      >
        <SensorsIcon
          sx={{
            position: 'absolute',
            fontSize: { xs: 200, md: 420 },
            opacity: 0.06,
            top: -60,
            right: -80,
            color: '#fff',
          }}
        />

        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
          Dynamox
        </Typography>
        <Typography variant="h1" sx={{ color: '#fff', fontSize: '2.25rem', mb: 2 }}>
          DynaPredict
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 360 }}>
          Sua parceira especialista no monitoramento de saúde e performance de ativos.
        </Typography>
      </Box>
    </Box>
  );
}