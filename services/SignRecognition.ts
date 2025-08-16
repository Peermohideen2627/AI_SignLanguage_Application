interface SignResult {
  sign: string;
  confidence: number;
}

export class SignRecognition {
  private isRecognizing: boolean = false;
  private mockSigns: string[] = [
    'HELLO', 'THANK-YOU', 'PLEASE', 'HELP', 'YES', 'NO', 
    'GOOD', 'BAD', 'HOW', 'WHAT', 'WHERE', 'WHEN', 'WHO',
    'I', 'YOU', 'ME', 'WE', 'THEY', 'NAME', 'WORK', 'HOME',
    'FAMILY', 'FRIEND', 'LOVE', 'HAPPY', 'SAD', 'SORRY',
    'EXCUSE-ME', 'WELCOME', 'GOODBYE', 'SEE-YOU-LATER'
  ];

  async startRecognition(): Promise<SignResult[] | null> {
    if (this.isRecognizing) {
      return null;
    }

    this.isRecognizing = true;

    try {
      // Simulate processing time
      await this.simulateRecognition();
      
      // Generate mock results with confidence scores
      const numResults = Math.floor(Math.random() * 3) + 1; // 1-3 results
      const results: SignResult[] = [];
      
      const shuffledSigns = [...this.mockSigns].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numResults; i++) {
        results.push({
          sign: shuffledSigns[i],
          confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
        });
      }

      // Sort by confidence (highest first)
      results.sort((a, b) => b.confidence - a.confidence);
      
      return results;
    } catch (error) {
      console.error('Sign recognition error:', error);
      return null;
    } finally {
      this.isRecognizing = false;
    }
  }

  stopRecognition(): void {
    this.isRecognizing = false;
  }

  private async simulateRecognition(): Promise<void> {
    return new Promise((resolve) => {
      // Simulate variable processing time (500ms to 2000ms)
      const processingTime = Math.random() * 1500 + 500;
      setTimeout(resolve, processingTime);
    });
  }

  isCurrentlyRecognizing(): boolean {
    return this.isRecognizing;
  }

  // Simulate real-time keypoint extraction
  extractKeypoints(frame: any): any {
    // Mock keypoint data
    return {
      hands: {
        left: Array.from({ length: 21 }, () => ({
          x: Math.random(),
          y: Math.random(),
          z: Math.random() * 0.1,
        })),
        right: Array.from({ length: 21 }, () => ({
          x: Math.random(),
          y: Math.random(),
          z: Math.random() * 0.1,
        })),
      },
      pose: Array.from({ length: 33 }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random() * 0.1,
        visibility: Math.random(),
      })),
      face: Array.from({ length: 468 }, () => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random() * 0.1,
      })),
    };
  }
}