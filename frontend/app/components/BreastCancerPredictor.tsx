"use client";
import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, XCircle, FileText, Loader2, ClipboardList, Target, TrendingUp, Scale, Activity, BarChart3, Stethoscope, Shield } from 'lucide-react';

// Type definitions
interface PredictionResult {
  prediction: 'Benign' | 'Malignant';
  probability_malignant: number;
}

interface ProcessedSample {
  features: number[];
  result?: PredictionResult;
  error?: string;
}

interface FeatureValues {
  // Mean features
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
  
  // SE features
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
  
  // Worst features
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
}

interface FeatureGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: {
    id: keyof FeatureValues;
    label: string;
    description: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
  }[];
}

const BreastCancerPredictor = () => {
  // Feature state - initialized with median values from WBCD dataset
  const [features, setFeatures] = useState<FeatureValues>({
    // Mean features
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
    
    // SE features
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
    
    // Worst features
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
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>('mean');

  // CSV Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploadResults, setUploadResults] = useState<PredictionResult[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Define feature groups with biological domains - ALL 30 FEATURES
  const featureGroups: FeatureGroup[] = [
    {
      id: 'mean',
      name: 'Mean Characteristics',
      description: 'Average tumor cellular features',
      icon: <Target className="w-5 h-5" />,
      features: [
        { id: 'radius_mean', label: 'Radius (Mean)', description: 'Average distance from center', min: 6, max: 28, step: 0.1, defaultValue: 12.0 },
        { id: 'texture_mean', label: 'Texture (Mean)', description: 'Gray-scale variation', min: 9, max: 40, step: 0.1, defaultValue: 18.0 },
        { id: 'perimeter_mean', label: 'Perimeter (Mean)', description: 'Boundary length', min: 40, max: 150, step: 1, defaultValue: 80.0 },
        { id: 'area_mean', label: 'Area (Mean)', description: 'Cross-sectional area', min: 100, max: 2500, step: 10, defaultValue: 500.0 },
        { id: 'smoothness_mean', label: 'Smoothness (Mean)', description: 'Local radius variation', min: 0.05, max: 0.2, step: 0.001, defaultValue: 0.1 },
        { id: 'compactness_mean', label: 'Compactness (Mean)', description: '(perimeter²/area) - 1.0', min: 0.02, max: 0.3, step: 0.001, defaultValue: 0.08 },
        { id: 'concavity_mean', label: 'Concavity (Mean)', description: 'Severity of concave portions', min: 0.0, max: 0.4, step: 0.001, defaultValue: 0.05 },
        { id: 'concave_points_mean', label: 'Concave Points (Mean)', description: 'Number of concave portions', min: 0.0, max: 0.2, step: 0.001, defaultValue: 0.02 },
        { id: 'symmetry_mean', label: 'Symmetry (Mean)', description: 'Bilateral symmetry', min: 0.1, max: 0.3, step: 0.001, defaultValue: 0.17 },
        { id: 'fractal_dimension_mean', label: 'Fractal Dim. (Mean)', description: 'Boundary complexity', min: 0.04, max: 0.1, step: 0.001, defaultValue: 0.06 },
      ]
    },
    {
      id: 'worst',
      name: 'Worst Features',
      description: 'Maximum observed characteristics',
      icon: <TrendingUp className="w-5 h-5" />,
      features: [
        { id: 'radius_worst', label: 'Radius (Worst)', description: 'Maximum radius', min: 8, max: 35, step: 0.1, defaultValue: 14.0 },
        { id: 'texture_worst', label: 'Texture (Worst)', description: 'Maximum texture', min: 12, max: 50, step: 0.1, defaultValue: 22.0 },
        { id: 'perimeter_worst', label: 'Perimeter (Worst)', description: 'Maximum perimeter', min: 50, max: 200, step: 1, defaultValue: 90.0 },
        { id: 'area_worst', label: 'Area (Worst)', description: 'Maximum area', min: 200, max: 5000, step: 10, defaultValue: 600.0 },
        { id: 'smoothness_worst', label: 'Smoothness (Worst)', description: 'Maximum roughness', min: 0.06, max: 0.25, step: 0.001, defaultValue: 0.12 },
        { id: 'compactness_worst', label: 'Compactness (Worst)', description: 'Maximum compactness', min: 0.03, max: 0.5, step: 0.001, defaultValue: 0.12 },
        { id: 'concavity_worst', label: 'Concavity (Worst)', description: 'Maximum concavity', min: 0.0, max: 0.6, step: 0.001, defaultValue: 0.08 },
        { id: 'concave_points_worst', label: 'Concave Points (Worst)', description: 'Maximum concave points', min: 0.0, max: 0.3, step: 0.001, defaultValue: 0.04 },
        { id: 'symmetry_worst', label: 'Symmetry (Worst)', description: 'Minimum symmetry', min: 0.15, max: 0.5, step: 0.001, defaultValue: 0.2 },
        { id: 'fractal_dimension_worst', label: 'Fractal Dim. (Worst)', description: 'Maximum fractal dimension', min: 0.05, max: 0.15, step: 0.001, defaultValue: 0.07 },
      ]
    },
    {
      id: 'errors',
      name: 'Standard Errors',
      description: 'Measurement variability and consistency',
      icon: <BarChart3 className="w-5 h-5" />,
      features: [
        { id: 'radius_se', label: 'Radius SE', description: 'Radius standard error', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.3 },
        { id: 'texture_se', label: 'Texture SE', description: 'Texture standard error', min: 0.3, max: 5.0, step: 0.01, defaultValue: 1.0 },
        { id: 'perimeter_se', label: 'Perimeter SE', description: 'Perimeter standard error', min: 0.5, max: 8.0, step: 0.1, defaultValue: 1.5 },
        { id: 'area_se', label: 'Area SE', description: 'Area standard error', min: 5, max: 200, step: 1, defaultValue: 25.0 },
        { id: 'smoothness_se', label: 'Smoothness SE', description: 'Smoothness standard error', min: 0.001, max: 0.02, step: 0.0001, defaultValue: 0.003 },
        { id: 'compactness_se', label: 'Compactness SE', description: 'Compactness standard error', min: 0.002, max: 0.1, step: 0.0001, defaultValue: 0.015 },
        { id: 'concavity_se', label: 'Concavity SE', description: 'Concavity standard error', min: 0.0, max: 0.15, step: 0.0001, defaultValue: 0.01 },
        { id: 'concave_points_se', label: 'Concave Points SE', description: 'Concave points standard error', min: 0.0, max: 0.05, step: 0.0001, defaultValue: 0.005 },
        { id: 'symmetry_se', label: 'Symmetry SE', description: 'Symmetry standard error', min: 0.005, max: 0.08, step: 0.0001, defaultValue: 0.02 },
        { id: 'fractal_dimension_se', label: 'Fractal Dim. SE', description: 'Fractal dimension standard error', min: 0.001, max: 0.015, step: 0.0001, defaultValue: 0.002 },
      ]
    }
  ];

  // Convert features to the 30-element array in correct order
  const featuresToArray = (): number[] => {
    return [
      // Mean features (1-10)
      features.radius_mean,
      features.texture_mean,
      features.perimeter_mean,
      features.area_mean,
      features.smoothness_mean,
      features.compactness_mean,
      features.concavity_mean,
      features.concave_points_mean,
      features.symmetry_mean,
      features.fractal_dimension_mean,
      
      // SE features (11-20)
      features.radius_se,
      features.texture_se,
      features.perimeter_se,
      features.area_se,
      features.smoothness_se,
      features.compactness_se,
      features.concavity_se,
      features.concave_points_se,
      features.symmetry_se,
      features.fractal_dimension_se,
      
      // Worst features (21-30)
      features.radius_worst,
      features.texture_worst,
      features.perimeter_worst,
      features.area_worst,
      features.smoothness_worst,
      features.compactness_worst,
      features.concavity_worst,
      features.concave_points_worst,
      features.symmetry_worst,
      features.fractal_dimension_worst,
    ];
  };

  const handleFeatureChange = (id: keyof FeatureValues, value: number) => {
    setFeatures(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const featureArray = featuresToArray();
      
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features: featureArray }),
      });

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`);
      }

      const result: PredictionResult = await response.json();
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction');
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
      if (numericValues.length >= 30) data.push(numericValues.slice(0, 30));
    }

    if (data.length === 0) {
      const cleaned = text.replace(/['"\uFEFF]/g, '');
      const lines = cleaned.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        const nums: number[] = [];
        for (const p of parts) {
          const n = parseFloat(p);
          if (!isNaN(n)) nums.push(n);
        }
        if (nums.length >= 30) data.push(nums.slice(0, 30));
      }
    }

    return data;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadError(null);
      setUploadResults([]);
    }
  };

  const handleUploadPredict = async () => {
    if (!file) {
      setUploadError('Please select a CSV file');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadResults([]);

    try {
      const text = await file.text();
      const samples = parseCSV(text);

      if (samples.length === 0) {
        throw new Error('No valid samples found. Ensure CSV has 30 numeric features per row.');
      }

      const results: PredictionResult[] = [];
      
      for (const features of samples) {
        const response = await fetch('http://localhost:8000/predict', {
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
        results.push(result);
      }

      setUploadResults(results);
      
      if (results.length === 1) {
        setPrediction(results[0]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setUploadLoading(false);
    }
  };

  const getConfidenceLevel = (probability: number): string => {
    if (probability > 0.7) return 'High';
    if (probability > 0.5) return 'Moderate';
    return 'Low';
  };

  const getActiveGroupFeatures = () => {
    return featureGroups.find(g => g.id === activeGroup)?.features || [];
  };

  // Preset configurations
  const applyPreset = (preset: 'benign' | 'moderate' | 'malignant' | 'reset') => {
    const presets = {
      benign: {
        radius_mean: 10.0,
        area_mean: 300.0,
        compactness_mean: 0.05,
        concavity_mean: 0.02,
        texture_mean: 15.0,
        symmetry_mean: 0.15,
        radius_worst: 12.0,
        area_worst: 400.0,
        compactness_worst: 0.08,
        concavity_worst: 0.03,
      },
      moderate: {
        radius_mean: 14.0,
        area_mean: 700.0,
        compactness_mean: 0.12,
        concavity_mean: 0.08,
        texture_mean: 20.0,
        symmetry_mean: 0.18,
        radius_worst: 16.0,
        area_worst: 900.0,
        compactness_worst: 0.15,
        concavity_worst: 0.1,
      },
      malignant: {
        radius_mean: 20.0,
        area_mean: 1500.0,
        compactness_mean: 0.25,
        concavity_mean: 0.2,
        texture_mean: 30.0,
        symmetry_mean: 0.25,
        radius_worst: 25.0,
        area_worst: 2500.0,
        compactness_worst: 0.3,
        concavity_worst: 0.25,
      },
      reset: {
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
      }
    };

    setFeatures(prev => ({
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
            Cancer prediction
          </h1>
          <p className="text-lg font-bold text-gray-600 mb-2">
            ENA HEALTHY 
          </p>
          <p className="text-sm text-gray-500 max-w-3xl mx-auto">
            Advanced machine learning analysis for breast cancer classification using Fine Needle Aspiration (FNA) cytology data
          </p>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800 mb-1">Medical Disclaimer</h3>
              <p className="text-sm text-amber-700">
                This tool is designed to support clinical decision-making and should NOT be used as the sole basis 
                for diagnosis. All predictions must be verified by qualified medical professionals through proper 
                clinical examination and histopathological analysis.
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
                  onClick={() => applyPreset('benign')}
                  className="p-4 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors text-left"
                >
                  <div className="font-semibold text-green-700">Benign Profile</div>
                  <div className="text-sm text-green-600 mt-1">Small, regular features</div>
                </button>
                <button
                  onClick={() => applyPreset('moderate')}
                  className="p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors text-left"
                >
                  <div className="font-semibold text-yellow-700">Intermediate</div>
                  <div className="text-sm text-yellow-600 mt-1">Moderate characteristics</div>
                </button>
                <button
                  onClick={() => applyPreset('malignant')}
                  className="p-4 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-left"
                >
                  <div className="font-semibold text-red-700">Malignant</div>
                  <div className="text-sm text-red-600 mt-1">High-risk features</div>
                </button>
                <button
                  onClick={() => applyPreset('reset')}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="font-semibold text-gray-700">Reset</div>
                  <div className="text-sm text-gray-600 mt-1">Clear all values</div>
                </button>
              </div>
            </div>

            {/* Feature Group Navigation */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-6">
                <Activity className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Cytological Characteristics</h2>
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
                  {getActiveGroupFeatures().map(feature => (
                    <div key={feature.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">
                          {feature.label}
                        </label>
                        <span className="text-sm font-semibold text-indigo-600">
                          {features[feature.id].toFixed(feature.step < 0.01 ? 3 : feature.step < 0.1 ? 2 : 1)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={feature.min}
                        max={feature.max}
                        step={feature.step}
                        value={features[feature.id]}
                        onChange={(e) => handleFeatureChange(feature.id, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{feature.min}</span>
                        <span className="text-center">{feature.description}</span>
                        <span>{feature.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Prediction & Results */}
          <div className="space-y-6">
            {/* Predict Button */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Cytological Features...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5 mr-2" />
                    Predict Diagnosis
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
                      <p className="text-xs text-gray-500 mt-1">30 features per sample</p>
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
                onClick={handleUploadPredict}
                disabled={!file || uploadLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {uploadLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing {uploadResults.length > 0 ? `${uploadResults.length + 1} samples` : 'CSV file'}...
                  </>
                ) : (
                  'Analyze Uploaded Data'
                )}
              </button>

              {uploadError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-800">{uploadError}</p>
                </div>
              )}
            </div>

            {/* Diagnosis Ladder */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Diagnosis Classification</h2>
              </div>

              <div className="space-y-1">
                {[
                  { label: 'Benign', color: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
                  { label: 'Malignant', color: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
                ].map((diagnosis, index) => (
                  <div
                    key={diagnosis.label}
                    className={`p-4 rounded-lg border-2 ${diagnosis.border} ${diagnosis.color} transition-all duration-300 ${
                      prediction?.prediction === diagnosis.label ? 'scale-105 shadow-lg' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${diagnosis.color} border-2 ${diagnosis.border} flex items-center justify-center mr-3`}>
                          <span className={`text-sm font-bold ${diagnosis.text}`}>
                            {index + 1}
                          </span>
                        </div>
                        <span className={`font-semibold ${diagnosis.text}`}>
                          {diagnosis.label}
                        </span>
                      </div>
                      {prediction && (
                        <span className={`font-bold ${diagnosis.text}`}>
                          {prediction.prediction === diagnosis.label ? 
                            `${(diagnosis.label === 'Malignant' ? prediction.probability_malignant * 100 : (1 - prediction.probability_malignant) * 100).toFixed(1)}%` 
                            : ''}
                        </span>
                      )}
                    </div>
                    {prediction?.prediction === diagnosis.label && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${diagnosis.color.replace('100', '500')} transition-all duration-500`}
                            style={{ 
                              width: `${diagnosis.label === 'Malignant' ? prediction.probability_malignant * 100 : (1 - prediction.probability_malignant) * 100}%` 
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
            {prediction && (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-indigo-200 rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Diagnosis Result
                </h3>

                {/* Primary Result */}
                <div className="text-center mb-8">
                  <div className={`text-5xl font-bold mb-2 ${
                    prediction.prediction === 'Benign' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {prediction.prediction}
                  </div>
                  <div className="text-lg text-gray-600">
                    Classification Result
                  </div>
                </div>

                {/* Confidence */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Malignancy Probability</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {(prediction.probability_malignant * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        prediction.probability_malignant > 0.5 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${prediction.probability_malignant * 100}%` }}
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
                        {prediction.prediction === 'Benign' ? 
                          "Findings consistent with benign characteristics. Continue routine monitoring and follow-up protocols." :
                          "Malignant features detected. Immediate histopathological confirmation and treatment planning recommended."
                        }
                      </p>
                      <div className="mt-3 text-xs text-gray-500">
                        Model Confidence: {getConfidenceLevel(prediction.probability_malignant)} • 
                        {(Math.abs(prediction.probability_malignant - 0.5) * 200).toFixed(1)}% certainty
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Results Summary */}
            {uploadResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Batch Results</h3>
                  <span className="text-sm text-gray-600">
                    {uploadResults.length} sample{uploadResults.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2 rounded-lg text-center bg-blue-50">
                    <div className="text-lg font-bold text-blue-600">{uploadResults.length}</div>
                    <div className="text-xs text-blue-700">Total</div>
                  </div>
                  <div className="p-2 rounded-lg text-center bg-green-50">
                    <div className="text-lg font-bold text-green-600">
                      {uploadResults.filter(r => r.prediction === 'Benign').length}
                    </div>
                    <div className="text-xs text-green-700">Benign</div>
                  </div>
                  <div className="p-2 rounded-lg text-center bg-red-50">
                    <div className="text-lg font-bold text-red-600">
                      {uploadResults.filter(r => r.prediction === 'Malignant').length}
                    </div>
                    <div className="text-xs text-red-700">Malignant</div>
                  </div>
                </div>

                {/* Individual Results - Collapsible */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    View individual results
                  </summary>
                  <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
                    {uploadResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg ${
                          result.prediction === 'Benign' 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-red-300 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">Sample {index + 1}</div>
                          <div className={`font-bold ${
                            result.prediction === 'Benign' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {result.prediction}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Probability: {(result.probability_malignant * 100).toFixed(1)}% • 
                          Confidence: {getConfidenceLevel(result.probability_malignant)}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Developed for academic and research purposes</p>
          <p className="mt-1">Based on Wisconsin Breast Cancer Database (WBCD)</p>
        </div>
      </div>
    </div>
  );
};

export default BreastCancerPredictor;