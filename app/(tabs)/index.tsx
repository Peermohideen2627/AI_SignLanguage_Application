import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Mic, Camera, Volume2, Pause, Play } from 'lucide-react-native';
import { ConversationHistory } from '@/components/ConversationHistory';
import { SignAvatar } from '@/components/SignAvatar';
import { SpeechRecognition } from '@/services/SpeechRecognition';
import { SignRecognition } from '@/services/SignRecognition';
import { TextToGloss } from '@/services/TextToGloss';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ConversationScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [currentSigns, setCurrentSigns] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGloss, setCurrentGloss] = useState<string[]>([]);

  const speechRecognition = new SpeechRecognition();
  const signRecognition = new SignRecognition();
  const textToGloss = new TextToGloss();

  const triggerHaptics = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleStartSpeech = async () => {
    triggerHaptics();
    setIsListening(true);
    
    try {
      const result = await speechRecognition.startListening();
      if (result) {
        setCurrentText(result);
        const gloss = textToGloss.convert(result);
        setCurrentGloss(gloss);
        
        // Add to conversation history
        setConversation(prev => [...prev, {
          id: Date.now(),
          type: 'speech',
          text: result,
          gloss,
          timestamp: new Date().toISOString()
        }]);

        // Convert to speech
        Speech.speak(result, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.8,
        });
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
    } finally {
      setIsListening(false);
    }
  };

  const handleStartSignRecognition = async () => {
    triggerHaptics();
    setIsRecognizing(true);
    
    try {
      const results = await signRecognition.startRecognition();
      if (results && results.length > 0) {
        setCurrentSigns(results);
        const recognizedText = results[0].sign;
        setCurrentText(recognizedText);
        
        // Add to conversation history
        setConversation(prev => [...prev, {
          id: Date.now(),
          type: 'sign',
          text: recognizedText,
          signs: results,
          timestamp: new Date().toISOString()
        }]);

        // Convert to speech
        Speech.speak(recognizedText, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.8,
        });
      }
    } catch (error) {
      console.error('Sign recognition error:', error);
    } finally {
      setIsRecognizing(false);
    }
  };

  const playCurrentGloss = () => {
    if (currentGloss.length > 0) {
      setIsPlaying(true);
      // Simulate avatar playback
      setTimeout(() => setIsPlaying(false), currentGloss.length * 1000);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6']}
        style={styles.header}
      >
        <Text style={styles.title}>SignLanguageNanban</Text>
        <Text style={styles.subtitle}>Real-time Communication</Text>
      </LinearGradient>

      <View style={styles.splitView}>
        {/* Speech to Sign Side */}
        <View style={styles.leftPanel}>
          <Text style={styles.panelTitle}>Speech → Sign</Text>
          
          <View style={styles.avatarContainer}>
            <SignAvatar 
              gloss={currentGloss}
              isPlaying={isPlaying}
            />
          </View>

          <View style={styles.textDisplay}>
            <Text style={styles.recognizedText}>
              {currentText || "Tap 'Speak' to start"}
            </Text>
            {currentGloss.length > 0 && (
              <Text style={styles.glossText}>
                Gloss: {currentGloss.join(' - ')}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.speakButton]}
            onPress={handleStartSpeech}
            disabled={isListening}
          >
            <Mic size={24} color="white" />
            <Text style={styles.buttonText}>
              {isListening ? 'Listening...' : 'Speak'}
            </Text>
          </TouchableOpacity>

          {currentGloss.length > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.playButton]}
              onPress={playCurrentGloss}
              disabled={isPlaying}
            >
              {isPlaying ? (
                <Pause size={20} color="white" />
              ) : (
                <Play size={20} color="white" />
              )}
              <Text style={styles.buttonTextSmall}>
                {isPlaying ? 'Playing' : 'Play Signs'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sign to Speech Side */}
        <View style={styles.rightPanel}>
          <Text style={styles.panelTitle}>Sign → Speech</Text>
          
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              <Camera size={48} color="#6B7280" />
              <Text style={styles.cameraText}>Camera View</Text>
            </View>
          </View>

          <View style={styles.confidenceContainer}>
            {currentSigns.map((sign, index) => (
              <View key={index} style={styles.confidenceItem}>
                <Text style={styles.signText}>{sign.sign}</Text>
                <View style={styles.confidenceBar}>
                  <View 
                    style={[
                      styles.confidenceFill,
                      { width: `${sign.confidence * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {Math.round(sign.confidence * 100)}%
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.signButton]}
            onPress={handleStartSignRecognition}
            disabled={isRecognizing}
          >
            <Camera size={24} color="white" />
            <Text style={styles.buttonText}>
              {isRecognizing ? 'Recognizing...' : 'Sign'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ConversationHistory 
        conversation={conversation}
        onClear={() => setConversation([])}
      />
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
  splitView: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  leftPanel: {
    flex: 1,
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rightPanel: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarContainer: {
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 16,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  textDisplay: {
    minHeight: 60,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recognizedText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  glossText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  signText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    width: 60,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginHorizontal: 8,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    color: '#6B7280',
    width: 35,
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  speakButton: {
    backgroundColor: '#059669',
  },
  signButton: {
    backgroundColor: '#3B82F6',
  },
  playButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonTextSmall: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});