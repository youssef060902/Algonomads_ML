"use client";
import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, XCircle, FileText, Loader2, ClipboardList, ArrowRight, ArrowLeft, TrendingUp, Activity, Scale, Target, BarChart3, Stethoscope, Shield } from 'lucide-react';

// Type definitions
interface PredictionResult {
  future_risk_probability_percent: number;
  risk_level: 'Low' | 'Medium' | 'High';
  probability_recurrence: number;
}

interface ProcessedSample {
  features: number[];
  result?: PredictionResult;
  error?: string;
}

interface QuestionnaireData {
  // Mean features (numeric sliders)
  radius_mean: number;
  texture_mean: number;
  perimeter_mean: number;
  area_mean: number;
  smoothness_mean: number;
  compactness_mean: number;
  concavity_mean: number;
  concave_points_mean: number;
  symmetry_mean: number;
  fractal_dimension_mean: number;

  // SE features (numeric sliders)
  radius_se: number;
  texture_se: number;
  perimeter_se: number;
  area_se: number;
  smoothness_se: number;
  compactness_se: number;
  concavity_se: number;
  concave_points_se: number;
  symmetry_se: number;
  fractal_dimension_se: number;

  // Worst features (numeric sliders)
  radius_worst: number;
  texture_worst: number;
  perimeter_worst: number;
  area_worst: number;
  smoothness_worst: number;
  compactness_worst: number;
  concavity_worst: number;
  concave_points_worst: number;
  symmetry_worst: number;
  fractal_dimension_worst: number;

  // Categorical clinical fields remain strings
  tumor_size: string;
  lymph_node_status: string;
  breast_quadrant: string;
} 

