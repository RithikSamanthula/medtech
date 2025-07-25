export interface SymptomAnalysis {
  diagnoses: string[];
  urgency: 'self-care' | 'see-doctor-soon' | 'urgent';
  nextSteps: string;
  explanation: string;
  confidence: number;
}

export interface VisionAnalysis {
  condition: string;
  description: string;
  urgency: 'self-care' | 'see-doctor-soon' | 'urgent';
  recommendations: string[];
  whenToSeekCare: string;
  confidence: number;
}

export interface CareProvider {
  id: string;
  name: string;
  type: 'urgent-care' | 'hospital' | 'clinic' | 'telehealth';
  address: string;
  phone: string;
  website?: string;
  distance: string;
  waitTime: string;
  hours: string;
  rating: number;
  latitude?: number;
  longitude?: number;
}

export interface HealthRecord {
  id: string;
  timestamp: Date;
  type: 'voice' | 'photo';
  symptoms?: string;
  imageUri?: string;
  analysis: SymptomAnalysis | VisionAnalysis;
}