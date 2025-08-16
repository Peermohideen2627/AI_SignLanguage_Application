import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MessageCircle, Volume2, Hand, Clock, Trash2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';

const { height: screenHeight } = Dimensions.get('window');

interface ConversationItem {
  id: number;
  type: 'speech' | 'sign';
  text: string;
  gloss?: string[];
  signs?: any[];
  timestamp: string;
}

interface ConversationHistoryProps {
  conversation: ConversationItem[];
  onClear: () => void;
}

export function ConversationHistory({ conversation, onClear }: ConversationHistoryProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const playText = (text: string) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.8,
    });
  };

  const renderConversationItem = ({ item }: { item: ConversationItem }) => (
    <View style={[
      styles.conversationItem,
      item.type === 'speech' ? styles.speechItem : styles.signItem
    ]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTypeContainer}>
          {item.type === 'speech' ? (
            <MessageCircle size={16} color="#059669" />
          ) : (
            <Hand size={16} color="#3B82F6" />
          )}
          <Text style={[
            styles.itemType,
            { color: item.type === 'speech' ? '#059669' : '#3B82F6' }
          ]}>
            {item.type === 'speech' ? 'Speech' : 'Sign'}
          </Text>
        </View>
        
        <View style={styles.itemTime}>
          <Clock size={12} color="#6B7280" />
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>

      <Text style={styles.itemText}>{item.text}</Text>

      {item.gloss && (
        <Text style={styles.itemGloss}>
          Gloss: {item.gloss.join(' - ')}
        </Text>
      )}

      {item.signs && (
        <View style={styles.signsContainer}>
          {item.signs.slice(0, 2).map((sign, index) => (
            <Text key={index} style={styles.signConfidence}>
              {sign.sign} ({Math.round(sign.confidence * 100)}%)
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => playText(item.text)}
      >
        <Volume2 size={14} color="#6B7280" />
        <Text style={styles.playButtonText}>Play</Text>
      </TouchableOpacity>
    </View>
  );

  if (conversation.length === 0) {
    return (
      <View style={styles.emptyHistory}>
        <MessageCircle size={32} color="#D1D5DB" />
        <Text style={styles.emptyText}>No conversation yet</Text>
        <Text style={styles.emptySubtext}>
          Start speaking or signing to begin
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conversation History</Text>
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Trash2 size={16} color="#DC2626" />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversation.slice().reverse()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConversationItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: screenHeight * 0.3,
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 4,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  conversationItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  speechItem: {
    borderLeftColor: '#059669',
  },
  signItem: {
    borderLeftColor: '#3B82F6',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemType: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  itemTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  itemGloss: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  signsContainer: {
    marginBottom: 6,
  },
  signConfidence: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 2,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  playButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
  },
});