export type Language = 'pt' | 'en';

export type TranslationKey =
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.logout'
  | 'common.connectionError'
  | 'common.unexpectedError'
  | 'common.saving'
  | 'common.deleting'
  | 'nav.dashboard'
  | 'nav.machines'
  | 'nav.monitoringPoints'
  | 'appbar.languageToggle'
  | 'login.title'
  | 'login.subtitle'
  | 'login.email'
  | 'login.password'
  | 'login.emailInvalid'
  | 'login.passwordRequired'
  | 'login.submitting'
  | 'login.submit'
  | 'login.brandTagline'
  | 'machineType.pump'
  | 'machineType.fan'
  | 'dashboard.subtitle'
  | 'dashboard.totalMachines'
  | 'dashboard.totalPoints'
  | 'dashboard.machinesByType'
  | 'dashboard.quantity'
  | 'dashboard.avgTemperatureByType'
  | 'dashboard.average'
  | 'dashboard.liveLatency'
  | 'dashboard.measuredInBrowser'
  | 'dashboard.serverReported'
  | 'dashboard.withinLimit'
  | 'dashboard.aboveLimit'
  | 'dashboard.measureAgain'
  | 'dashboard.measuring'
  | 'dashboard.footerCredit'
  | 'dashboard.footerStack'
  | 'machines.subtitle'
  | 'machines.newMachine'
  | 'machines.empty'
  | 'machines.columnName'
  | 'machines.columnType'
  | 'machines.columnActions'
  | 'machines.editTitle'
  | 'machines.nameRequired'
  | 'machines.typeRequired'
  | 'machines.saveError'
  | 'machines.deleteError'
  | 'machines.updateSuccess'
  | 'machines.createSuccess'
  | 'machines.deleteSuccess'
  | 'machines.deleteConfirmTitle'
  | 'machines.deleteConfirmPrefix'
  | 'machines.deleteConfirmSuffix'
  | 'monitoringPoints.subtitle'
  | 'monitoringPoints.newPoint'
  | 'monitoringPoints.helpTooltip'
  | 'monitoringPoints.columnMachineName'
  | 'monitoringPoints.columnMachineType'
  | 'monitoringPoints.columnPointName'
  | 'monitoringPoints.columnSensorModel'
  | 'monitoringPoints.columnActions'
  | 'monitoringPoints.noSensor'
  | 'monitoringPoints.associateSensor'
  | 'monitoringPoints.createTitle'
  | 'monitoringPoints.machineLabel'
  | 'monitoringPoints.createFirstMachineHint'
  | 'monitoringPoints.pointNameLabel'
  | 'monitoringPoints.pointNamePlaceholder'
  | 'monitoringPoints.create'
  | 'monitoringPoints.editTitle'
  | 'monitoringPoints.associateSensorTitle'
  | 'monitoringPoints.serialNumberLabel'
  | 'monitoringPoints.modelLabel'
  | 'monitoringPoints.pumpRestrictionHint'
  | 'monitoringPoints.associate'
  | 'monitoringPoints.serialNumberRequired'
  | 'monitoringPoints.modelRequired'
  | 'monitoringPoints.machineRequired'
  | 'monitoringPoints.pointNameRequired'
  | 'monitoringPoints.sensorAssociatedSuccess'
  | 'monitoringPoints.pointCreatedSuccess'
  | 'monitoringPoints.pointUpdatedSuccess'
  | 'monitoringPoints.pointDeletedSuccess'
  | 'monitoringPoints.deleteConfirmTitle'
  | 'monitoringPoints.deleteConfirmPrefix'
  | 'monitoringPoints.deleteConfirmSuffix'
  | 'monitoringPointDetail.title'
  | 'monitoringPointDetail.subtitle'
  | 'monitoringPointDetail.backDefault'
  | 'monitoringPointDetail.seriesLabel'
  | 'monitoringPointDetail.deleteSeriesButton'
  | 'monitoringPointDetail.totalReadings'
  | 'monitoringPointDetail.minimum'
  | 'monitoringPointDetail.maximum'
  | 'monitoringPointDetail.chartTab'
  | 'monitoringPointDetail.tableTab'
  | 'monitoringPointDetail.noReadingsFound'
  | 'monitoringPointDetail.noSensorAssociated'
  | 'monitoringPointDetail.dateTimeColumn'
  | 'monitoringPointDetail.forecastTitle'
  | 'monitoringPointDetail.forecastLabel'
  | 'monitoringPointDetail.forecastDisclaimer'
  | 'monitoringPointDetail.deleteSeriesTitle'
  | 'monitoringPointDetail.deleteSeriesPrefix'
  | 'monitoringPointDetail.deleteSeriesSuffix'
  | 'monitoringPointDetail.deleteSeriesError'
  | 'monitoringPointDetail.deleteSeriesSuccess'
  | 'series.temperature'
  | 'series.velocityX'
  | 'series.velocityY'
  | 'series.velocityZ'
  | 'series.accelerationX'
  | 'series.accelerationY'
  | 'series.accelerationZ';

