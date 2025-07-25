import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Phone, Clock, Navigation, ExternalLink, Search } from 'lucide-react-native';
import * as Location from 'expo-location';

interface CareProvider {
  id: string;
  name: string;
  type: 'urgent-care' | 'hospital' | 'clinic' | 'telehealth';
  address: string;
  phone: string;
  distance: string;
  waitTime: string;
  hours: string;
  rating: number;
}

export default function CareScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [providers, setProviders] = useState<CareProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'We need location access to find nearby healthcare providers.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      loadNearbyProviders();
    } catch (error) {
      console.error('Location error:', error);
      loadNearbyProviders(); // Load mock data even without location
    }
  };

  const loadNearbyProviders = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call (in real app, you'd use Google Maps API or similar)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockProviders: CareProvider[] = [
        {
          id: '1',
          name: 'CityMD Urgent Care',
          type: 'urgent-care',
          address: '123 Main St, New York, NY 10001',
          phone: '(555) 123-4567',
          distance: '0.3 miles',
          waitTime: '15-30 min',
          hours: '8 AM - 10 PM',
          rating: 4.5,
        },
        {
          id: '2',
          name: 'Mount Sinai Hospital',
          type: 'hospital',
          address: '1468 Madison Ave, New York, NY 10029',
          phone: '(555) 987-6543',
          distance: '1.2 miles',
          waitTime: '2-4 hours',
          hours: '24/7',
          rating: 4.8,
        },
        {
          id: '3',
          name: 'NYU Family Health Center',
          type: 'clinic',
          address: '550 1st Ave, New York, NY 10016',
          phone: '(555) 456-7890',
          distance: '0.8 miles',
          waitTime: '45-60 min',
          hours: '7 AM - 7 PM',
          rating: 4.3,
        },
        {
          id: '4',
          name: 'MDLive Telehealth',
          type: 'telehealth',
          address: 'Online Consultation',
          phone: '(555) 111-2222',
          distance: 'Virtual',
          waitTime: '5-15 min',
          hours: '24/7',
          rating: 4.6,
        },
        {
          id: '5',
          name: 'Brooklyn Methodist Hospital',
          type: 'hospital',
          address: '506 6th St, Brooklyn, NY 11215',
          phone: '(555) 333-4444',
          distance: '2.1 miles',
          waitTime: '1-3 hours',
          hours: '24/7',
          rating: 4.4,
        },
      ];
      
      setProviders(mockProviders);
    } catch (error) {
      console.error('Error loading providers:', error);
      Alert.alert('Error', 'Failed to load healthcare providers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProviders = () => {
    if (selectedType === 'all') return providers;
    return providers.filter(provider => provider.type === selectedType);
  };

  const getProviderTypeColor = (type: string) => {
    switch (type) {
      case 'urgent-care': return '#22c55e';
      case 'hospital': return '#EF4444';
      case 'clinic': return '#60A5FA';
      case 'telehealth': return '#a855f7';
      default: return '#6B7280';
    }
  };

  const getProviderTypeLabel = (type: string) => {
    switch (type) {
      case 'urgent-care': return 'Urgent Care';
      case 'hospital': return 'Hospital';
      case 'clinic': return 'Clinic';
      case 'telehealth': return 'Telehealth';
      default: return 'Healthcare';
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`maps://app?daddr=${encodedAddress}`);
  };

  const handleWebsite = (name: string) => {
    // In a real app, you'd have actual website URLs
    Alert.alert('Website', `Opening ${name} website...`);
  };

  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'urgent-care', label: 'Urgent Care' },
    { key: 'hospital', label: 'Hospitals' },
    { key: 'clinic', label: 'Clinics' },
    { key: 'telehealth', label: 'Telehealth' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <LinearGradient
        colors={['#1e293b', '#334155', '#475569']}
        style={styles.header}>
        <Text style={styles.headerTitle}>Find Care</Text>
        <Text style={styles.headerSubtitle}>Locate nearby healthcare providers</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>🚨 Emergency?</Text>
          <Text style={styles.emergencyText}>
            For life-threatening emergencies, call 911 immediately or go to the nearest emergency room.
          </Text>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => handleCall('911')}>
            <Phone size={20} color="#ffffff" />
            <Text style={styles.emergencyButtonText}>Call 911</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersSection}>
          <Text style={styles.filtersTitle}>Filter by Type</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filtersContainer}>
            {filterButtons.map((button) => (
              <TouchableOpacity
                key={button.key}
                style={[
                  styles.filterButton,
                  selectedType === button.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedType(button.key)}>
                <Text style={[
                  styles.filterButtonText,
                  selectedType === button.key && styles.filterButtonTextActive
                ]}>
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.providersSection}>
          <View style={styles.providersSectionHeader}>
            <Text style={styles.sectionTitle}>
              {location ? 'Nearby Providers' : 'Healthcare Providers'}
            </Text>
            <TouchableOpacity onPress={loadNearbyProviders}>
              <Search size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Finding healthcare providers...</Text>
            </View>
          ) : (
            <View style={styles.providersList}>
              {filterProviders().map((provider) => (
                <View key={provider.id} style={styles.providerCard}>
                  <View style={styles.providerHeader}>
                    <View style={styles.providerInfo}>
                      <Text style={styles.providerName}>{provider.name}</Text>
                      <View style={styles.providerMeta}>
                        <View style={[
                          styles.providerTypeTag,
                          { backgroundColor: getProviderTypeColor(provider.type) }
                        ]}>
                          <Text style={styles.providerTypeText}>
                            {getProviderTypeLabel(provider.type)}
                          </Text>
                        </View>
                        <Text style={styles.providerRating}>★ {provider.rating}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.providerDetails}>
                    <View style={styles.providerDetailRow}>
                      <MapPin size={16} color="#6B7280" />
                      <Text style={styles.providerDetailText}>{provider.address}</Text>
                    </View>
                    <View style={styles.providerDetailRow}>
                      <Navigation size={16} color="#6B7280" />
                      <Text style={styles.providerDetailText}>{provider.distance}</Text>
                    </View>
                    <View style={styles.providerDetailRow}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={styles.providerDetailText}>
                        Wait: {provider.waitTime} • Hours: {provider.hours}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.providerActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.callButton]}
                      onPress={() => handleCall(provider.phone)}>
                      <Phone size={18} color="#ffffff" />
                      <Text style={styles.actionButtonText}>Call</Text>
                    </TouchableOpacity>

                    {provider.type !== 'telehealth' && (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.directionsButton]}
                        onPress={() => handleDirections(provider.address)}>
                        <Navigation size={18} color="#3B82F6" />
                        <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>
                          Directions
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                      style={[styles.actionButton, styles.websiteButton]}
                      onPress={() => handleWebsite(provider.name)}>
                      <ExternalLink size={18} color="#6B7280" />
                      <Text style={[styles.actionButtonText, { color: '#6B7280' }]}>
                        Website
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.telehealthPromo}>
          <Text style={styles.telehealthTitle}>💻 Consider Telehealth</Text>
          <Text style={styles.telehealthText}>
            For non-emergency symptoms, telehealth consultations can provide quick access to licensed physicians from the comfort of your home.
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
    padding: 20,
  },
  emergencyCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fca5a5',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 16,
    color: '#fca5a5',
    lineHeight: 24,
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  filtersSection: {
    marginBottom: 24,
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#334155',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#60A5FA',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  filterButtonTextActive: {
    color: '#0f172a',
  },
  providersSection: {
    marginBottom: 24,
  },
  providersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#cbd5e1',
  },
  providersList: {
    gap: 16,
  },
  providerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  providerHeader: {
    marginBottom: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerTypeTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  providerTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  providerRating: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  providerDetails: {
    marginBottom: 16,
  },
  providerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerDetailText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginLeft: 8,
    flex: 1,
  },
  providerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  callButton: {
    backgroundColor: '#22c55e',
  },
  directionsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  websiteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#475569',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  telehealthPromo: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#60A5FA',
  },
  telehealthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#60A5FA',
    marginBottom: 8,
  },
  telehealthText: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
  },
});