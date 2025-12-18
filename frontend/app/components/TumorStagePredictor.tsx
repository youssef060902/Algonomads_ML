"use client";
import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, Loader2, Target, TrendingUp, Scale, Activity, BarChart3, Stethoscope, Shield } from 'lucide-react';

// Type definitions matching backend contract
interface StagePredictionResult {
  predicted_stage: string;
  stage_code: number;
  probabilities: {
    "Benign (0)": number;
    "Stage I": number;
    "Stage II": number;
    "Stage III": number;
    "Stage IV": number;
  };
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

interface FeatureValues {
  // Size & Geometry Group
  radius_mean: number;
  perimeter_mean: number;
  area_mean: number;
  radius_worst: number;
  perimeter_worst: number;
  area_worst: number;
  
  // Texture & Density Group
  texture_mean: number;
  smoothness_mean: number;
  texture_worst: number;
  smoothness_worst: number;
  fractal_dimension_mean: number;
  fractal_dimension_worst: number;
  
  // Shape Irregularity Group
  compactness_mean: number;
  concavity_mean: number;
  concave_points_mean: number;
  compactness_worst: number;
  concavity_worst: number;
  concave_points_worst: number;
  
  // Aggressiveness Indicators Group
  symmetry_mean: number;
  radius_se: number;
  perimeter_se: number;
  area_se: number;
  symmetry_worst: number;
  