const pt: Record<TranslationKey, string> = {
  'common.cancel': 'Cancelar',
  'common.save': 'Salvar',
  'common.delete': 'Excluir',
  'common.logout': 'Sair',
  'common.connectionError': 'Não foi possível conectar ao servidor',
  'common.unexpectedError': 'Erro inesperado',
  'common.saving': 'Salvando...',
  'common.deleting': 'Excluindo...',
  'nav.dashboard': 'Dashboard',
  'nav.machines': 'Máquinas',
  'nav.monitoringPoints': 'Pontos de monitoramento',
  'appbar.languageToggle': 'Mudar idioma',
  'login.title': 'Boas-vindas!',
  'login.subtitle': 'Preencha as informações para acessar sua conta',
  'login.email': 'E-mail',
  'login.password': 'Senha',
  'login.emailInvalid': 'Informe um e-mail válido',
  'login.passwordRequired': 'Informe sua senha',
  'login.submitting': 'Entrando...',
  'login.submit': 'Entrar com e-mail e senha',
  'login.brandTagline':
    'Sua parceira especialista no monitoramento de saúde e performance de ativos.',
  'machineType.pump': 'Bomba',
  'machineType.fan': 'Ventilador',
  'dashboard.subtitle': 'Resumo do parque de ativos monitorados',
  'dashboard.totalMachines': 'Total de máquinas',
  'dashboard.totalPoints': 'Total de pontos de monitoramento',
  'dashboard.machinesByType': 'Máquinas por tipo',
  'dashboard.quantity': 'Quantidade',
  'dashboard.avgTemperatureByType': 'Temperatura média por tipo',
  'dashboard.average': 'Média',
  'dashboard.liveLatency': 'Latência da API ao vivo',
  'dashboard.measuredInBrowser': 'Medido no navegador (ida e volta completa)',
  'dashboard.serverReported': 'Servidor reportou',
  'dashboard.withinLimit': 'Dentro do limite de 350ms',
  'dashboard.aboveLimit': 'Acima do limite de 350ms',
  'dashboard.measureAgain': 'Medir novamente',
  'dashboard.measuring': 'Medindo...',
  'dashboard.footerCredit': 'Desafio Full-Stack Dynamox — desenvolvido por',
  'dashboard.footerStack':
    'React · TypeScript · Redux Toolkit · MUI 5 · Node.js · Express · Prisma · PostgreSQL',
  'machines.subtitle': 'Gerencie o parque de ativos monitorados',
  'machines.newMachine': 'Nova máquina',
  'machines.empty': 'Nenhuma máquina cadastrada ainda.',
  'machines.columnName': 'Nome',
  'machines.columnType': 'Tipo',
  'machines.columnActions': 'Ações',
  'machines.editTitle': 'Editar máquina',
  'machines.nameRequired': 'Informe o nome da máquina',
  'machines.typeRequired': 'Selecione o tipo da máquina',
  'machines.saveError': 'Não foi possível salvar a máquina',
  'machines.deleteError': 'Não foi possível excluir a máquina',
  'machines.updateSuccess': 'Máquina atualizada com sucesso',
  'machines.createSuccess': 'Máquina criada com sucesso',
  'machines.deleteSuccess': 'Máquina excluída com sucesso',
  'machines.deleteConfirmTitle': 'Excluir máquina',
  'machines.deleteConfirmPrefix': 'Tem certeza que deseja excluir ',
  'machines.deleteConfirmSuffix': '? Essa ação não pode ser desfeita.',
  'monitoringPoints.subtitle': 'Consulte os pontos e sensores de todas as máquinas',
  'monitoringPoints.newPoint': 'Novo ponto',
  'monitoringPoints.helpTooltip':
    'Clique em qualquer linha da tabela para abrir a série temporal (gráfico e métricas) daquele ponto de monitoramento.',
  'monitoringPoints.columnMachineName': 'Nome da Máquina',
  'monitoringPoints.columnMachineType': 'Tipo de Máquina',
  'monitoringPoints.columnPointName': 'Nome do Ponto',
  'monitoringPoints.columnSensorModel': 'Modelo do Sensor',
  'monitoringPoints.columnActions': 'Ações',
  'monitoringPoints.noSensor': 'Sem sensor',
  'monitoringPoints.associateSensor': 'Associar sensor',
  'monitoringPoints.createTitle': 'Novo ponto de monitoramento',
  'monitoringPoints.machineLabel': 'Máquina',
  'monitoringPoints.createFirstMachineHint': 'Cadastre uma máquina primeiro',
  'monitoringPoints.pointNameLabel': 'Nome do ponto',
  'monitoringPoints.pointNamePlaceholder': 'Ex.: Mancal Dianteiro',
  'monitoringPoints.create': 'Criar',
  'monitoringPoints.editTitle': 'Editar ponto de monitoramento',
  'monitoringPoints.associateSensorTitle': 'Associar sensor',
  'monitoringPoints.serialNumberLabel': 'Número de série',
  'monitoringPoints.modelLabel': 'Modelo',
  'monitoringPoints.pumpRestrictionHint':
    'TcAg e TcAs não são compatíveis com máquinas do tipo Bomba',
  'monitoringPoints.associate': 'Associar',
  'monitoringPoints.serialNumberRequired': 'Informe o número de série do sensor',
  'monitoringPoints.modelRequired': 'Selecione o modelo do sensor',
  'monitoringPoints.machineRequired': 'Selecione a máquina',
  'monitoringPoints.pointNameRequired': 'Informe o nome do ponto',
  'monitoringPoints.sensorAssociatedSuccess': 'Sensor associado com sucesso',
  'monitoringPoints.pointCreatedSuccess': 'Ponto de monitoramento criado com sucesso',
  'monitoringPoints.pointUpdatedSuccess': 'Ponto de monitoramento atualizado com sucesso',
  'monitoringPoints.pointDeletedSuccess': 'Ponto de monitoramento excluído com sucesso',
  'monitoringPoints.deleteConfirmTitle': 'Excluir ponto de monitoramento',
  'monitoringPoints.deleteConfirmPrefix': 'Tem certeza que deseja excluir ',
  'monitoringPoints.deleteConfirmSuffix':
    '? O sensor associado e todas as leituras desse ponto também serão excluídos permanentemente.',
  'monitoringPointDetail.title': 'Série temporal',
  'monitoringPointDetail.subtitle': 'Detalhe do ponto de monitoramento',
  'monitoringPointDetail.backDefault': 'Voltar para pontos de monitoramento',
  'monitoringPointDetail.seriesLabel': 'Série',
  'monitoringPointDetail.deleteSeriesButton': 'Excluir dados desta série',
  'monitoringPointDetail.totalReadings': 'Total de leituras',
  'monitoringPointDetail.minimum': 'Mínimo',
  'monitoringPointDetail.maximum': 'Máximo',
  'monitoringPointDetail.chartTab': 'Gráfico',
  'monitoringPointDetail.tableTab': 'Tabela',
  'monitoringPointDetail.noReadingsFound': 'Nenhuma leitura encontrada para esta série.',
  'monitoringPointDetail.noSensorAssociated':
    'Este ponto de monitoramento ainda não tem um sensor associado. Associe um sensor para visualizar dados de série temporal.',
  'monitoringPointDetail.dateTimeColumn': 'Data e hora',
  'monitoringPointDetail.forecastTitle': 'Previsão para os próximos 7 dias',
  'monitoringPointDetail.forecastLabel': 'Previsão',
  'monitoringPointDetail.forecastDisclaimer':
    'Estimativa por regressão linear simples a partir do histórico da série. Quanto mais irregular a série (ex.: aceleração), menos confiável é essa tendência.',
  'monitoringPointDetail.deleteSeriesTitle': 'Excluir série',
  'monitoringPointDetail.deleteSeriesPrefix':
    'Tem certeza que deseja excluir todos os dados da série "',
  'monitoringPointDetail.deleteSeriesSuffix': '"? Essa ação não pode ser desfeita.',
  'monitoringPointDetail.deleteSeriesError': 'Não foi possível excluir a série',
  'monitoringPointDetail.deleteSeriesSuccess': 'Série excluída com sucesso',
  'series.temperature': 'Temperatura',
  'series.velocityX': 'Velocidade RMS X',
  'series.velocityY': 'Velocidade RMS Y',
  'series.velocityZ': 'Velocidade RMS Z',
  'series.accelerationX': 'Aceleração RMS X',
  'series.accelerationY': 'Aceleração RMS Y',
  'series.accelerationZ': 'Aceleração RMS Z',
};

