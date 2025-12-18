// app/login/page.tsx
"use client";
import React, { useState } from 'react';
import { 
  Stethoscope, 
  Microscope, 
  LogIn, 
  User, 
  Lock, 
  ArrowRight,
  Shield,
  Heart,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'oncologist' | 'pathologist' | null>(null);
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'institutional' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    licenseNumber: '',
    institution: ''
  });

  const handleRoleSelect = (role: 'oncologist' | 'pathologist') => {
    setSelectedRole(role);
    setLoginMethod(null); // Reset login method when role changes
  };

  const handleLoginMethodSelect = (method: 'credentials' | 'institutional') => {
    setLoginMethod(method);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simuler une authentification réussie
    // Dans une vraie application, vous feriez une requête API ici
    
    const redirectPath = localStorage.getItem('redirectAfterLogin') || 
                       (selectedRole === 'oncologist' ? '/predict' : '/risk');
    
    // Stocker le rôle sélectionné pour les sidebars
    localStorage.setItem('userRole', selectedRole || '');
    // Store preferred role for consistent redirects
    localStorage.setItem('preferredRole', selectedRole || '');
    
    // Rediriger vers la page appropriée
    router.push(redirectPath);
  };

  const handleDemoLogin = (role: 'oncologist' | 'pathologist' | null) => {
    // Login démo sans authentification
    if (!role) return;
    localStorage.setItem('userRole', role);
    // Keep preferred role consistent across flows
    localStorage.setItem('preferredRole', role);
    const redirectPath = role === 'oncologist' ? '/predict' : '/risk';
    router.push(redirectPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">ENA HEALTHY</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Professional medical authentication required. Please select your role and login method.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Role Selection & Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Medical Professional Login</h2>
            
            {/* Role Selection */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Select Your Professional Role
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleRoleSelect('oncologist')}
                  className={`p-6 rounded-xl border-2 transition-all ${selectedRole === 'oncologist' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-lg mb-3 ${selectedRole === 'oncologist' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Oncologist</h4>
                    <p className="text-sm text-gray-600 text-center">Cancer prediction & staging tools</p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleRoleSelect('pathologist')}
                  className={`p-6 rounded-xl border-2 transition-all ${selectedRole === 'pathologist' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'}`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-lg mb-3 ${selectedRole === 'pathologist' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
                      <Microscope className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Pathologist</h4>
                    <p className="text-sm text-gray-600 text-center">Recurrence risk assessment tools</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Login Method Selection */}
            {selectedRole && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Select Login Method
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleLoginMethodSelect('credentials')}
                    className={`p-4 rounded-lg border transition-all ${loginMethod === 'credentials' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${loginMethod === 'credentials' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        <LogIn className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">Credentials</h4>
                        <p className="text-xs text-gray-600">Email & Password</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleLoginMethodSelect('institutional')}
                    className={`p-4 rounded-lg border transition-all ${loginMethod === 'institutional' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${loginMethod === 'institutional' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">Institutional</h4>
                        <p className="text-xs text-gray-600">License & Institution</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Login Form */}
            {selectedRole && loginMethod && (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {loginMethod === 'credentials' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="name@hospital.org"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical License Number
                      </label>
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., MD-123456"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institution/Hospital
                      </label>
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) => setFormData({...formData, institution: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your medical institution"
                        required
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Login as {selectedRole === 'oncologist' ? 'Oncologist' : 'Pathologist'}
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Demo Login Button */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin(selectedRole)}
                  disabled={!selectedRole}
                  className={`w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all border border-gray-300 ${!selectedRole ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Try Demo Version (No Login Required)
                </button>
              </form>
            )}

            {/* Instructions when no role selected */}
            {!selectedRole && (
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Your Role</h3>
                <p className="text-gray-600">
                  Please select whether you are an <span className="font-semibold text-blue-600">Oncologist</span> or{' '}
                  <span className="font-semibold text-amber-600">Pathologist</span> to continue.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Information */}
          <div className="space-y-6">
            {/* Security Info */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6" />
                <h3 className="text-xl font-bold">Secure Medical Platform</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span>HIPAA & GDPR compliant data protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span>End-to-end encryption for all medical data</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span>Professional medical credentials verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span>Regular security audits and compliance checks</span>
                </li>
              </ul>
            </div>

            {/* Role Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Role Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Oncologist Access</h4>
                    <p className="text-sm text-gray-600">
                      Access to cancer prediction and tumor staging tools. Designed for clinical diagnosis and treatment planning.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-lg flex-shrink-0">
                    <Microscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Pathologist Access</h4>
                    <p className="text-sm text-gray-600">
                      Access to recurrence risk assessment and pathology analysis tools. Focus on histopathological evaluation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Need help or have questions about access?{' '}
                  <a href="mailto:support@enahealthy.com" className="text-blue-600 hover:text-blue-800 font-medium">
                    Contact our support team
                  </a>
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-8 text-white">
              <h3 className="text-lg font-bold mb-4">Platform Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-purple-200">Medical Institutions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">99.12%</div>
                  <div className="text-sm text-purple-200">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-sm text-purple-200">Clinical Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-purple-200">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}