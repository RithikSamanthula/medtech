import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, MicOff, Loader, CircleAlert as AlertCircle } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { analyzeSymptoms, SymptomAnalysis } from '@/services/aiService';

export default function VoiceScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<SymptomAnalysis | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to use voice input.');
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      // Simulate transcript (in real app, you'd use speech-to-text service)
      const mockTranscript = "I have a sore throat, cough, and mild fever that started yesterday. It's getting worse and I feel tired.";
      setTranscript(mockTranscript);
      
      setRecording(null);
      processSymptoms(mockTranscript);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
    }
  };

  const processSymptoms = async (symptoms: string) => {
    setIsProcessing(true);
    
    try {
      const analysis = await analyzeSymptoms(symptoms);
      setResult(analysis);
    } catch (error) {
      console.error('Processing error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process symptoms. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'self-care': return '#22c55e';
      case 'see-doctor-soon': return '#F59E0B';
      case 'urgent': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'self-care': return 'Self-Care Recommended';
      case 'see-doctor-soon': return 'See Doctor Soon';
      case 'urgent': return 'Urgent Care Needed';
      default: return 'Unknown';
    }
  };

  const resetSession = () => {
    setTranscript('');
    setResult(null);
    setIsProcessing(false);
  };

  if (result) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#1e293b', '#334155', '#475569']}
          style={styles.header}>
          <Text style={styles.headerTitle}>Your Health Assessment</Text>
          <Text style={styles.headerSubtitle}>AI-powered analysis complete</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.transcriptSection}>
            <Text style={styles.transcriptLabel}>What you described:</Text>
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>

          <View style={[styles.urgencyCard, { borderLeftColor: getUrgencyColor(result.urgency) }]}>
            <View style={styles.urgencyHeader}>
              <AlertCircle size={24} color={getUrgencyColor(result.urgency)} />
              <Text style={[styles.urgencyText, { color: getUrgencyColor(result.urgency) }]}>
                {getUrgencyText(result.urgency)}
              </Text>
            </View>
          </View>

          <View style={styles.diagnosesSection}>
            <Text style={styles.sectionTitle}>Possible Conditions</Text>
            {result.diagnoses.map((diagnosis, index) => (
              <View key={index} style={styles.diagnosisItem}>
                <View style={styles.diagnosisNumber}>
                  <Text style={styles.diagnosisNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.diagnosisText}>{diagnosis}</Text>
              </View>
            ))}
          </View>

          <View style={styles.nextStepsSection}>
            <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
            <Text style={styles.nextStepsText}>{result.nextSteps}</Text>
          </View>

          <View style={styles.explanationSection}>
            <Text style={styles.sectionTitle}>Explanation</Text>
            <Text style={styles.explanationText}>{result.explanation}</Text>
          </View>

          <View style={styles.confidenceSection}>
            <Text style={styles.sectionTitle}>AI Confidence</Text>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { width: `${result.confidence}%` }]} />
            </View>
            <Text style={styles.confidenceText}>{result.confidence}% confidence</Text>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetSession}>
            <Text style={styles.resetButtonText}>New Assessment</Text>
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              This assessment is for informational purposes only. Please consult a healthcare professional for proper medical advice.
            </Text>
          </View>
        </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e293b', '#334155', '#475569']}
        style={styles.header}>
        <Text style={styles.headerTitle}>Voice Assessment</Text>
        <Text style={styles.headerSubtitle}>Describe your symptoms naturally</Text>
      </LinearGradient>

      <View style={styles.content}>
        {!isProcessing ? (
          <>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>How to get the best results:</Text>
              <Text style={styles.instructionsText}>
                • Describe when symptoms started{'\n'}
                • Mention severity and location{'\n'}
                • Include any relevant medical history{'\n'}
                • Speak clearly and take your time
              </Text>
            </View>

            <View style={styles.recordingSection}>
              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}>
                <LinearGradient
                  colors={isRecording ? ['#EF4444', '#DC2626'] : ['#1e40af', '#3730a3']}
                  style={styles.recordButtonGradient}>
                  {isRecording ? (
                    <MicOff size={48} color="#ffffff" />
                  ) : (
                    <Mic size={48} color="#ffffff" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              <Text style={styles.recordingText}>
                {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
              </Text>
              
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingLabel}>Recording...</Text>
                </View>
              )}
            </View>

            {transcript && (
              <View style={styles.transcriptPreview}>
                <Text style={styles.transcriptPreviewLabel}>Transcript:</Text>
                <Text style={styles.transcriptPreviewText}>"{transcript}"</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.processingSection}>
            <Loader size={48} color="#60A5FA" />
            <Text style={styles.processingTitle}>Analyzing your symptoms...</Text>
            <Text style={styles.processingText}>
              Our AI is reviewing your description and generating personalized health insights.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#60A5FA',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  recordButtonGradient: {
    flex: 1,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 18,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingLabel: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  transcriptPreview: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  transcriptPreviewLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  transcriptPreviewText: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  processingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 40,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  processingText: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
  },
  transcriptSection: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  transcriptLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  urgencyCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  urgencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  diagnosesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 16,
  },
  diagnosisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  diagnosisNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#60A5FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  diagnosisNumberText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  diagnosisText: {
    fontSize: 16,
    color: '#f1f5f9',
    flex: 1,
    lineHeight: 24,
  },
  nextStepsSection: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#60A5FA',
  },
  nextStepsText: {
    fontSize: 16,
    color: '#f1f5f9',
    lineHeight: 24,
  },
  explanationSection: {
    marginBottom: 24,
  },
  explanationText: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  confidenceSection: {
    marginBottom: 24,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#60A5FA',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#60A5FA',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#fbbf24',
    lineHeight: 20,
  },
});