const en: Record<TranslationKey, string> = {
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.logout': 'Log out',
  'common.connectionError': 'Could not connect to the server',
  'common.unexpectedError': 'Unexpected error',
  'common.saving': 'Saving...',
  'common.deleting': 'Deleting...',
  'nav.dashboard': 'Dashboard',
  'nav.machines': 'Machines',
  'nav.monitoringPoints': 'Monitoring points',
  'appbar.languageToggle': 'Change language',
  'login.title': 'Welcome!',
  'login.subtitle': 'Fill in your details to access your account',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.emailInvalid': 'Enter a valid email',
  'login.passwordRequired': 'Enter your password',
  'login.submitting': 'Signing in...',
  'login.submit': 'Sign in with email and password',
  'login.brandTagline': 'Your expert partner in monitoring asset health and performance.',
  'machineType.pump': 'Pump',
  'machineType.fan': 'Fan',
  'dashboard.subtitle': 'Summary of the monitored asset fleet',
  'dashboard.totalMachines': 'Total machines',
  'dashboard.totalPoints': 'Total monitoring points',
  'dashboard.machinesByType': 'Machines by type',
  'dashboard.quantity': 'Quantity',
  'dashboard.avgTemperatureByType': 'Average temperature by type',
  'dashboard.average': 'Average',
  'dashboard.liveLatency': 'Live API latency',
  'dashboard.measuredInBrowser': 'Measured in the browser (full round trip)',
  'dashboard.serverReported': 'Server reported',
  'dashboard.withinLimit': 'Within the 350ms limit',
  'dashboard.aboveLimit': 'Above the 350ms limit',
  'dashboard.measureAgain': 'Measure again',
  'dashboard.measuring': 'Measuring...',
  'dashboard.footerCredit': 'Dynamox Full-Stack Challenge — built by',
  'dashboard.footerStack':
    'React · TypeScript · Redux Toolkit · MUI 5 · Node.js · Express · Prisma · PostgreSQL',
  'machines.subtitle': 'Manage the monitored asset fleet',
  'machines.newMachine': 'New machine',
  'machines.empty': 'No machines registered yet.',
  'machines.columnName': 'Name',
  'machines.columnType': 'Type',
  'machines.columnActions': 'Actions',
  'machines.editTitle': 'Edit machine',
  'machines.nameRequired': 'Enter the machine name',
  'machines.typeRequired': 'Select the machine type',
  'machines.saveError': 'Could not save the machine',
  'machines.deleteError': 'Could not delete the machine',
  'machines.updateSuccess': 'Machine updated successfully',
  'machines.createSuccess': 'Machine created successfully',
  'machines.deleteSuccess': 'Machine deleted successfully',
  'machines.deleteConfirmTitle': 'Delete machine',
  'machines.deleteConfirmPrefix': 'Are you sure you want to delete ',
  'machines.deleteConfirmSuffix': '? This action cannot be undone.',
  'monitoringPoints.subtitle': 'View the monitoring points and sensors of every machine',
  'monitoringPoints.newPoint': 'New point',
  'monitoringPoints.helpTooltip':
    'Click any row in the table to open the time series (chart and metrics) for that monitoring point.',
  'monitoringPoints.columnMachineName': 'Machine Name',
  'monitoringPoints.columnMachineType': 'Machine Type',
  'monitoringPoints.columnPointName': 'Monitoring Point Name',
  'monitoringPoints.columnSensorModel': 'Sensor Model',
  'monitoringPoints.columnActions': 'Actions',
  'monitoringPoints.noSensor': 'No sensor',
  'monitoringPoints.associateSensor': 'Associate sensor',
  'monitoringPoints.createTitle': 'New monitoring point',
  'monitoringPoints.machineLabel': 'Machine',
  'monitoringPoints.createFirstMachineHint': 'Register a machine first',
  'monitoringPoints.pointNameLabel': 'Point name',
  'monitoringPoints.pointNamePlaceholder': 'E.g.: Front Bearing',
  'monitoringPoints.create': 'Create',
  'monitoringPoints.editTitle': 'Edit monitoring point',
  'monitoringPoints.associateSensorTitle': 'Associate sensor',
  'monitoringPoints.serialNumberLabel': 'Serial number',
  'monitoringPoints.modelLabel': 'Model',
  'monitoringPoints.pumpRestrictionHint': 'TcAg and TcAs are not compatible with Pump machines',
  'monitoringPoints.associate': 'Associate',
  'monitoringPoints.serialNumberRequired': 'Enter the sensor serial number',
  'monitoringPoints.modelRequired': 'Select the sensor model',
  'monitoringPoints.machineRequired': 'Select the machine',
  'monitoringPoints.pointNameRequired': 'Enter the point name',
  'monitoringPoints.sensorAssociatedSuccess': 'Sensor associated successfully',
  'monitoringPoints.pointCreatedSuccess': 'Monitoring point created successfully',
  'monitoringPoints.pointUpdatedSuccess': 'Monitoring point updated successfully',
  'monitoringPoints.pointDeletedSuccess': 'Monitoring point deleted successfully',
  'monitoringPoints.deleteConfirmTitle': 'Delete monitoring point',
  'monitoringPoints.deleteConfirmPrefix': 'Are you sure you want to delete ',
  'monitoringPoints.deleteConfirmSuffix':
    '? The associated sensor and all readings for this point will also be permanently deleted.',
  'monitoringPointDetail.title': 'Time series',
  'monitoringPointDetail.subtitle': 'Monitoring point details',
  'monitoringPointDetail.backDefault': 'Back to monitoring points',
  'monitoringPointDetail.seriesLabel': 'Series',
  'monitoringPointDetail.deleteSeriesButton': 'Delete this series data',
  'monitoringPointDetail.totalReadings': 'Total readings',
  'monitoringPointDetail.minimum': 'Minimum',
  'monitoringPointDetail.maximum': 'Maximum',
  'monitoringPointDetail.chartTab': 'Chart',
  'monitoringPointDetail.tableTab': 'Table',
  'monitoringPointDetail.noReadingsFound': 'No readings found for this series.',
  'monitoringPointDetail.noSensorAssociated':
    'This monitoring point does not have a sensor associated yet. Associate a sensor to view time-series data.',
  'monitoringPointDetail.dateTimeColumn': 'Date and time',
  'monitoringPointDetail.forecastTitle': 'Forecast for the next 7 days',
  'monitoringPointDetail.forecastLabel': 'Forecast',
  'monitoringPointDetail.forecastDisclaimer':
    'Estimate from a simple linear regression over the series history. The more irregular the series (e.g. acceleration), the less reliable this trend is.',
  'monitoringPointDetail.deleteSeriesTitle': 'Delete series',
  'monitoringPointDetail.deleteSeriesPrefix':
    'Are you sure you want to delete all the data for the series "',
  'monitoringPointDetail.deleteSeriesSuffix': '"? This action cannot be undone.',
  'monitoringPointDetail.deleteSeriesError': 'Could not delete the series',
  'monitoringPointDetail.deleteSeriesSuccess': 'Series deleted successfully',
  'series.temperature': 'Temperature',
  'series.velocityX': 'Velocity RMS X',
  'series.velocityY': 'Velocity RMS Y',
  'series.velocityZ': 'Velocity RMS Z',
  'series.accelerationX': 'Acceleration RMS X',
  'series.accelerationY': 'Acceleration RMS Y',
  'series.accelerationZ': 'Acceleration RMS Z',
};

export const dictionaries: Record<Language, Record<TranslationKey, string>> = { pt, en };

export const LANGUAGE_STORAGE_KEY = 'dynamox.language';

export function getStoredLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return stored === 'en' ? 'en' : 'pt';
}

export function storeLanguage(language: Language): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}