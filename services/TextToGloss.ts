export class TextToGloss {
  private glossDictionary: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDictionary();
  }

  private initializeDictionary(): void {
    // Basic text-to-gloss mappings
    // In a real implementation, this would be much more sophisticated
    const mappings = {
      'hello': ['HELLO'],
      'hi': ['HELLO'],
      'goodbye': ['GOODBYE'],
      'bye': ['GOODBYE'],
      'thank you': ['THANK-YOU'],
      'thanks': ['THANK-YOU'],
      'please': ['PLEASE'],
      'help': ['HELP'],
      'yes': ['YES'],
      'no': ['NO'],
      'good': ['GOOD'],
      'bad': ['BAD'],
      'how are you': ['HOW', 'YOU'],
      'what is your name': ['WHAT', 'YOUR', 'NAME'],
      'my name is': ['MY', 'NAME'],
      'i need help': ['I', 'NEED', 'HELP'],
      'excuse me': ['EXCUSE-ME'],
      'sorry': ['SORRY'],
      'welcome': ['WELCOME'],
      'nice to meet you': ['NICE', 'MEET', 'YOU'],
      'see you later': ['SEE-YOU-LATER'],
      'have a good day': ['HAVE', 'GOOD', 'DAY'],
      'i love you': ['I', 'LOVE', 'YOU'],
      'family': ['FAMILY'],
      'friend': ['FRIEND'],
      'work': ['WORK'],
      'home': ['HOME'],
      'school': ['SCHOOL'],
      'happy': ['HAPPY'],
      'sad': ['SAD'],
      'tired': ['TIRED'],
      'hungry': ['HUNGRY'],
      'thirsty': ['THIRSTY'],
      'eat': ['EAT'],
      'drink': ['DRINK'],
      'sleep': ['SLEEP'],
      'today': ['TODAY'],
      'yesterday': ['YESTERDAY'],
      'tomorrow': ['TOMORROW'],
      'morning': ['MORNING'],
      'afternoon': ['AFTERNOON'],
      'evening': ['EVENING'],
      'night': ['NIGHT'],
    };

    Object.entries(mappings).forEach(([text, gloss]) => {
      this.glossDictionary.set(text.toLowerCase(), gloss);
    });
  }

  convert(text: string): string[] {
    const lowercaseText = text.toLowerCase().trim();
    
    // First, try to find exact matches for common phrases
    if (this.glossDictionary.has(lowercaseText)) {
      return this.glossDictionary.get(lowercaseText)!;
    }

    // If no exact match, try to match partial phrases
    for (const [phrase, gloss] of this.glossDictionary.entries()) {
      if (lowercaseText.includes(phrase)) {
        return gloss;
      }
    }

    // If no matches found, do word-by-word conversion
    const words = lowercaseText
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 0);

    const gloss: string[] = [];

    for (const word of words) {
      // Check if individual word has a mapping
      if (this.glossDictionary.has(word)) {
        gloss.push(...this.glossDictionary.get(word)!);
      } else {
        // For unknown words, convert to uppercase (basic fingerspelling representation)
        gloss.push(word.toUpperCase());
      }
    }

    return gloss.length > 0 ? gloss : [text.toUpperCase()];
  }

  // Add custom mappings
  addMapping(text: string, gloss: string[]): void {
    this.glossDictionary.set(text.toLowerCase().trim(), gloss);
  }

  // Remove mappings
  removeMapping(text: string): boolean {
    return this.glossDictionary.delete(text.toLowerCase().trim());
  }

  // Get all available phrases
  getAllPhrases(): string[] {
    return Array.from(this.glossDictionary.keys());
  }

  // Check if a phrase has a mapping
  hasMapping(text: string): boolean {
    return this.glossDictionary.has(text.toLowerCase().trim());
  }
}