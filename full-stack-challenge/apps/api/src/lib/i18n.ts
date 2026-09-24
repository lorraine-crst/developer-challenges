export type Language = 'pt' | 'en';

const MESSAGES = {
  'machine.notFound': { pt: 'Máquina não encontrada', en: 'Machine not found' },
  'machine.duplicateName': {
    pt: 'Já existe uma máquina com este nome',
    en: 'A machine with this name already exists',
  },
  'machine.nameRequired': { pt: 'Informe o nome da máquina', en: 'Enter the machine name' },
  'monitoringPoint.notFound': {
    pt: 'Ponto de monitoramento não encontrado',
    en: 'Monitoring point not found',
  },
  'monitoringPoint.duplicateName': {
    pt: 'Já existe um ponto de monitoramento com este nome nesta máquina',
    en: 'A monitoring point with this name already exists on this machine',
  },
  'monitoringPoint.nameRequired': {
    pt: 'Informe o nome do ponto de monitoramento',
    en: 'Enter the monitoring point name',
  },
  'sensor.incompatibleWithPump': {
    pt: 'Sensores TcAg e TcAs não são compatíveis com máquinas do tipo Bomba',
    en: 'TcAg and TcAs sensors are not compatible with Pump machines',
  },
  'sensor.alreadyAssociated': {
    pt: 'Este ponto de monitoramento já possui um sensor associado',
    en: 'This monitoring point already has an associated sensor',
  },
  'sensor.duplicateSerialNumber': {
    pt: 'Já existe um sensor com este número de série',
    en: 'A sensor with this serial number already exists',
  },
  'sensor.serialNumberRequired': {
    pt: 'Informe o número de série do sensor',
    en: 'Enter the sensor serial number',
  },
  'auth.invalidCredentials': { pt: 'E-mail ou senha inválidos', en: 'Invalid email or password' },
  'auth.missingToken': {
    pt: 'Token de autenticação ausente',
    en: 'Missing authentication token',
  },
  'auth.invalidToken': {
    pt: 'Token de autenticação inválido',
    en: 'Invalid authentication token',
  },
  'auth.invalidEmailFormat': { pt: 'Formato de e-mail inválido', en: 'Invalid email format' },
  'auth.passwordRequired': { pt: 'Informe a senha', en: 'Enter the password' },
  'reading.seriesNameRequired': { pt: 'Informe o nome da série', en: 'Enter the series name' },
  'reading.atLeastOneRequired': {
    pt: 'É necessário enviar ao menos uma leitura',
    en: 'At least one reading is required',
  },
  'reading.batchTooLarge': {
    pt: 'O lote não pode exceder 5000 leituras',
    en: 'The batch cannot exceed 5000 readings',
  },
  'common.routeNotFound': { pt: 'Rota não encontrada', en: 'Route not found' },
  'common.validationFailed': { pt: 'Falha de validação', en: 'Validation failed' },
  'common.internalError': { pt: 'Erro interno do servidor', en: 'Internal server error' },
} as const;

export type MessageKey = keyof typeof MESSAGES;

export function translate(key: string, language: Language): string {
  const entry = MESSAGES[key as MessageKey];

  return entry ? entry[language] : key;
}

export function resolveLanguage(header: string | string[] | undefined): Language {
  const value = Array.isArray(header) ? header[0] : header;

  return value?.toLowerCase().startsWith('en') ? 'en' : 'pt';
}