import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { User, Play, Pause } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface SignAvatarProps {
  gloss: string[];
  isPlaying: boolean;
}

export function SignAvatar({ gloss, isPlaying }: SignAvatarProps) {
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isPlaying && gloss.length > 0) {
      playGlossSequence();
    }
  }, [isPlaying, gloss]);

  const playGlossSequence = () => {
    if (gloss.length === 0) return;

    const playNextSign = (index: number) => {
      if (index >= gloss.length) {
        setCurrentSignIndex(0);
        return;
      }

      setCurrentSignIndex(index);
      
      // Animate the avatar for each sign
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        setTimeout(() => {
          playNextSign(index + 1);
        }, 500);
      });
    };

    playNextSign(0);
  };

  const avatarScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const avatarOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.avatar,
          {
            transform: [{ scale: avatarScale }],
            opacity: avatarOpacity,
          }
        ]}
      >
        <User size={48} color="#3B82F6" />
      </Animated.View>

      <View style={styles.signDisplay}>
        {gloss.length > 0 ? (
          <>
            <Text style={styles.currentSign}>
              {gloss[currentSignIndex] || gloss[0]}
            </Text>
            <Text style={styles.progress}>
              {isPlaying ? `${currentSignIndex + 1} / ${gloss.length}` : 'Ready to play'}
            </Text>
          </>
        ) : (
          <Text style={styles.noSigns}>No signs to display</Text>
        )}
      </View>

      <View style={styles.controls}>
        {isPlaying ? (
          <View style={styles.statusIndicator}>
            <Pause size={16} color="#059669" />
            <Text style={styles.statusText}>Playing</Text>
          </View>
        ) : (
          <View style={styles.statusIndicator}>
            <Play size={16} color="#6B7280" />
            <Text style={[styles.statusText, { color: '#6B7280' }]}>Paused</Text>
          </View>
        )}
      </View>

      {gloss.length > 0 && (
        <View style={styles.glossSequence}>
          <Text style={styles.sequenceTitle}>Sign Sequence:</Text>
          <View style={styles.glossChips}>
            {gloss.map((sign, index) => (
              <View 
                key={index}
                style={[
                  styles.glossChip,
                  index === currentSignIndex && isPlaying && styles.activeGlossChip
                ]}
              >
                <Text 
                  style={[
                    styles.glossChipText,
                    index === currentSignIndex && isPlaying && styles.activeGlossChipText
                  ]}
                >
                  {sign}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  signDisplay: {
    alignItems: 'center',
    marginBottom: 12,
  },
  currentSign: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progress: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  noSigns: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  controls: {
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    color: '#059669',
  },
  glossSequence: {
    alignItems: 'center',
    width: '100%',
  },
  sequenceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  glossChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  glossChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeGlossChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  glossChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
  },
  activeGlossChipText: {
    color: 'white',
  },
});