  // Standard Error Group
  texture_se: number;
  smoothness_se: number;
  compactness_se: number;
  concavity_se: number;
  concave_points_se: number;
  symmetry_se: number;
  fractal_dimension_se: number;
}

const TumorStagePredictor = () => {
  // Feature state - initialized with median values from WBCD dataset
  const [features, setFeatures] = useState<FeatureValues>({
    // Size & Geometry
    radius_mean: 12.0,
    perimeter_mean: 80.0,
    area_mean: 500.0,
    radius_worst: 14.0,
    perimeter_worst: 90.0,
    area_worst: 600.0,
    
    // Texture & Density
    texture_mean: 18.0,
    smoothness_mean: 0.1,
    texture_worst: 22.0,
    smoothness_worst: 0.12,
    fractal_dimension_mean: 0.06,
    fractal_dimension_worst: 0.07,
    
    // Shape Irregularity
    compactness_mean: 0.08,
    concavity_mean: 0.05,
    concave_points_mean: 0.02,
    compactness_worst: 0.12,
    concavity_worst: 0.08,
    concave_points_worst: 0.04,
    
    // Aggressiveness Indicators
    symmetry_mean: 0.17,
    radius_se: 0.3,
    perimeter_se: 1.5,
    area_se: 25.0,
    symmetry_worst: 0.2,
    
    // Standard Error
    texture_se: 1.0,
    smoothness_se: 0.003,
    compactness_se: 0.015,
    concavity_se: 0.01,
    concave_points_se: 0.005,
    symmetry_se: 0.02,
    fractal_dimension_se: 0.002,
  });

  const [prediction, setPrediction] = useState<StagePredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>('size');

  // CSV Upload State
  const [file, setFile] = useState<File | null>(null);
  const [uploadResults, setUploadResults] = useState<StagePredictionResult[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Define feature groups with biological domains
  const featureGroups: FeatureGroup[] = [
    {
      id: 'size',
      name: 'Size & Geometry',
      description: 'Tumor dimensions and spatial characteristics',
      icon: <Scale className="w-5 h-5" />,
      features: [
        { id: 'radius_mean', label: 'Radius (Mean)', description: 'Average distance from center', min: 6, max: 28, step: 0.1, defaultValue: 12.0 },
        { id: 'perimeter_mean', label: 'Perimeter (Mean)', description: 'Average boundary length', min: 40, max: 150, step: 1, defaultValue: 80.0 },
        { id: 'area_mean', label: 'Area (Mean)', description: 'Average cross-sectional area', min: 100, max: 2500, step: 10, defaultValue: 500.0 },
        { id: 'radius_worst', label: 'Radius (Worst)', description: 'Maximum radius observed', min: 8, max: 35, step: 0.1, defaultValue: 14.0 },
        { id: 'perimeter_worst', label: 'Perimeter (Worst)', description: 'Maximum perimeter', min: 50, max: 200, step: 1, defaultValue: 90.0 },
        { id: 'area_worst', label: 'Area (Worst)', description: 'Maximum area', min: 200, max: 5000, step: 10, defaultValue: 600.0 },
      ]
    },
    {
      id: 'texture',
      name: 'Texture & Density',
      description: 'Cellular texture and structural complexity',
      icon: <Target className="w-5 h-5" />,
      features: [
        { id: 'texture_mean', label: 'Texture (Mean)', description: 'Average gray-scale variation', min: 9, max: 40, step: 0.1, defaultValue: 18.0 },
        { id: 'smoothness_mean', label: 'Smoothness (Mean)', description: 'Local radius variation', min: 0.05, max: 0.2, step: 0.001, defaultValue: 0.1 },
        { id: 'texture_worst', label: 'Texture (Worst)', description: 'Maximum texture irregularity', min: 12, max: 50, step: 0.1, defaultValue: 22.0 },
        { id: 'smoothness_worst', label: 'Smoothness (Worst)', description: 'Maximum roughness', min: 0.06, max: 0.25, step: 0.001, defaultValue: 0.12 },
        { id: 'fractal_dimension_mean', label: 'Fractal Dim. (Mean)', description: 'Average boundary complexity', min: 0.04, max: 0.1, step: 0.001, defaultValue: 0.06 },
        { id: 'fractal_dimension_worst', label: 'Fractal Dim. (Worst)', description: 'Maximum boundary complexity', min: 0.05, max: 0.15, step: 0.001, defaultValue: 0.07 },
      ]
    },
    {
      id: 'shape',
      name: 'Shape Irregularity',
      description: 'Contour abnormalities and morphological features',
      icon: <Activity className="w-5 h-5" />,
      features: [
        { id: 'compactness_mean', label: 'Compactness (Mean)', description: 'Average compactness score', min: 0.02, max: 0.3, step: 0.001, defaultValue: 0.08 },
        { id: 'concavity_mean', label: 'Concavity (Mean)', description: 'Average contour concavity', min: 0.0, max: 0.4, step: 0.001, defaultValue: 0.05 },
        { id: 'concave_points_mean', label: 'Concave Points (Mean)', description: 'Average concave portions', min: 0.0, max: 0.2, step: 0.001, defaultValue: 0.02 },
        { id: 'compactness_worst', label: 'Compactness (Worst)', description: 'Maximum compactness', min: 0.03, max: 0.5, step: 0.001, defaultValue: 0.12 },
        { id: 'concavity_worst', label: 'Concavity (Worst)', description: 'Maximum concavity', min: 0.0, max: 0.6, step: 0.001, defaultValue: 0.08 },
        { id: 'concave_points_worst', label: 'Concave Points (Worst)', description: 'Maximum concave points', min: 0.0, max: 0.3, step: 0.001, defaultValue: 0.04 },
      ]
    },
    {
      id: 'aggression',
      name: 'Aggressiveness',
      description: 'Indicators of invasive potential and progression',
      icon: <TrendingUp className="w-5 h-5" />,
      features: [
        { id: 'symmetry_mean', label: 'Symmetry (Mean)', description: 'Average bilateral symmetry', min: 0.1, max: 0.3, step: 0.001, defaultValue: 0.17 },
        { id: 'radius_se', label: 'Radius SE', description: 'Radius standard error', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.3 },
        { id: 'perimeter_se', label: 'Perimeter SE', description: 'Perimeter standard error', min: 0.5, max: 8.0, step: 0.1, defaultValue: 1.5 },
        { id: 'area_se', label: 'Area SE', description: 'Area standard error', min: 5, max: 200, step: 1, defaultValue: 25.0 },
        { id: 'symmetry_worst', label: 'Symmetry (Worst)', description: 'Minimum symmetry observed', min: 0.15, max: 0.5, step: 0.001, defaultValue: 0.2 },
      ]
    },
    {
      id: 'errors',
      name: 'Measurement Variability',
      description: 'Standard errors and measurement consistency',
      icon: <BarChart3 className="w-5 h-5" />,
      features: [
        { id: 'texture_se', label: 'Texture SE', description: 'Texture standard error', min: 0.3, max: 5.0, step: 0.01, defaultValue: 1.0 },
        { id: 'smoothness_se', label: 'Smoothness SE', description: 'Smoothness standard error', min: 0.001, max: 0.02, step: 0.0001, defaultValue: 0.003 },
        { id: 'compactness_se', label: 'Compactness SE', description: 'Compactness standard error', min: 0.002, max: 0.1, step: 0.0001, defaultValue: 0.015 },
        { id: 'concavity_se', label: 'Concavity SE', description: 'Concavity standard error', min: 0.0, max: 0.15, step: 0.0001, defaultValue: 0.01 },
        { id: 'concave_points_se', label: 'Concave Points SE', description: 'Concave points standard error', min: 0.0, max: 0.05, step: 0.0001, defaultValue: 0.005 },
        { id: 'symmetry_se', label: 'Symmetry SE', description: 'Symmetry standard error', min: 0.005, max: 0.08, step: 0.0001, defaultValue: 0.02 },
        { id: 'fractal_dimension_se', label: 'Fractal Dim. SE', description: 'Fractal dimension standard error', min: 0.001, max: 0.015, step: 0.0001, defaultValue: 0.002 },
      ]
    }
  ];

  // Convert features to the 30-element array in correct order (matches questionnaire order)
  const featuresToArray = (): number[] => {
    // This order must match the backend's expected feature order
    // Using the same order as the original questionnaire for consistency
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
      
      const response = await fetch('http://localhost:8000/predict_stage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features: featureArray }),
      });

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`);
      }

      const result: StagePredictionResult = await response.json();
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  // CSV Upload Functions
  const parseCSV = (text: string): number[][] => {
    // Normalize and split lines
    const normalized = text.replace(/\r/g, '');
    const rawLines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const data: number[][] = [];
    if (rawLines.length === 0) return data;

    // Detect delimiter (comma vs semicolon)
    const firstLine = rawLines[0];
    const commaCount = firstLine.split(',').length;
    const semicolonCount = firstLine.split(';').length;
    const delim = semicolonCount > commaCount ? ';' : ',';

    // Split respecting quoted fields
    const splitRegex = new RegExp(`${delim}(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)`);

    // Remove outer quotes if entire line is wrapped
    const processedLines = rawLines.map(line => (line.startsWith('"') && line.endsWith('"')) ? line.slice(1, -1) : line);

    const rows = processedLines.map(line => line.split(splitRegex).map(f => f.replace(/^\"|\"$/g, '').trim()));

    // Check if first row is header
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

    // Fallback: try stripping quotes and splitting by comma
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

      const results: StagePredictionResult[] = [];
      
      // Process each sample sequentially
      for (const features of samples) {
        const response = await fetch('http://localhost:8000/predict_stage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ features }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result: StagePredictionResult = await response.json();
        results.push(result);
      }

      setUploadResults(results);
      
      // If only one sample, also update the main prediction display
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
  const applyPreset = (preset: 'small' | 'moderate' | 'advanced' | 'aggressive') => {
    const presets = {
      small: {
        radius_mean: 10.0,
        area_mean: 300.0,
        compactness_mean: 0.05,
        concavity_mean: 0.02,
      },
      moderate: {
        radius_mean: 14.0,
        area_mean: 700.0,
        compactness_mean: 0.12,
        concavity_mean: 0.08,
      },
      advanced: {
        radius_mean: 18.0,
        area_mean: 1200.0,
        compactness_mean: 0.2,
        concavity_mean: 0.15,
      },
      aggressive: {
        radius_mean: 22.0,
        area_mean: 2000.0,
        compactness_mean: 0.28,
        concavity_mean: 0.25,
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
            Tumor Stage Prediction System
          </h1>
          <p className="text-lg font-bold text-gray-600 mb-2">
            ENA HEALTHY 
          </p>
          <p className="text-sm text-gray-500 max-w-3xl mx-auto">
            Adjust tumor characteristics below to simulate progression and predict clinical staging based on FNA cytology data
          </p>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800 mb-1">Clinical Advisory</h3>
              <p className="text-sm text-amber-700">
                This tool provides staging predictions for educational and research purposes. 
                All clinical decisions must be validated through comprehensive histopathological analysis.
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
                  onClick={() => applyPreset('small')}
                  className="p-4 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors text-left"
                >
                  <div className="font-semibold text-green-700">Early Detection</div>
                  <div className="text-sm text-green-600 mt-1">Small, well-defined tumor</div>
                </button>
                <button
                  onClick={() => applyPreset('moderate')}
                  className="p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors text-left"
                >
                  <div className="font-semibold text-yellow-700">Localized</div>
                  <div className="text-sm text-yellow-600 mt-1">Moderate progression</div>
                </button>
                <button
                  onClick={() => applyPreset('advanced')}
                  className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors text-left"
                >
                  <div className="font-semibold text-orange-700">Advanced</div>
                  <div className="text-sm text-orange-600 mt-1">Regional involvement</div>
                </button>
                <button
                  onClick={() => applyPreset('aggressive')}
                  className="p-4 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-left"
                >
                  <div className="font-semibold text-red-700">Aggressive</div>
                  <div className="text-sm text-red-600 mt-1">High invasive potential</div>
                </button>
              </div>
            </div>

            {/* Feature Group Navigation */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-6">
                <Activity className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Tumor Characteristics</h2>
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
                          {features[feature.id].toFixed(feature.step < 0.01 ? 3 : 1)}
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
                        <span>Low</span>
                        <span className="text-center">{feature.description}</span>
                        <span>High</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Staging Visualization */}
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
                    Analyzing Tumor Progression...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5 mr-2" />
                    Predict Tumor Stage
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

            {/* Staging Ladder */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Tumor Progression</h2>
              </div>

              <div className="space-y-1">
                {[
                  { label: 'Benign (0)', color: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
                  { label: 'Stage I', color: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
                  { label: 'Stage II', color: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
                  { label: 'Stage III', color: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
                  { label: 'Stage IV', color: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
                ].map((stage, index) => (
                  <div
                    key={stage.label}
                    className={`p-4 rounded-lg border-2 ${stage.border} ${stage.color} transition-all duration-300 ${
                      prediction?.predicted_stage === stage.label ? 'scale-105 shadow-lg' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${stage.color} border-2 ${stage.border} flex items-center justify-center mr-3`}>
                          <span className={`text-sm font-bold ${stage.text}`}>
                            {index}
                          </span>
                        </div>
                        <span className={`font-semibold ${stage.text}`}>
                          {stage.label}
                        </span>
                      </div>
                      {prediction && (
                        <span className={`font-bold ${stage.text}`}>
                          {(prediction.probabilities[stage.label as keyof typeof prediction.probabilities] * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {prediction && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${stage.color.replace('100', '500')} transition-all duration-500`}
                            style={{ 
                              width: `${prediction.probabilities[stage.label as keyof typeof prediction.probabilities] * 100}%` 
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
                  Staging Result
                </h3>

                {/* Primary Result */}
                <div className="text-center mb-8">
                  <div className={`text-5xl font-bold mb-2 ${
                    prediction.stage_code === 0 ? 'text-green-600' :
                    prediction.stage_code === 1 ? 'text-blue-600' :
                    prediction.stage_code === 2 ? 'text-yellow-600' :
                    prediction.stage_code === 3 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {prediction.predicted_stage}
                  </div>
                  <div className="text-lg text-gray-600">
                    Predicted Clinical Stage
                  </div>
                </div>

                {/* Confidence */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Model Confidence</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {getConfidenceLevel(Math.max(...Object.values(prediction.probabilities)))}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      style={{ width: `${Math.max(...Object.values(prediction.probabilities)) * 100}%` }}
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
                        {prediction.stage_code === 0 ? 
                          "Findings consistent with benign characteristics. Continue routine monitoring." :
                        prediction.stage_code === 1 ?
                          "Early-stage disease suggested. Consider localized treatment options." :
                        prediction.stage_code === 2 ?
                          "Moderate progression indicated. Regional treatment and systemic therapy recommended." :
                        prediction.stage_code === 3 ?
                          "Advanced regional involvement. Aggressive multimodal therapy required." :
                          "Metastatic disease probable. Comprehensive systemic treatment and palliative care indicated."
                        }
                      </p>
                      <div className="mt-3 text-xs text-gray-500">
                        Recommendation: Further histopathological validation required.
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
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Object.entries(uploadResults.reduce((acc, result) => {
                    acc[result.predicted_stage] = (acc[result.predicted_stage] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)).map(([stage, count]) => {
                    const colorMap: Record<string, string> = {
                      'Benign (0)': 'bg-green-100 text-green-800',
                      'Stage I': 'bg-blue-100 text-blue-800',
                      'Stage II': 'bg-yellow-100 text-yellow-800',
                      'Stage III': 'bg-orange-100 text-orange-800',
                      'Stage IV': 'bg-red-100 text-red-800',
                    };
                    
                    return (
                      <div key={stage} className={`p-2 rounded-lg text-center ${colorMap[stage] || 'bg-gray-100 text-gray-800'}`}>
                        <div className="text-lg font-bold">{count}</div>
                        <div className="text-xs">{stage.replace(' (0)', '')}</div>
                      </div>
                    );
                  })}
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
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">Sample {index + 1}</div>
                          <div className={`font-bold ${
                            result.stage_code === 0 ? 'text-green-600' :
                            result.stage_code === 1 ? 'text-blue-600' :
                            result.stage_code === 2 ? 'text-yellow-600' :
                            result.stage_code === 3 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {result.predicted_stage}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Confidence: {getConfidenceLevel(Math.max(...Object.values(result.probabilities)))}
                          {' • '}
                          Max probability: {(Math.max(...Object.values(result.probabilities)) * 100).toFixed(1)}%
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
          <p>Tumor Stage Prediction System • Based on AJCC Cancer Staging System</p>
          <p className="mt-1">For educational and research purposes only</p>
        </div>
      </div>
    </div>
  );
};

export default TumorStagePredictor;