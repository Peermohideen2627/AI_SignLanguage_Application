import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, VolumeX, Vibrate, Eye, Download, Trash2, Info, CircleHelp as HelpCircle, Settings as SettingsIcon } from 'lucide-react-native';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    speechEnabled: true,
    hapticsEnabled: true,
    highContrast: false,
    autoSpeakRecognition: true,
    confidenceThreshold: 0.7,
    recognitionMode: 'continuous',
    cameraFacing: 'front',
    modelVersion: 'lite',
  });

  const [modelStats, setModelStats] = useState({
    signModel: { size: '12.3 MB', version: 'v2.1', lastUpdate: '2025-01-15' },
    handPoseModel: { size: '8.7 MB', version: 'v1.4', lastUpdate: '2025-01-10' },
    asrModel: { size: '45.2 MB', version: 'v3.0', lastUpdate: '2025-01-12' },
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached recognition data and temporary files. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Implement cache clearing logic
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const downloadModels = () => {
    Alert.alert(
      'Download Models',
      'This will download the latest recognition models for offline use. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            // Implement model download logic
            Alert.alert('Info', 'Model download started in background');
          },
        },
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'SignLanguageNanban',
      'Version 1.0.0\n\nA real-time sign language communication app enabling seamless interaction between sign language and speech.\n\nBuilt with React Native and Expo.',
      [{ text: 'OK' }]
    );
  };

  const SettingRow = ({ icon, title, subtitle, children }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingControl}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6']}
        style={styles.header}
      >
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio & Feedback</Text>
          
          <SettingRow
            icon={settings.speechEnabled ? <Volume2 size={20} color="#3B82F6" /> : <VolumeX size={20} color="#6B7280" />}
            title="Text-to-Speech"
            subtitle="Enable voice output for recognized signs"
          >
            <Switch
              value={settings.speechEnabled}
              onValueChange={(value) => updateSetting('speechEnabled', value)}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={settings.speechEnabled ? '#FFFFFF' : '#F3F4F6'}
            />
          </SettingRow>

          <SettingRow
            icon={<Vibrate size={20} color={settings.hapticsEnabled ? '#3B82F6' : '#6B7280'} />}
            title="Haptic Feedback"
            subtitle="Vibration feedback for interactions"
          >
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(value) => updateSetting('hapticsEnabled', value)}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={settings.hapticsEnabled ? '#FFFFFF' : '#F3F4F6'}
            />
          </SettingRow>

          <SettingRow
            icon={<Volume2 size={20} color={settings.autoSpeakRecognition ? '#3B82F6' : '#6B7280'} />}
            title="Auto-Speak Recognition"
            subtitle="Automatically speak recognized signs"
          >
            <Switch
              value={settings.autoSpeakRecognition}
              onValueChange={(value) => updateSetting('autoSpeakRecognition', value)}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={settings.autoSpeakRecognition ? '#FFFFFF' : '#F3F4F6'}
            />
          </SettingRow>
        </View>

        {/* Visual Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visual & Accessibility</Text>
          
          <SettingRow
            icon={<Eye size={20} color={settings.highContrast ? '#3B82F6' : '#6B7280'} />}
            title="High Contrast Mode"
            subtitle="Enhanced visibility for better accessibility"
          >
            <Switch
              value={settings.highContrast}
              onValueChange={(value) => updateSetting('highContrast', value)}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={settings.highContrast ? '#FFFFFF' : '#F3F4F6'}
            />
          </SettingRow>
        </View>

        {/* Model Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Models & Storage</Text>
          
          <View style={styles.modelInfo}>
            <Text style={styles.modelTitle}>Downloaded Models</Text>
            
            <View style={styles.modelItem}>
              <Text style={styles.modelName}>Sign Recognition Model</Text>
              <Text style={styles.modelDetails}>
                {modelStats.signModel.size} • {modelStats.signModel.version}
              </Text>
            </View>
            
            <View style={styles.modelItem}>
              <Text style={styles.modelName}>Hand Pose Model</Text>
              <Text style={styles.modelDetails}>
                {modelStats.handPoseModel.size} • {modelStats.handPoseModel.version}
              </Text>
            </View>
            
            <View style={styles.modelItem}>
              <Text style={styles.modelName}>Speech Recognition Model</Text>
              <Text style={styles.modelDetails}>
                {modelStats.asrModel.size} • {modelStats.asrModel.version}
              </Text>
            </View>
          </View>

          <View style={styles.modelActions}>
            <TouchableOpacity style={styles.actionButton} onPress={downloadModels}>
              <Download size={16} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Update Models</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={clearCache}>
              <Trash2 size={16} color="#DC2626" />
              <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>Clear Cache</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.infoButton} onPress={showAbout}>
            <Info size={20} color="#3B82F6" />
            <Text style={styles.infoButtonText}>App Information</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoButton}>
            <HelpCircle size={20} color="#3B82F6" />
            <Text style={styles.infoButtonText}>Help & Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingControl: {
    marginLeft: 12,
  },
  modelInfo: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  modelName: {
    fontSize: 14,
    color: '#374151',
  },
  modelDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  modelActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 6,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoButtonText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
});