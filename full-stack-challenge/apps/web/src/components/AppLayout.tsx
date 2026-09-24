import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/esm/DashboardOutlined';
import LogoutIcon from '@mui/icons-material/esm/LogoutOutlined';
import MenuIcon from '@mui/icons-material/esm/Menu';
import PrecisionManufacturingIcon from '@mui/icons-material/esm/PrecisionManufacturingOutlined';
import SensorsIcon from '@mui/icons-material/esm/SensorsOutlined';
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useTranslation } from '../lib/i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const DRAWER_WIDTH = 260;

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const navItems = [
    { label: t('nav.dashboard'), path: '/', icon: <DashboardIcon /> },
    { label: t('nav.machines'), path: '/machines', icon: <PrecisionManufacturingIcon /> },
    { label: t('nav.monitoringPoints'), path: '/monitoring-points', icon: <SensorsIcon /> },
  ];

  function handleLogout() {
    setMenuAnchor(null);
    void dispatch(logout());
  }

  const navList = (
    <List sx={{ px: 1 }}>
      {navItems.map((item) => (
        <ListItemButton
          key={item.path}
          component={Link}
          to={item.path}
          selected={location.pathname === item.path}
          onClick={() => setMobileOpen(false)}
          sx={{ borderRadius: 1, mb: 0.5 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="primary"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen((prev) => !prev)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dynamox
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1.5}>
            <LanguageSwitcher sx={{ color: 'inherit' }} />

            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.name}
            </Typography>
            <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name.charAt(0)}
              </Avatar>
            </IconButton>
          </Stack>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              {t('common.logout')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Divider />
        {navList}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}