const DSO3Predictor = () => {
  const [activeTab, setActiveTab] = useState<'questionnaire' | 'csv'>('questionnaire');

  // CSV Upload state
  const [file, setFile] = useState<File | null>(null);
  const [csvResults, setCsvResults] = useState<ProcessedSample[]>([]);
  
  // Default numeric questionnaire values (medians / typical values)
  const defaultQuestionnaire: QuestionnaireData = {
    radius_mean: 12.0,
    texture_mean: 18.0,
    perimeter_mean: 80.0,
    area_mean: 500.0,
    smoothness_mean: 0.1,
    compactness_mean: 0.08,
    concavity_mean: 0.05,
    concave_points_mean: 0.02,
    symmetry_mean: 0.17,
    fractal_dimension_mean: 0.06,

    radius_se: 0.3,
    texture_se: 1.0,
    perimeter_se: 1.5,
    area_se: 25.0,
    smoothness_se: 0.003,
    compactness_se: 0.015,
    concavity_se: 0.01,
    concave_points_se: 0.005,
    symmetry_se: 0.02,
    fractal_dimension_se: 0.002,

    radius_worst: 14.0,
    texture_worst: 22.0,
    perimeter_worst: 90.0,
    area_worst: 600.0,
    smoothness_worst: 0.12,
    compactness_worst: 0.12,
    concavity_worst: 0.08,
    concave_points_worst: 0.04,
    symmetry_worst: 0.2,
    fractal_dimension_worst: 0.07,

    tumor_size: '',
    lymph_node_status: '',
    breast_quadrant: ''
  };

  // Questionnaire state - 33 features total
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>(defaultQuestionnaire);
  const [questionnaireResult, setQuestionnaireResult] = useState<PredictionResult | null>(null);
  
  // UI & Common state
  const [activeGroup, setActiveGroup] = useState<string>('size');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type FeatureGroup = {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    features: { id: keyof QuestionnaireData; label: string; description: string; min: number; max: number; step: number; defaultValue?: number }[];
  };

  // Feature groups mirrored from TumorStagePredictor for visual parity
  const featureGroups: FeatureGroup[] = [
    {
      id: 'size',
      name: 'Size & Geometry',
      description: 'Tumor dimensions and spatial characteristics',
      icon: <Scale className="w-5 h-5" />,
      features: [
        { id: 'radius_mean', label: 'Radius (Mean)', description: 'Average distance from center', min: 6, max: 28, step: 0.1, defaultValue: defaultQuestionnaire.radius_mean },
        { id: 'perimeter_mean', label: 'Perimeter (Mean)', description: 'Average boundary length', min: 40, max: 150, step: 1, defaultValue: defaultQuestionnaire.perimeter_mean },
        { id: 'area_mean', label: 'Area (Mean)', description: 'Average cross-sectional area', min: 100, max: 2500, step: 10, defaultValue: defaultQuestionnaire.area_mean },
        { id: 'radius_worst', label: 'Radius (Worst)', description: 'Maximum radius observed', min: 8, max: 35, step: 0.1, defaultValue: defaultQuestionnaire.radius_worst },
        { id: 'perimeter_worst', label: 'Perimeter (Worst)', description: 'Maximum perimeter', min: 50, max: 200, step: 1, defaultValue: defaultQuestionnaire.perimeter_worst },
        { id: 'area_worst', label: 'Area (Worst)', description: 'Maximum area', min: 200, max: 5000, step: 10, defaultValue: defaultQuestionnaire.area_worst },
      ]
    },
    {
      id: 'texture',
      name: 'Texture & Density',
      description: 'Cellular texture and structural complexity',
      icon: <Target className="w-5 h-5" />,
      features: [
        { id: 'texture_mean', label: 'Texture (Mean)', description: 'Average gray-scale variation', min: 9, max: 40, step: 0.1, defaultValue: defaultQuestionnaire.texture_mean },
        { id: 'smoothness_mean', label: 'Smoothness (Mean)', description: 'Local radius variation', min: 0.05, max: 0.2, step: 0.001, defaultValue: defaultQuestionnaire.smoothness_mean },
        { id: 'texture_worst', label: 'Texture (Worst)', description: 'Maximum texture irregularity', min: 12, max: 50, step: 0.1, defaultValue: defaultQuestionnaire.texture_worst },
        { id: 'smoothness_worst', label: 'Smoothness (Worst)', description: 'Maximum roughness', min: 0.06, max: 0.25, step: 0.001, defaultValue: defaultQuestionnaire.smoothness_worst },
        { id: 'fractal_dimension_mean', label: 'Fractal Dim. (Mean)', description: 'Average boundary complexity', min: 0.04, max: 0.1, step: 0.001, defaultValue: defaultQuestionnaire.fractal_dimension_mean },
        { id: 'fractal_dimension_worst', label: 'Fractal Dim. (Worst)', description: 'Maximum boundary complexity', min: 0.05, max: 0.15, step: 0.001, defaultValue: defaultQuestionnaire.fractal_dimension_worst },
      ]
    },
    {
      id: 'shape',
      name: 'Shape Irregularity',
      description: 'Contour abnormalities and morphological features',
      icon: <Activity className="w-5 h-5" />,
      features: [
        { id: 'compactness_mean', label: 'Compactness (Mean)', description: 'Average compactness score', min: 0.02, max: 0.3, step: 0.001, defaultValue: defaultQuestionnaire.compactness_mean },
        { id: 'concavity_mean', label: 'Concavity (Mean)', description: 'Average contour concavity', min: 0.0, max: 0.4, step: 0.001, defaultValue: defaultQuestionnaire.concavity_mean },
        { id: 'concave_points_mean', label: 'Concave Points (Mean)', description: 'Average concave portions', min: 0.0, max: 0.2, step: 0.001, defaultValue: defaultQuestionnaire.concave_points_mean },
        { id: 'compactness_worst', label: 'Compactness (Worst)', description: 'Maximum compactness', min: 0.03, max: 0.5, step: 0.001, defaultValue: defaultQuestionnaire.compactness_worst },
        { id: 'concavity_worst', label: 'Concavity (Worst)', description: 'Maximum concavity', min: 0.0, max: 0.6, step: 0.001, defaultValue: defaultQuestionnaire.concavity_worst },
        { id: 'concave_points_worst', label: 'Concave Points (Worst)', description: 'Maximum concave points', min: 0.0, max: 0.3, step: 0.001, defaultValue: defaultQuestionnaire.concave_points_worst },
      ]
    },
    {
      id: 'aggression',
      name: 'Aggressiveness',
      description: 'Indicators of invasive potential and progression',
      icon: <TrendingUp className="w-5 h-5" />,
      features: [
        { id: 'symmetry_mean', label: 'Symmetry (Mean)', description: 'Average bilateral symmetry', min: 0.1, max: 0.3, step: 0.001, defaultValue: defaultQuestionnaire.symmetry_mean },
        { id: 'radius_se', label: 'Radius SE', description: 'Radius standard error', min: 0.1, max: 2.0, step: 0.01, defaultValue: defaultQuestionnaire.radius_se },
        { id: 'perimeter_se', label: 'Perimeter SE', description: 'Perimeter standard error', min: 0.5, max: 8.0, step: 0.1, defaultValue: defaultQuestionnaire.perimeter_se },
        { id: 'area_se', label: 'Area SE', description: 'Area standard error', min: 5, max: 200, step: 1, defaultValue: defaultQuestionnaire.area_se },
        { id: 'symmetry_worst', label: 'Symmetry (Worst)', description: 'Minimum symmetry observed', min: 0.15, max: 0.5, step: 0.001, defaultValue: defaultQuestionnaire.symmetry_worst },
      ]
    },
    {
      id: 'errors',
      name: 'Measurement Variability',
      description: 'Standard errors and measurement consistency',
      icon: <BarChart3 className="w-5 h-5" />,
      features: [
        { id: 'texture_se', label: 'Texture SE', description: 'Texture standard error', min: 0.3, max: 5.0, step: 0.01, defaultValue: defaultQuestionnaire.texture_se },
        { id: 'smoothness_se', label: 'Smoothness SE', description: 'Smoothness standard error', min: 0.001, max: 0.02, step: 0.0001, defaultValue: defaultQuestionnaire.smoothness_se },
        { id: 'compactness_se', label: 'Compactness SE', description: 'Compactness standard error', min: 0.002, max: 0.1, step: 0.0001, defaultValue: defaultQuestionnaire.compactness_se },
        { id: 'concavity_se', label: 'Concavity SE', description: 'Concavity standard error', min: 0.0, max: 0.15, step: 0.0001, defaultValue: defaultQuestionnaire.concavity_se },
        { id: 'concave_points_se', label: 'Concave Points SE', description: 'Concave points standard error', min: 0.0, max: 0.05, step: 0.0001, defaultValue: defaultQuestionnaire.concave_points_se },
        { id: 'symmetry_se', label: 'Symmetry SE', description: 'Symmetry standard error', min: 0.005, max: 0.08, step: 0.0001, defaultValue: defaultQuestionnaire.symmetry_se },
        { id: 'fractal_dimension_se', label: 'Fractal Dim. SE', description: 'Fractal dimension standard error', min: 0.001, max: 0.015, step: 0.0001, defaultValue: defaultQuestionnaire.fractal_dimension_se },
      ]
    },
    {
      id: 'clinical',
      name: 'Clinical',
      description: 'Clinical variables (categorical)',
      icon: <FileText className="w-5 h-5" />,
      features: [
        { id: 'tumor_size', label: 'Tumor Size', description: 'Size of the tumor', min: 0, max: 3, step: 1, defaultValue: 0 } as any,
        { id: 'lymph_node_status', label: 'Lymph Node Status', description: 'Status of lymph nodes', min: 0, max: 3, step: 1, defaultValue: 0 } as any,
        { id: 'breast_quadrant', label: 'Breast Quadrant', description: 'Location of tumor in breast', min: 0, max: 4, step: 1, defaultValue: 0 } as any,
      ]
    }
  ];

  // All 33 questions configuration (numeric sliders for the 30 WBCD features)
  const questions: ({ id: keyof QuestionnaireData; label: string; description: string; type: 'numeric' | 'categorical'; min?: number; max?: number; step?: number; options?: { value: string; label: string }[] })[] = [
    { id: 'radius_mean', label: 'Radius (mean)', description: 'Mean distance from center to perimeter', type: 'numeric', min: 6, max: 28, step: 0.1 },
    { id: 'texture_mean', label: 'Texture (mean)', description: 'Gray-scale variation', type: 'numeric', min: 9, max: 40, step: 0.1 },
    { id: 'perimeter_mean', label: 'Perimeter (mean)', description: 'Perimeter of the cell clump', type: 'numeric', min: 40, max: 150, step: 1 },
    { id: 'area_mean', label: 'Area (mean)', description: 'Area of the cell clump', type: 'numeric', min: 100, max: 2500, step: 10 },
    { id: 'smoothness_mean', label: 'Smoothness (mean)', description: 'Local variation in radius lengths', type: 'numeric', min: 0.05, max: 0.2, step: 0.001 },
    { id: 'compactness_mean', label: 'Compactness (mean)', description: '(perimeter^2 / area) - 1.0', type: 'numeric', min: 0.02, max: 0.3, step: 0.001 },
    { id: 'concavity_mean', label: 'Concavity (mean)', description: 'Severity of concave portions', type: 'numeric', min: 0, max: 0.4, step: 0.001 },
    { id: 'concave_points_mean', label: 'Concave Points (mean)', description: 'Concave portions count', type: 'numeric', min: 0, max: 0.2, step: 0.001 },
    { id: 'symmetry_mean', label: 'Symmetry (mean)', description: 'Symmetry of the cell clump', type: 'numeric', min: 0.1, max: 0.3, step: 0.001 },
    { id: 'fractal_dimension_mean', label: 'Fractal Dimension (mean)', description: 'Boundary complexity', type: 'numeric', min: 0.04, max: 0.1, step: 0.001 },

    { id: 'radius_se', label: 'Radius SE', description: 'Radius standard error', type: 'numeric', min: 0.1, max: 2.0, step: 0.01 },
    { id: 'texture_se', label: 'Texture SE', description: 'Texture standard error', type: 'numeric', min: 0.3, max: 5.0, step: 0.01 },
    { id: 'perimeter_se', label: 'Perimeter SE', description: 'Perimeter standard error', type: 'numeric', min: 0.5, max: 8.0, step: 0.1 },
    { id: 'area_se', label: 'Area SE', description: 'Area standard error', type: 'numeric', min: 5, max: 200, step: 1 },
    { id: 'smoothness_se', label: 'Smoothness SE', description: 'Smoothness standard error', type: 'numeric', min: 0.001, max: 0.02, step: 0.0001 },
    { id: 'compactness_se', label: 'Compactness SE', description: 'Compactness standard error', type: 'numeric', min: 0.002, max: 0.1, step: 0.0001 },
    { id: 'concavity_se', label: 'Concavity SE', description: 'Concavity standard error', type: 'numeric', min: 0.0, max: 0.15, step: 0.0001 },
    { id: 'concave_points_se', label: 'Concave Points SE', description: 'Concave points standard error', type: 'numeric', min: 0.0, max: 0.05, step: 0.0001 },
    { id: 'symmetry_se', label: 'Symmetry SE', description: 'Symmetry standard error', type: 'numeric', min: 0.005, max: 0.08, step: 0.0001 },
    { id: 'fractal_dimension_se', label: 'Fractal Dimension SE', description: 'Fractal dimension standard error', type: 'numeric', min: 0.001, max: 0.015, step: 0.0001 },

    { id: 'radius_worst', label: 'Radius (worst)', description: 'Maximum radius', type: 'numeric', min: 8, max: 35, step: 0.1 },
    { id: 'texture_worst', label: 'Texture (worst)', description: 'Maximum texture', type: 'numeric', min: 12, max: 50, step: 0.1 },
    { id: 'perimeter_worst', label: 'Perimeter (worst)', description: 'Maximum perimeter', type: 'numeric', min: 50, max: 200, step: 1 },
    { id: 'area_worst', label: 'Area (worst)', description: 'Maximum area', type: 'numeric', min: 200, max: 5000, step: 10 },
    { id: 'smoothness_worst', label: 'Smoothness (worst)', description: 'Worst smoothness', type: 'numeric', min: 0.05, max: 0.25, step: 0.001 },
    { id: 'compactness_worst', label: 'Compactness (worst)', description: 'Maximum compactness', type: 'numeric', min: 0.03, max: 0.5, step: 0.001 },
    { id: 'concavity_worst', label: 'Concavity (worst)', description: 'Maximum concavity', type: 'numeric', min: 0.0, max: 0.6, step: 0.001 },
    { id: 'concave_points_worst', label: 'Concave Points (worst)', description: 'Maximum concave points', type: 'numeric', min: 0.0, max: 0.3, step: 0.001 },
    { id: 'symmetry_worst', label: 'Symmetry (worst)', description: 'Worst symmetry', type: 'numeric', min: 0.15, max: 0.5, step: 0.001 },
    { id: 'fractal_dimension_worst', label: 'Fractal Dimension (worst)', description: 'Maximum fractal dimension', type: 'numeric', min: 0.05, max: 0.15, step: 0.001 },

    { id: 'tumor_size', label: 'Tumor Size', description: 'Size of the tumor', type: 'categorical', options: [ { value: 'small', label: 'Small (<2cm)' }, { value: 'medium', label: 'Medium (2-5cm)' }, { value: 'large', label: 'Large (>5cm)' } ] },
    { id: 'lymph_node_status', label: 'Lymph Node Status', description: 'Status of lymph nodes', type: 'categorical', options: [ { value: 'negative', label: 'Negative' }, { value: 'positive', label: 'Positive (1-3)' }, { value: 'extensive', label: 'Extensive (>3)' } ] },
    { id: 'breast_quadrant', label: 'Breast Quadrant', description: 'Location of tumor in breast', type: 'categorical', options: [ { value: 'upper_outer', label: 'Upper Outer' }, { value: 'upper_inner', label: 'Upper Inner' }, { value: 'lower_outer', label: 'Lower Outer' }, { value: 'lower_inner', label: 'Lower Inner' } ] }
  ];

  // Validation: require the clinical categorical fields to be selected
  const isQuestionnaireComplete = !!questionnaire.tumor_size && !!questionnaire.lymph_node_status && !!questionnaire.breast_quadrant;

  // Map questionnaire to 33 numeric features - numeric slider values passed directly
  const questionnaireToFeatures = (data: QuestionnaireData): number[] => {
    const mapping: { [key: string]: { [value: string]: number } } = {
      tumor_size: { small: 1.5, medium: 3.5, large: 7.0 },
      lymph_node_status: { negative: 0, positive: 2, extensive: 5 },
      breast_quadrant: { upper_outer: 1, upper_inner: 2, lower_outer: 3, lower_inner: 4 }
    };

    const features: number[] = [];

    questions.forEach(q => {
      const key = q.id as keyof QuestionnaireData;
      const val = data[key];
      if ((q as any).type === 'numeric') {
        features.push(typeof val === 'number' && !isNaN(val) ? (val as number) : 0);
      } else {
        const s = val as unknown as string;
        const v = mapping[key as string] && mapping[key as string][s] !== undefined ? mapping[key as string][s] : 0;
        features.push(v);
      }
    });

    if (features.length > 33) return features.slice(0, 33);
    while (features.length < 33) features.push(0);
    return features;
  }; 

  // Handle questionnaire submission
  const handleQuestionnaireSubmit = async () => {
    if (!isQuestionnaireComplete) {
      setError('Please answer all questions before submitting');
      return;
    }

    setLoading(true);
    setError(null);
    setQuestionnaireResult(null);

    try {
      const features = questionnaireToFeatures(questionnaire);
      
      const response = await fetch('http://localhost:8000/predict_risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result: PredictionResult = await response.json();
      setQuestionnaireResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  // CSV Upload Functions
  const parseCSV = (text: string): number[][] => {
    const normalized = text.replace(/\r/g, '');
    const rawLines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const data: number[][] = [];
    if (rawLines.length === 0) return data;

    const firstLine = rawLines[0];
    const commaCount = firstLine.split(',').length;
    const semicolonCount = firstLine.split(';').length;
    const delim = semicolonCount > commaCount ? ';' : ',';

    const splitRegex = new RegExp(`${delim}(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)`);
    const rows = rawLines.map(line => line.split(splitRegex).map(f => f.replace(/^\"|\"$/g, '').trim()));

    const numsInFirst = rows[0].map(f => parseFloat(f)).filter(n => !isNaN(n)).length;
    const isHeader = numsInFirst < rows[0].length / 2;
    const startIndex = isHeader ? 1 : 0;

    for (let i = startIndex; i < rows.length; i++) {
      const fields = rows[i];
      const numericValues: number[] = [];
      for (const f of fields) {
        const n = parseFloat(f);
        if (!isNaN(n)) numericValues.push(n);
      }

      if (numericValues.length >= 33) {
        data.push(numericValues.slice(0, 33));
      }
    }

    if (data.length === 0) {
      const cleaned = text.replace(/\"/g, '"').replace(/['"\uFEFF]/g, '');
      const lines = cleaned.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        const nums: number[] = [];
        for (const p of parts) {
          const n = parseFloat(p);
          if (!isNaN(n)) nums.push(n);
        }
        if (nums.length >= 33) data.push(nums.slice(0, 33));
      }
    }

    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setCsvResults([]);
    }
  };

  const handleCSVPredict = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError(null);
    setCsvResults([]);

    try {
      const text = await file.text();
      const samples = parseCSV(text);

      if (samples.length === 0) {
        throw new Error('No valid samples found. Ensure CSV has 33 numeric features per row.');
      }

      const processedResults: ProcessedSample[] = [];
      
      for (const features of samples) {
        try {
          const response = await fetch('http://localhost:8000/predict_risk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ features }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
          }

          const result: PredictionResult = await response.json();
          processedResults.push({ features, result });
        } catch (err) {
          processedResults.push({ 
            features, 
            error: err instanceof Error ? err.message : 'Prediction failed' 
          });
        }
      }

      setCsvResults(processedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const csvStats = csvResults.length > 0 ? {
    total: csvResults.length,
    low: csvResults.filter(r => r.result?.risk_level === 'Low').length,
    medium: csvResults.filter(r => r.result?.risk_level === 'Medium').length,
    high: csvResults.filter(r => r.result?.risk_level === 'High').length,
    errors: csvResults.filter(r => r.error).length,
  } : null;

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'Low': return { color: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
      case 'Medium': return { color: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' };
      case 'High': return { color: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
      default: return { color: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
    }
  };

  const getConfidenceLevel = (probability: number): string => {
    if (probability > 0.7) return 'High';
    if (probability > 0.5) return 'Moderate';
    return 'Low';
  };

  // Preset configurations
  const applyPreset = (preset: 'low' | 'moderate' | 'aggressive' | 'reset') => {
    const presets = {
      low: {
        radius_mean: 10.0,
        area_mean: 300.0,
        compactness_mean: 0.05,
        concavity_mean: 0.02,
        tumor_size: 'small' as const,
        lymph_node_status: 'negative' as const,
      },
      moderate: {
        radius_mean: 14.0,
        area_mean: 700.0,
        compactness_mean: 0.12,
        concavity_mean: 0.08,
        tumor_size: 'medium' as const,
        lymph_node_status: 'positive' as const,
      },
      aggressive: {
        radius_mean: 22.0,
        area_mean: 2000.0,
        compactness_mean: 0.28,
        concavity_mean: 0.25,
        tumor_size: 'large' as const,
        lymph_node_status: 'extensive' as const,
      },
      reset: defaultQuestionnaire
    };

    setQuestionnaire(prev => ({
      ...prev,
      ...presets[preset]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Cancer Recurrence Risk Assessment
          </h1>
          <p className="text-lg font-bold text-gray-600 mb-2">
            ENA HEALTHY 
          </p>
          <p className="text-sm text-gray-500 max-w-3xl mx-auto">
            AI-Powered Recurrence Risk Prediction System for Breast Cancer Assessment
          </p>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800 mb-1">Medical Disclaimer</h3>
              <p className="text-sm text-amber-700">
                This tool provides risk assessment to support clinical decision-making and should NOT be used as the sole basis 
                for treatment decisions. All predictions must be verified by qualified oncologists through comprehensive clinical evaluation.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Feature Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preset Selector */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <Stethoscope className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Clinical Scenarios</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => applyPreset('low')}
                  className="p-4 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors text-left"
                >
                  <div className="font-semibold text-green-700">Low Risk Profile</div>
                  <div className="text-sm text-green-600 mt-1">Small, regular tumor features</div>
                </button>
                <button
                  onClick={() => applyPreset('moderate')}
                  className="p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors text-left"
                >
                  <div className="font-semibold text-yellow-700">Moderate Risk</div>
                  <div className="text-sm text-yellow-600 mt-1">Intermediate features</div>
                </button>
                <button
                  onClick={() => applyPreset('aggressive')}
                  className="p-4 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-left"
                >
                  <div className="font-semibold text-red-700">High Risk</div>
                  <div className="text-sm text-red-600 mt-1">Aggressive characteristics</div>
                </button>
                <button
                  onClick={() => applyPreset('reset')}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="font-semibold text-gray-700">Reset</div>
                  <div className="text-sm text-gray-600 mt-1">Clear all answers</div>
                </button>
              </div>
            </div>

            {/* Feature Group Navigation */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-6">
                <Activity className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Clinical Assessment</h2>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {featureGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setActiveGroup(group.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeGroup === group.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {group.icon}
                      {group.name}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Group Features */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {featureGroups.find(g => g.id === activeGroup)?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {featureGroups.find(g => g.id === activeGroup)?.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featureGroups.find(g => g.id === activeGroup)?.features.map(feature => {
                    const value = questionnaire[feature.id as keyof QuestionnaireData] as any;
                    const isCategorical = feature.id === 'tumor_size' || feature.id === 'lymph_node_status' || feature.id === 'breast_quadrant';
                    const questionMeta = questions.find(q => q.id === feature.id);

                    if (isCategorical) {
                      return (
                        <div key={String(feature.id)} className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            {feature.label}
                          </label>
                          <div className="inline-flex rounded-md shadow-sm" role="group">
                            {questionMeta?.options?.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => setQuestionnaire(prev => ({ ...prev, [feature.id]: opt.value } as any))}
                                className={`px-3 py-2 text-sm font-medium border ${
                                  questionnaire[feature.id as keyof QuestionnaireData] === opt.value 
                                    ? 'bg-indigo-600 text-white border-indigo-600' 
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">{feature.description}</p>
                        </div>
                      );
                    }

                    return (
                      <div key={String(feature.id)} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-gray-700">
                            {feature.label}
                          </label>
                          <span className="text-sm font-semibold text-indigo-600">
                            {typeof value === 'number' 
                              ? value.toFixed(feature.step < 0.01 ? 3 : feature.step < 0.1 ? 2 : 1)
                              : value || ''
                            }
                          </span>
                        </div>
                        <input
                          type="range"
                          min={feature.min}
                          max={feature.max}
                          step={feature.step}
                          value={typeof value === 'number' ? value : feature.defaultValue ?? feature.min}
                          onChange={(e) => setQuestionnaire(prev => ({ ...prev, [feature.id]: Number(e.target.value) } as any))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{feature.min}</span>
                          <span className="text-center">{feature.description}</span>
                          <span>{feature.max}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Prediction & Results */}
          <div className="space-y-6">
            {/* Predict Button */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <button
                onClick={handleQuestionnaireSubmit}
                disabled={loading || !isQuestionnaireComplete}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Recurrence Risk...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Predict Recurrence Risk
                  </>
                )}
              </button>
            </div>

            {/* CSV Upload Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Batch Analysis</h3>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV Data
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      file ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                    }`}>
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {file ? file.name : 'Click to upload CSV'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">33 features per sample</p>
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={handleCSVPredict}
                disabled={!file || loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing {csvResults.length > 0 ? `${csvResults.length + 1} samples` : 'CSV file'}...
                  </>
                ) : (
                  'Analyze Uploaded Data'
                )}
              </button>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Risk Ladder */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Risk Levels</h2>
              </div>

              <div className="space-y-1">
                {[
                  { label: 'Low', color: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
                  { label: 'Medium', color: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
                  { label: 'High', color: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
                ].map((level, index) => (
                  <div
                    key={level.label}
                    className={`p-4 rounded-lg border-2 ${level.border} ${level.color} transition-all duration-300 ${
                      questionnaireResult?.risk_level === level.label ? 'scale-105 shadow-lg' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${level.color} border-2 ${level.border} flex items-center justify-center mr-3`}>
                          <span className={`text-sm font-bold ${level.text}`}>
                            {index + 1}
                          </span>
                        </div>
                        <span className={`font-semibold ${level.text}`}>
                          {level.label}
                        </span>
                      </div>
                      {questionnaireResult && (
                        <span className={`font-bold ${level.text}`}>
                          {questionnaireResult.risk_level === level.label ? `${questionnaireResult.future_risk_probability_percent.toFixed(1)}%` : ''}
                        </span>
                      )}
                    </div>
                    {questionnaireResult?.risk_level === level.label && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${level.color.replace('100', '500')} transition-all duration-500`}
                            style={{ 
                              width: `${questionnaireResult.future_risk_probability_percent}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Results Panel */}
            {questionnaireResult && (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-indigo-200 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Risk Assessment Result
                </h3>

                {/* Primary Result */}
                <div className="text-center mb-8">
                  <div className={`text-5xl font-bold mb-2 ${
                    questionnaireResult.risk_level === 'Low' ? 'text-green-600' :
                    questionnaireResult.risk_level === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {questionnaireResult.risk_level} Risk
                  </div>
                  <div className="text-lg text-gray-600">
                    Recurrence Risk Classification
                  </div>
                </div>

                {/* Confidence */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Future Risk Probability</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {questionnaireResult.future_risk_probability_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      style={{ width: `${questionnaireResult.future_risk_probability_percent}%` }}
                    />
                  </div>
                </div>

                {/* Clinical Interpretation */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Clinical Interpretation</h4>
                      <p className="text-sm text-gray-600">
                        {questionnaireResult.risk_level === 'Low' ? 
                          "Low probability of recurrence. Continue with standard monitoring and follow-up protocols." :
                        questionnaireResult.risk_level === 'Medium' ?
                          "Moderate recurrence risk. Consider additional surveillance and adjuvant therapy evaluation." :
                          "High recurrence probability. Aggressive follow-up and comprehensive treatment planning recommended."
                        }
                      </p>
                      <div className="mt-3 text-xs text-gray-500">
                        Recurrence Probability: {(questionnaireResult.probability_recurrence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => { setQuestionnaireResult(null); setActiveGroup('size'); setError(null); }}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Start New Assessment
                </button>
              </div>
            )}

            {/* Upload Results Summary */}
            {csvResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Batch Results</h3>
                  <span className="text-sm text-gray-600">
                    {csvResults.length} sample{csvResults.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  <div className="p-2 rounded-lg text-center bg-blue-50">
                    <div className="text-lg font-bold text-blue-600">{csvStats?.total}</div>
                    <div className="text-xs text-blue-700">Total</div>
                  </div>
                  <div className="p-2 rounded-lg text-center bg-green-50">
                    <div className="text-lg font-bold text-green-600">{csvStats?.low}</div>
                    <div className="text-xs text-green-700">Low</div>
                  </div>
                  <div className="p-2 rounded-lg text-center bg-yellow-50">
                    <div className="text-lg font-bold text-yellow-600">{csvStats?.medium}</div>
                    <div className="text-xs text-yellow-700">Medium</div>
                  </div>
                  <div className="p-2 rounded-lg text-center bg-red-50">
                    <div className="text-lg font-bold text-red-600">{csvStats?.high}</div>
                    <div className="text-xs text-red-700">High</div>
                  </div>
                  <div className="p-2 rounded-lg text-center bg-gray-50">
                    <div className="text-lg font-bold text-gray-600">{csvStats?.errors}</div>
                    <div className="text-xs text-gray-700">Errors</div>
                  </div>
                </div>

                {/* Individual Results - Collapsible */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    View individual results
                  </summary>
                  <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
                    {csvResults.map((sample, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg ${
                          sample.error 
                            ? 'border-gray-200 bg-gray-50' 
                            : `${getRiskColor(sample.result!.risk_level).border} ${getRiskColor(sample.result!.risk_level).color}`
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">Sample {index + 1}</div>
                          {sample.error ? (
                            <span className="text-sm text-red-600">Error</span>
                          ) : (
                            <div className={`font-bold ${getRiskColor(sample.result!.risk_level).text}`}>
                              {sample.result!.risk_level}
                            </div>
                          )}
                        </div>
                        {!sample.error && (
                          <div className="text-xs text-gray-600 mt-1">
                            Future Risk: {sample.result!.future_risk_probability_percent.toFixed(1)}% • 
                            Recurrence: {(sample.result!.probability_recurrence * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Developed for academic and research purposes</p>
          <p className="mt-1">Advanced recurrence risk assessment for breast cancer</p>
        </div>
      </div>
    </div>
  );
};

export default DSO3Predictor;