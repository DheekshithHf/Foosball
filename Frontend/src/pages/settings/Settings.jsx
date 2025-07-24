import React, { useState } from 'react';
import './Settings.scss';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      bookingReminders: true,
      gameInvitations: true,
      dailyDigest: false,
      weeklyReport: true
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      defaultBookingDuration: 60
    },
    privacy: {
      showInLeaderboard: true,
      allowGameInvites: true,
      shareStats: false
    },
    profile: {
      name: 'John Smith',
      email: 'john@happyfox.com',
      department: 'Engineering',
      skillLevel: 'intermediate'
    }
  });

  const [activeSection, setActiveSection] = useState('profile');

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' }
  ];

  return (
    <div className="settings">
      <div className="background-pattern"></div>
      <div className="container">
        <div className="settings__header">
          <h1>⚙️ Settings</h1>
          <p>Customize your foosball experience</p>
        </div>

        <div className="settings__content">
          {/* Settings Navigation */}
          <div className="settings-nav">
            <ul className="nav-list">
              {sections.map(section => (
                <li key={section.id} className="nav-item">
                  <button
                    className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="nav-icon">{section.icon}</span>
                    <span className="nav-label">{section.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Settings Panels */}
          <div className="settings-panel">
            {activeSection === 'profile' && (
              <div className="panel-content">
                <h2>👤 Profile Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      value={settings.profile.department}
                      onChange={(e) => handleSettingChange('profile', 'department', e.target.value)}
                      className="form-control"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Skill Level</label>
                    <select
                      value={settings.profile.skillLevel}
                      onChange={(e) => handleSettingChange('profile', 'skillLevel', e.target.value)}
                      className="form-control"
                    >
                      <option value="beginner">🌱 Beginner</option>
                      <option value="intermediate">⚡ Intermediate</option>
                      <option value="advanced">🔥 Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="panel-content">
                <h2>🔔 Notification Preferences</h2>
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Booking Reminders</h3>
                      <p>Get notified 15 minutes before your scheduled games</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.bookingReminders}
                        onChange={(e) => handleSettingChange('notifications', 'bookingReminders', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Game Invitations</h3>
                      <p>Receive notifications when other players invite you to games</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.gameInvitations}
                        onChange={(e) => handleSettingChange('notifications', 'gameInvitations', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Daily Digest</h3>
                      <p>Get a summary of the day's games and activities</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.dailyDigest}
                        onChange={(e) => handleSettingChange('notifications', 'dailyDigest', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Weekly Report</h3>
                      <p>Receive weekly performance reports and statistics</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.weeklyReport}
                        onChange={(e) => handleSettingChange('notifications', 'weeklyReport', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="panel-content">
                <h2>⚙️ App Preferences</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Theme</label>
                    <select
                      value={settings.preferences.theme}
                      onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                      className="form-control"
                    >
                      <option value="light">☀️ Light</option>
                      <option value="dark">🌙 Dark</option>
                      <option value="auto">🔄 Auto</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <select
                      value={settings.preferences.language}
                      onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                      className="form-control"
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="es">🇪🇸 Spanish</option>
                      <option value="fr">🇫🇷 French</option>
                      <option value="de">🇩🇪 German</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      value={settings.preferences.timezone}
                      onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                      className="form-control"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Default Booking Duration</label>
                    <select
                      value={settings.preferences.defaultBookingDuration}
                      onChange={(e) => handleSettingChange('preferences', 'defaultBookingDuration', parseInt(e.target.value))}
                      className="form-control"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="panel-content">
                <h2>🔒 Privacy Settings</h2>
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Show in Leaderboard</h3>
                      <p>Allow your name and stats to appear in public leaderboards</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showInLeaderboard}
                        onChange={(e) => handleSettingChange('privacy', 'showInLeaderboard', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Allow Game Invites</h3>
                      <p>Let other players send you game invitations</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.privacy.allowGameInvites}
                        onChange={(e) => handleSettingChange('privacy', 'allowGameInvites', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Share Statistics</h3>
                      <p>Allow your game statistics to be used in analytics</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.privacy.shareStats}
                        onChange={(e) => handleSettingChange('privacy', 'shareStats', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="panel-actions">
              <button className="btn btn--primary" onClick={handleSave}>
                💾 Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
