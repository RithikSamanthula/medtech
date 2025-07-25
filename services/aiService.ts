import OpenAI from 'openai';

let openai: OpenAI | null = null;

try {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (apiKey && apiKey !== 'your_openai_api_key_here') {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error);
}

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

export interface ImageDescriptionAnalysis {
  features: string;
  possible_categories: string[];
  general_advice: string;
}

export async function analyzeSymptoms(symptoms: string): Promise<SymptomAnalysis> {
  try {
    if (!openai) {
      // Return mock data when OpenAI is not available
      return {
        diagnoses: ['Common cold', 'Viral infection', 'Seasonal allergies'],
        urgency: 'self-care',
        nextSteps: 'Rest, stay hydrated, and monitor symptoms. Consider over-the-counter remedies for comfort.',
        explanation: 'Based on your symptoms, this appears to be a common viral infection. Most cases resolve on their own with proper rest and care.',
        confidence: 75
      };
    }

    const prompt = `You are a medical AI assistant. Analyze the following symptoms and provide a structured response. Be conservative and always recommend professional medical care when in doubt.\n\nSymptoms: "${symptoms}"\n\nPlease provide:\n1. Up to 3 most likely diagnoses (common conditions only)\n2. Urgency level (self-care, see-doctor-soon, or urgent)\n3. Recommended next steps\n4. Brief explanation\n5. Confidence level (0-100)\n\nFormat your response as JSON with these exact keys: diagnoses (array), urgency (string), nextSteps (string), explanation (string), confidence (number).\n\nImportant: This is for informational purposes only and should not replace professional medical advice.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful medical AI assistant that provides preliminary health information. Always emphasize the importance of consulting healthcare professionals."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    const analysis = JSON.parse(response);
    
    // Validate the response structure
    if (!analysis.diagnoses || !analysis.urgency || !analysis.nextSteps || !analysis.explanation) {
      throw new Error('Invalid response structure');
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze symptoms: ${error.message}`);
    } else {
      throw new Error('Failed to analyze symptoms. Please try again.');
    }
  }
}

export async function analyzeImage(imageBase64: string): Promise<ImageDescriptionAnalysis> {
  try {
    if (!openai) {
      // Return mock data when OpenAI is not available
      return {
        features: 'The image shows skin with some visible characteristics that may warrant attention.',
        possible_categories: ['Skin irregularity', 'Surface changes', 'Pigmentation variation'],
        general_advice: 'Consider monitoring for changes and consult a healthcare professional if you have concerns.'
      };
    }

    const prompt = `You are an expert in visual pattern recognition. Carefully observe the provided image and describe any visible features, patterns, or notable aspects in detail.\nDo not provide a diagnosis or medical advice.\nIf you notice anything that could be of general concern, mention it in neutral, informational terms.\nRespond ONLY with valid JSON and nothing else. Do not include any explanation or text outside the JSON object.\n\nFormat your response as JSON with these exact keys:\n- features (string): a detailed description of what is visible in the image\n- possible_categories (array): up to 3 general categories or types this image might belong to (e.g., "skin irregularity", "redness", "swelling")\n- general_advice (string): general, non-medical advice for someone noticing similar features (e.g., "Consider monitoring for changes" or "Consult a professional if concerned")`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful medical AI assistant that provides preliminary visual health assessments. Always emphasize the importance of consulting healthcare professionals for proper diagnosis."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let analysis: ImageDescriptionAnalysis;
    try {
      // Extract JSON from Markdown code block if present
      const match = response.match(/```json\s*([\s\S]*?)\s*```/i) || response.match(/```\s*([\s\S]*?)\s*```/i);
      const jsonString = match ? match[1] : response;
      analysis = JSON.parse(jsonString);
    } catch (err) {
      throw new Error('Failed to parse model response as JSON. Raw response: ' + response);
    }
    // Validate the response structure
    if (!analysis.features || !Array.isArray(analysis.possible_categories) || !analysis.general_advice) {
      throw new Error('Invalid response structure');
    }
    return analysis;
  } catch (error) {
    console.error('Error analyzing image:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze image: ${error.message}`);
    } else {
      throw new Error('Failed to analyze image. Please try again.');
    }
  }
}