import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw, Settings, Circle } from 'lucide-react-native';
import { SignRecognition } from '@/services/SignRecognition';

const { width: screenWidth } = Dimensions.get('window');

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState<any[]>([]);
  const [fps, setFps] = useState(0);
  const [latency, setLatency] = useState(0);

  const signRecognition = new SignRecognition();
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    if (isRecognizing) {
      const interval = setInterval(() => {
        frameCount.current++;
        const now = Date.now();
        const deltaTime = now - lastTime.current;
        
        if (deltaTime >= 1000) {
          setFps(Math.round((frameCount.current * 1000) / deltaTime));
          frameCount.current = 0;
          lastTime.current = now;
        }
      }, 33); // ~30 FPS

      return () => clearInterval(interval);
    }
  }, [isRecognizing]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera access is required for sign recognition</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const startRecognition = async () => {
    setIsRecognizing(true);
    const startTime = Date.now();
    
    try {
      const results = await signRecognition.startRecognition();
      const endTime = Date.now();
      setLatency(endTime - startTime);
      setRecognitionResults(results || []);
    } catch (error) {
      console.error('Recognition error:', error);
    }
  };

  const stopRecognition = () => {
    setIsRecognizing(false);
    signRecognition.stopRecognition();
    setRecognitionResults([]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent']}
        style={styles.topOverlay}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Sign Recognition</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>FPS</Text>
            <Text style={styles.statValue}>{fps}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Latency</Text>
            <Text style={styles.statValue}>{latency}ms</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mode</Text>
            <Text style={styles.statValue}>Real-time</Text>
          </View>
        </View>
      </LinearGradient>

      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <View style={styles.handTrackingArea}>
            <View style={styles.handGuide} />
            <Text style={styles.guideText}>Position hands in frame</Text>
          </View>
        </View>
      </CameraView>

      <View style={styles.recognitionResults}>
        <Text style={styles.resultsTitle}>Top Recognition Results</Text>
        {recognitionResults.length > 0 ? (
          recognitionResults.slice(0, 3).map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultSign}>{result.sign}</Text>
              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceBar}>
                  <View 
                    style={[
                      styles.confidenceFill,
                      { 
                        width: `${result.confidence * 100}%`,
                        backgroundColor: index === 0 ? '#059669' : index === 1 ? '#3B82F6' : '#F59E0B'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {Math.round(result.confidence * 100)}%
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noResults}>
            {isRecognizing ? 'Recognizing signs...' : 'Tap record to start recognition'}
          </Text>
        )}
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.bottomOverlay}
      >
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleCameraFacing}
          >
            <RotateCcw size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecognizing && styles.recordButtonActive
            ]}
            onPress={isRecognizing ? stopRecognition : startRecognition}
          >
            <Circle 
              size={32} 
              color="white" 
              fill={isRecognizing ? '#DC2626' : 'transparent'}
            />
          </TouchableOpacity>

          <View style={styles.controlButton} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
    color: '#666',
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handTrackingArea: {
    alignItems: 'center',
  },
  handGuide: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  guideText: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  recognitionResults: {
    position: 'absolute',
    top: 180,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 12,
    minWidth: 150,
  },
  resultsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultItem: {
    marginBottom: 6,
  },
  resultSign: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginRight: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    width: 35,
    textAlign: 'right',
  },
  noResults: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordButtonActive: {
    backgroundColor: 'rgba(220, 38, 38, 0.3)',
  },
});