import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Search, Play, Trash2, Bookmark } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

interface Phrase {
  id: string;
  text: string;
  gloss: string[];
  category: string;
  isFavorite: boolean;
  createdAt: string;
}

const STORAGE_KEY = '@SignLanguageNanban:phrases';

const DEFAULT_PHRASES: Phrase[] = [
  {
    id: '1',
    text: 'Hello, how are you?',
    gloss: ['HELLO', 'HOW', 'YOU'],
    category: 'Greetings',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    text: 'Thank you very much',
    gloss: ['THANK-YOU', 'VERY', 'MUCH'],
    category: 'Courtesy',
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    text: 'What is your name?',
    gloss: ['WHAT', 'YOUR', 'NAME'],
    category: 'Questions',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    text: 'I need help',
    gloss: ['I', 'NEED', 'HELP'],
    category: 'Emergency',
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
];

const CATEGORIES = ['All', 'Greetings', 'Courtesy', 'Questions', 'Emergency', 'Custom'];

export default function PhrasebookScreen() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [filteredPhrases, setFilteredPhrases] = useState<Phrase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhraseText, setNewPhraseText] = useState('');
  const [newPhraseCategory, setNewPhraseCategory] = useState('Custom');

  useEffect(() => {
    loadPhrases();
  }, []);

  useEffect(() => {
    filterPhrases();
  }, [phrases, searchQuery, selectedCategory]);

  const loadPhrases = async () => {
    try {
      const storedPhrases = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedPhrases) {
        setPhrases(JSON.parse(storedPhrases));
      } else {
        setPhrases(DEFAULT_PHRASES);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PHRASES));
      }
    } catch (error) {
      console.error('Error loading phrases:', error);
      setPhrases(DEFAULT_PHRASES);
    }
  };

  const savePhrases = async (updatedPhrases: Phrase[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPhrases));
      setPhrases(updatedPhrases);
    } catch (error) {
      console.error('Error saving phrases:', error);
    }
  };

  const filterPhrases = () => {
    let filtered = phrases;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(phrase => phrase.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(phrase =>
        phrase.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phrase.gloss.some(word => word.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPhrases(filtered);
  };

  const addPhrase = async () => {
    if (!newPhraseText.trim()) {
      Alert.alert('Error', 'Please enter phrase text');
      return;
    }

    // Simple text-to-gloss conversion (would use more sophisticated logic in production)
    const gloss = newPhraseText
      .toUpperCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const newPhrase: Phrase = {
      id: Date.now().toString(),
      text: newPhraseText.trim(),
      gloss,
      category: newPhraseCategory,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    const updatedPhrases = [...phrases, newPhrase];
    await savePhrases(updatedPhrases);
    
    setNewPhraseText('');
    setShowAddForm(false);
    Alert.alert('Success', 'Phrase added to phrasebook');
  };

  const deletePhrase = (phraseId: string) => {
    Alert.alert(
      'Delete Phrase',
      'Are you sure you want to delete this phrase?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedPhrases = phrases.filter(p => p.id !== phraseId);
            await savePhrases(updatedPhrases);
          },
        },
      ]
    );
  };

  const toggleFavorite = async (phraseId: string) => {
    const updatedPhrases = phrases.map(phrase =>
      phrase.id === phraseId
        ? { ...phrase, isFavorite: !phrase.isFavorite }
        : phrase
    );
    await savePhrases(updatedPhrases);
  };

  const playPhrase = (text: string) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.8,
    });
  };

  const renderPhrase = ({ item }: { item: Phrase }) => (
    <View style={styles.phraseCard}>
      <View style={styles.phraseHeader}>
        <View style={styles.phraseInfo}>
          <Text style={styles.phraseText}>{item.text}</Text>
          <Text style={styles.phraseGloss}>
            {item.gloss.join(' - ')}
          </Text>
          <Text style={styles.phraseCategory}>{item.category}</Text>
        </View>
        
        <View style={styles.phraseActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <Bookmark
              size={20}
              color={item.isFavorite ? '#F59E0B' : '#6B7280'}
              fill={item.isFavorite ? '#F59E0B' : 'transparent'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => playPhrase(item.text)}
          >
            <Play size={20} color="#3B82F6" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deletePhrase(item.id)}
          >
            <Trash2 size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6']}
        style={styles.header}
      >
        <Text style={styles.title}>Phrasebook</Text>
        <Text style={styles.subtitle}>{phrases.length} saved phrases</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search phrases..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipSelected
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item && styles.categoryChipTextSelected
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {showAddForm && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.addInput}
            placeholder="Enter new phrase..."
            value={newPhraseText}
            onChangeText={setNewPhraseText}
            multiline
          />
          
          <View style={styles.addFormActions}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setShowAddForm(false);
                setNewPhraseText('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.formButton, styles.saveButton]}
              onPress={addPhrase}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={filteredPhrases}
        keyExtractor={(item) => item.id}
        renderItem={renderPhrase}
        contentContainerStyle={styles.phrasesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No phrases found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or add a new phrase
            </Text>
          </View>
        }
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: 'white',
  },
  addForm: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  formButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  phrasesList: {
    padding: 16,
  },
  phraseCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phraseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  phraseInfo: {
    flex: 1,
    marginRight: 12,
  },
  phraseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  phraseGloss: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  phraseCategory: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  phraseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});