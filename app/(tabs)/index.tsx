import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Camera, Stethoscope, Zap, Shield, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <LinearGradient
        colors={['#1e293b', '#334155', '#475569']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.headerContent}>
          <Stethoscope size={32} color="#ffffff" />
          <Text style={styles.headerTitle}>Symptom Snap</Text>
          <Text style={styles.headerSubtitle}>AI Health Triage in Seconds</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Health Assessment</Text>
        <Text style={styles.sectionDescription}>
          Get instant AI-powered insights about your symptoms. Choose how you'd like to describe your concern:
        </Text>

        <View style={styles.actionGrid}>
          <Link href="/voice" asChild>
            <TouchableOpacity style={[styles.actionCard, styles.voiceCard]}>
              <LinearGradient
                colors={['#1e40af', '#3730a3', '#581c87']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Mic size={40} color="#ffffff" />
                <Text style={styles.cardTitle}>Describe Symptoms</Text>
                <Text style={styles.cardDescription}>
                  Speak naturally about what you're experiencing
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Link>

          <Link href="/camera" asChild>
            <TouchableOpacity style={[styles.actionCard, styles.cameraCard]}>
              <LinearGradient
                colors={['#581c87', '#6b21a8', '#1e40af']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Camera size={40} color="#ffffff" />
                <Text style={styles.cardTitle}>Scan Skin Issue</Text>
                <Text style={styles.cardDescription}>
                  Take a photo of rashes, bumps, or skin concerns
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose Symptom Snap?</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Zap size={24} color="#60A5FA" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Instant Results</Text>
                <Text style={styles.featureDescription}>
                  Get AI-powered insights in under 10 seconds
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Shield size={24} color="#8B5CF6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Privacy First</Text>
                <Text style={styles.featureDescription}>
                  No account required, data not stored
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Clock size={24} color="#F59E0B" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>24/7 Available</Text>
                <Text style={styles.featureDescription}>
                  Get guidance anytime, anywhere
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            <Text style={styles.disclaimerBold}>Medical Disclaimer:</Text> This app provides informational content only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified health provider with any questions about a medical condition.
          </Text>
        </View>
      </View>
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
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  actionCard: {
    width: (width - 60) / 2,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  voiceCard: {
    marginRight: 10,
  },
  cameraCard: {
    marginLeft: 10,
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresList: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
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
  disclaimerBold: {
    fontWeight: 'bold',
  },
});