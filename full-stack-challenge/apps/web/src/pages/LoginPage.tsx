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
import { useTranslation } from '../lib/i18n/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

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
  const { t } = useTranslation();

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
      errors.email = t('login.emailInvalid');
    }

    if (password.length === 0) {
      errors.password = t('login.passwordRequired');
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    void dispatch(login({ email, password }));
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
      <LanguageSwitcher
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 10,
          color: { xs: 'primary.main', sm: '#fff' },
        }}
      />

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
          <Stack spacing={1} sx={{ mb: 4, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h1">{t('login.title')}</Typography>
            <Typography color="text.secondary">{t('login.subtitle')}</Typography>
          </Stack>

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label={t('login.email')}
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
                label={t('login.password')}
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
                {isSubmitting ? t('login.submitting') : t('login.submit')}
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
          width: { xs: '100%', sm: '45%' },
          p: { xs: 4, sm: 6 },
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #3B162C 0%, #250d1c 100%)',
        }}
      >
        <SensorsIcon
          sx={{
            position: 'absolute',
            fontSize: { xs: 200, sm: 420 },
            opacity: 0.06,
            top: -60,
            right: -80,
            color: '#fff',
            pointerEvents: 'none',
          }}
        />

        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
          Dynamox
        </Typography>
        <Typography variant="h1" sx={{ color: '#fff', fontSize: '2.25rem', mb: 2 }}>
          DynaPredict
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 360 }}>
          {t('login.brandTagline')}
        </Typography>
      </Box>
    </Box>
  );
}