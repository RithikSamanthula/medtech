import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, TextInput } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, FlipHorizontal, Zap, CircleAlert as AlertCircle, RotateCcw } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import { analyzeImage, VisionAnalysis, analyzeSymptoms, SymptomAnalysis, ImageDescriptionAnalysis } from '@/services/aiService';

// Helper type guard
function isSymptomAnalysis(obj: any): obj is SymptomAnalysis {
  return obj && Array.isArray(obj.diagnoses);
}

function hasRecommendations(obj: any): obj is { recommendations: string[] } {
  return obj && Array.isArray(obj.recommendations);
}

function safeMap<T>(arr: T[] | undefined, fn: (item: T, idx: number) => React.ReactNode) {
  return Array.isArray(arr) ? arr.map(fn) : null;
}

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisionAnalysis | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [textDescription, setTextDescription] = useState('');
  const [textResult, setTextResult] = useState<SymptomAnalysis | VisionAnalysis | null>(null);
  const [isTextAnalyzing, setIsTextAnalyzing] = useState(false);
  // Add a new state for image analysis result
  const [imageResult, setImageResult] = useState<ImageDescriptionAnalysis | null>(null);

  useEffect(() => {
    requestMediaLibraryPermission();
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Camera size={64} color="#6B7280" />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to analyze skin conditions and other visible symptoms.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo) {
        setCapturedImage(photo.uri);
        if (photo.base64) {
          analyzeImageWithAI(photo.base64);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const analyzeImageWithAI = async (imageBase64: string) => {
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeImage(imageBase64);
      setResult(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeTextWithAI = async () => {
    if (!textDescription.trim()) return;
    setIsTextAnalyzing(true);
    setTextResult(null);
    try {
      // Use analyzeSymptoms for text input (returns SymptomAnalysis, but similar to VisionAnalysis)
      const analysis = await analyzeSymptoms(textDescription);
      setTextResult(analysis);
    } catch (error) {
      console.error('Text analysis error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to analyze description. Please try again.');
    } finally {
      setIsTextAnalyzing(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const resetSession = () => {
    setCapturedImage(null);
    setResult(null);
    setIsAnalyzing(false);
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

  if (result && capturedImage) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#1e293b', '#334155', '#475569']}
          style={styles.header}>
          <Text style={styles.headerTitle}>Skin Analysis Complete</Text>
          <Text style={styles.headerSubtitle}>AI-powered vision assessment</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.analyzedImage} />
          </View>

          <View style={[styles.urgencyCard, { borderLeftColor: getUrgencyColor(result.urgency) }]}>
            <View style={styles.urgencyHeader}>
              <AlertCircle size={24} color={getUrgencyColor(result.urgency)} />
              <Text style={[styles.urgencyText, { color: getUrgencyColor(result.urgency) }]}>
                {getUrgencyText(result.urgency)}
              </Text>
            </View>
          </View>

          <View style={styles.conditionSection}>
            <Text style={styles.sectionTitle}>Identified Condition</Text>
            <Text style={styles.conditionName}>{result.condition}</Text>
            <Text style={styles.conditionDescription}>{result.description}</Text>
          </View>

          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Care Recommendations</Text>
            {safeMap(result?.recommendations, (recommendation: string, index: number) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={styles.recommendationBullet} />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>

          <View style={styles.careSection}>
            <Text style={styles.sectionTitle}>When to Seek Medical Care</Text>
            <Text style={styles.careText}>{result.whenToSeekCare}</Text>
          </View>

          <View style={styles.confidenceSection}>
            <Text style={styles.sectionTitle}>AI Confidence</Text>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { width: `${result.confidence}%` }]} />
            </View>
            <Text style={styles.confidenceText}>{result.confidence}% confidence</Text>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetSession}>
            <RotateCcw size={20} color="#ffffff" />
            <Text style={styles.resetButtonText}>Take Another Photo</Text>
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              This analysis is for informational purposes only and should not replace professional medical diagnosis. Please consult a healthcare provider for proper evaluation.
            </Text>
          </View>
        </View>
        </ScrollView>
      </View>
    );
  }

  if (isAnalyzing && capturedImage) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1e293b', '#334155', '#475569']}
          style={styles.header}>
          <Text style={styles.headerTitle}>Analyzing Image</Text>
          <Text style={styles.headerSubtitle}>Please wait while our AI examines your photo</Text>
        </LinearGradient>

        <View style={styles.analysisContainer}>
          <Image source={{ uri: capturedImage }} style={styles.analysisImage} />
          
          <View style={styles.analysisIndicator}>
            <Zap size={48} color="#60A5FA" />
            <Text style={styles.analysisTitle}>AI Vision Analysis</Text>
            <Text style={styles.analysisText}>
              Our advanced AI is examining your image for potential skin conditions and providing personalized recommendations.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentCamera}>
      <LinearGradient
        colors={['#1e293b', '#334155', '#475569']}
        style={styles.header}>
        <Text style={styles.headerTitle}>Skin Condition Scan</Text>
        <Text style={styles.headerSubtitle}>Take a clear photo of the affected area</Text>
      </LinearGradient>

      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={() => setCapturedImage(null)}>
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.analyzeButton} onPress={() => {
              // For manual analysis, we'd need to convert the image to base64
              Alert.alert('Info', 'Please retake the photo to analyze with AI.');
            }}>
              <Text style={styles.analyzeButtonText}>Analyze</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Photography Tips:</Text>
            <Text style={styles.instructionsText}>
              • Ensure good lighting (natural light works best){'\n'}
              • Keep the camera 6-12 inches from the skin{'\n'}
              • Make sure the area is clean and dry{'\n'}
              • Capture the entire affected area clearly{'\n'}
              • Avoid shadows and blurry images
            </Text>
          </View>

          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            <View style={styles.cameraOverlay}>
              <View style={styles.targetFrame} />
              
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                  <FlipHorizontal size={24} color="#ffffff" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                
                <View style={styles.spacer} />
              </View>
            </View>
          </CameraView>
        </>
      )}
      <View style={styles.textInputSection}>
        <Text style={styles.sectionTitle}>Or describe your symptoms</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Type your symptoms or concerns..."
          placeholderTextColor="#94a3b8"
          value={textDescription}
          onChangeText={setTextDescription}
          multiline
        />
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={analyzeTextWithAI}
          disabled={isTextAnalyzing || !textDescription.trim()}
        >
          <Text style={styles.analyzeButtonText}>{isTextAnalyzing ? 'Analyzing...' : 'Analyze Description'}</Text>
        </TouchableOpacity>
      </View>
      {textResult && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          <Text style={styles.conditionName}>{
            isSymptomAnalysis(textResult)
              ? textResult.diagnoses?.[0]
              : textResult.condition
          }</Text>
          <Text style={styles.conditionDescription}>{
            isSymptomAnalysis(textResult)
              ? textResult.explanation
              : textResult.description
          }</Text>
          {(textResult && Array.isArray((textResult as any).recommendations) && (textResult as any).recommendations.length > 0) && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>Care Recommendations</Text>
              {safeMap((textResult as any).recommendations, (rec: string, idx: number) => (
                <Text key={idx} style={styles.recommendationText}>{rec}</Text>
              ))}
            </View>
          )}
          {'whenToSeekCare' in textResult && textResult.whenToSeekCare && (
            <View style={styles.careSection}>
              <Text style={styles.sectionTitle}>When to Seek Medical Care</Text>
              <Text style={styles.careText}>{textResult.whenToSeekCare}</Text>
            </View>
          )}
          {typeof textResult.confidence === 'number' && (
            <View style={styles.confidenceSection}>
              <Text style={styles.sectionTitle}>AI Confidence</Text>
              <View style={styles.confidenceBar}>
                <View style={[styles.confidenceFill, { width: `${textResult.confidence}%` }]} />
              </View>
              <Text style={styles.confidenceText}>{textResult.confidence}% confidence</Text>
            </View>
          )}
        </View>
      )}
      {imageResult && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>AI Image Description</Text>
          {imageResult.features ? (
            <Text style={styles.conditionDescription}>{imageResult.features}</Text>
          ) : null}
          {Array.isArray(imageResult.possible_categories) && imageResult.possible_categories.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>Possible Categories</Text>
              {imageResult.possible_categories.map((cat: string, idx: number) => (
                <Text key={idx} style={styles.recommendationText}>{cat}</Text>
              ))}
            </View>
          )}
          {imageResult.general_advice ? (
            <Text style={styles.careText}>{imageResult.general_advice}</Text>
          ) : null}
        </View>
      )}
      </ScrollView>
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
  scrollContentCamera: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  loadingText: {
    fontSize: 18,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 100,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#0f172a',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#60A5FA',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
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
  instructionsCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    margin: 20,
    borderRadius: 12,
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
  camera: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  targetFrame: {
    alignSelf: 'center',
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 20,
    marginTop: 40,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#60A5FA',
  },
  spacer: {
    width: 50,
  },
  previewContainer: {
    flex: 1,
    margin: 20,
  },
  previewImage: {
    flex: 1,
    borderRadius: 20,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#60A5FA',
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  analysisContainer: {
    flex: 1,
    padding: 20,
  },
  analysisImage: {
    height: 300,
    borderRadius: 20,
    marginBottom: 40,
  },
  analysisIndicator: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  analysisTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  analysisText: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    marginBottom: 24,
  },
  analyzedImage: {
    height: 200,
    borderRadius: 12,
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
  conditionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 16,
  },
  conditionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#60A5FA',
    marginBottom: 8,
  },
  conditionDescription: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
    marginTop: 8,
    marginRight: 12,
  },
  recommendationText: {
    fontSize: 16,
    color: '#f1f5f9',
    flex: 1,
    lineHeight: 24,
  },
  careSection: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  careText: {
    fontSize: 16,
    color: '#fbbf24',
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disclaimer: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#fca5a5',
    lineHeight: 20,
  },
  textInputSection: {
    marginTop: 32,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  textInput: {
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    marginBottom: 12,
  },
  resultSection: {
    marginTop: 24,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
});