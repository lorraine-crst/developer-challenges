import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h1">Entrar</Typography>
            <Typography color="text.secondary">
              Acesse o monitoramento de condição de ativos
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
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
                autoComplete="current-password"
                required
                fullWidth
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
        </CardContent>
      </Card>
    </Box>
  );
}