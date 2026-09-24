import { IconButton, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import LanguageIcon from '@mui/icons-material/esm/Language';
import { useState } from 'react';
import { useTranslation } from '../lib/i18n/LanguageContext';
import type { Language } from '../lib/i18n/translations';

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
];

interface LanguageSwitcherProps {
  sx?: SxProps<Theme>;
}

export default function LanguageSwitcher({ sx }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function handleSelect(value: Language) {
    setLanguage(value);
    setAnchorEl(null);
  }

  return (
    <>
      <Tooltip title={t('appbar.languageToggle')}>
        <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} sx={sx}>
          <LanguageIcon />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {LANGUAGE_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === language}
            onClick={() => handleSelect(option.value)}
          >
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}