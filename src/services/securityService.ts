import { SecuritySettings, LoginHistory, UserSession, TwoFactorMethod } from '../types';

/**
 * @desc Security management service
 * Handles authentication security, 2FA, session management, and login history
 * Production-ready structure
 */

const SECURITY_SETTINGS_KEY = 'kithly_security_settings';

// ============================================
// MOCK DATA
// ============================================

const MOCK_SECURITY_SETTINGS: SecuritySettings = {
  passwordLastChanged: new Date(Date.now() - 86400000 * 60).toISOString(),
  twoFactorAuth: {
    enabled: false,
    method: 'sms'
  },
  trustedDevices: ['device_1', 'device_2'],
  loginNotifications: true,
  sessions: [
    {
      id: 'sess_1',
      deviceName: 'Chrome on Windows',
      deviceType: 'desktop',
      browser: 'Chrome 120.0',
      location: 'Lusaka, Zambia',
      ipAddress: '197.234.12.45',
      lastActive: new Date().toISOString(),
      isCurrent: true
    },
    {
      id: 'sess_2',
      deviceName: 'iPhone 13',
      deviceType: 'mobile',
      browser: 'Safari',
      location: 'Ndola, Zambia',
      ipAddress: '102.145.23.11',
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      isCurrent: false
    }
  ]
};

const MOCK_LOGIN_HISTORY: LoginHistory[] = [
  {
    id: 'log_1',
    timestamp: new Date().toISOString(),
    deviceName: 'Chrome on Windows',
    location: 'Lusaka, Zambia',
    ipAddress: '197.234.12.45',
    successful: true
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    deviceName: 'iPhone 13',
    location: 'Ndola, Zambia',
    ipAddress: '102.145.23.11',
    successful: true
  },
  {
    id: 'log_3',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    deviceName: 'Unknown Device',
    location: 'Kitwe, Zambia',
    ipAddress: '41.223.11.22',
    successful: false,
    failureReason: 'Incorrect password'
  }
];

// ============================================
// STORAGE FUNCTIONS
// ============================================

function getStoredSettings(): SecuritySettings {
  try {
    const stored = localStorage.getItem(SECURITY_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : MOCK_SECURITY_SETTINGS;
  } catch (error) {
    console.error('Error loading security settings:', error);
    return MOCK_SECURITY_SETTINGS;
  }
}

function saveSettings(settings: SecuritySettings): void {
  try {
    localStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving security settings:', error);
  }
}

// ============================================
// SECURITY SETTINGS CRUD
// ============================================

export async function getSecuritySettings(userId: string): Promise<SecuritySettings> {
  // In production: return await api.get(`/users/${userId}/security`);
  return getStoredSettings();
}

export async function updateTwoFactor(
  userId: string,
  enabled: boolean,
  method: TwoFactorMethod = 'sms'
): Promise<boolean> {
  const settings = getStoredSettings();

  settings.twoFactorAuth = {
    enabled,
    method,
    verifiedAt: enabled ? new Date().toISOString() : undefined
  };

  saveSettings(settings);

  // In production: return await api.put(`/users/${userId}/security/2fa`, { enabled, method });
  return true;
}

export async function changePassword(userId: string, currentPass: string, newPass: string): Promise<boolean> {
  // In production: await api.post(`/users/${userId}/change-password`, { currentPass, newPass });

  const settings = getStoredSettings();
  settings.passwordLastChanged = new Date().toISOString();
  saveSettings(settings);

  return true;
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export async function getActiveSessions(userId: string): Promise<UserSession[]> {
  const settings = getStoredSettings();
  return settings.sessions;
}

export async function revokeSession(userId: string, sessionId: string): Promise<boolean> {
  const settings = getStoredSettings();
  settings.sessions = settings.sessions.filter(s => s.id !== sessionId);
  saveSettings(settings);

  // In production: await api.delete(`/users/${userId}/sessions/${sessionId}`);
  return true;
}

export async function revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<boolean> {
  const settings = getStoredSettings();
  settings.sessions = settings.sessions.filter(s => s.id === currentSessionId);
  saveSettings(settings);

  // In production: await api.delete(`/users/${userId}/sessions?exclude=${currentSessionId}`);
  return true;
}

// ============================================
// LOGIN HISTORY
// ============================================

export async function getLoginHistory(userId: string): Promise<LoginHistory[]> {
  // In production: return await api.get(`/users/${userId}/login-history`);
  return MOCK_LOGIN_HISTORY;
}
