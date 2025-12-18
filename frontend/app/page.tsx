// app/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Shield, 
  Users, 
  Award, 
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Heart,
  Stethoscope,
  Microscope,
  Brain,
  Database,
  Globe,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Youtube,
  ChevronRight,
  LogIn,
  UserCircle,
  ChevronUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Détecter le scroll pour afficher la flèche
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction pour remonter en haut
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const features = [
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Cancer Prediction",
      description: "AI-powered classification of breast cancer using Fine Needle Aspiration data",
      color: "from-blue-500 to-indigo-600",
      path: "/predict",
      role: "oncologist"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Tumor Staging",
      description: "Clinical staging prediction based on tumor characteristics and progression",
      color: "from-purple-500 to-pink-600",
      path: "/stage",
      role: "oncologist"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Recurrence Risk",
      description: "Assessment of cancer recurrence probability and risk stratification",
      color: "from-amber-500 to-orange-600",
      path: "/risk",
      role: "pathologist"
    }
  ];

  const stats = [
    { value: "99.12%", label: "Prediction Accuracy", icon: <Award className="w-5 h-5" /> },
    { value: "10K+", label: "Clinical Cases", icon: <Database className="w-5 h-5" /> },
    { value: "30", label: "Diagnostic Features", icon: <BarChart3 className="w-5 h-5" /> },
    { value: "< 2s", label: "Analysis Time", icon: <Clock className="w-5 h-5" /> }
  ];

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Lead Oncologist",
      expertise: "Breast Cancer Specialist",
      avatar: "SC",
      color: "bg-blue-100 text-blue-600"
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Chief Pathologist",
      expertise: "Histopathology",
      avatar: "MR",
      color: "bg-amber-100 text-amber-600"
    },
    {
      name: "Prof. Elena Ivanova",
      role: "Data Scientist",
      expertise: "Medical AI Research",
      avatar: "EI",
      color: "bg-purple-100 text-purple-600"
    },
    {
      name: "Dr. James Wilson",
      role: "Clinical Researcher",
      expertise: "Oncology Trials",
      avatar: "JW",
      color: "bg-green-100 text-green-600"
    }
  ];

  const testimonials = [
    {
      quote: "This platform has revolutionized our diagnostic workflow. The AI predictions align remarkably well with our clinical findings.",
      author: "Dr. Olivia Martinez",
      position: "Oncology Department Head, Mayo Clinic",
      avatar: "OM"
    },
    {
      quote: "The recurrence risk assessment tool provides invaluable insights for treatment planning and patient counseling.",
      author: "Dr. Robert Kim",
      position: "Chief Pathologist, Johns Hopkins",
      avatar: "RK"
    },
    {
      quote: "As a research tool, it has significantly accelerated our studies on breast cancer progression patterns.",
      author: "Prof. Samantha Green",
      position: "Cancer Research Institute, Stanford",
      avatar: "SG"
    }
  ];

  const faqs = [
    {
      question: "How accurate are the predictions?",
      answer: "Our models achieve 99.12% accuracy on validation datasets, validated against clinical histopathology reports."
    },
    {
      question: "What data is required for analysis?",
      answer: "We require 30 cytological features from Fine Needle Aspiration samples, including mean values, standard errors, and worst measurements."
    },
    {
      question: "Is patient data secure?",
      answer: "Yes, all data is encrypted and anonymized. We comply with HIPAA and GDPR regulations for medical data protection."
    },
    {
      question: "Can I use this for research purposes?",
      answer: "Absolutely! The platform is available for academic and research use with proper institutional approvals."
    }
  ];

  const handleStartDiagnosis = () => {
    router.push('/login');
  };

  const handleFeatureClick = (path: string, role: string) => {
    // Si l'utilisateur clique sur une fonctionnalité, il doit d'abord se connecter
    // On pourrait sauvegarder la destination souhaitée
    localStorage.setItem('redirectAfterLogin', path);
    localStorage.setItem('preferredRole', role);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Flèche "retour en haut" sur le côté droit */}
      <button
        onClick={scrollToTop}
        className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-l-lg shadow-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl group ${showScrollToTop ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16 pointer-events-none'}`}
        aria-label="Retour en haut de la page"
      >
        <ChevronUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Retour en haut
        </div>
      </button>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-white">Trusted by 500+ medical institutions</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">AI-Powered</span><br />
              Cancer Diagnostics
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
              Empowering oncologists and pathologists with cutting-edge machine learning tools 
              for breast cancer prediction, staging, and recurrence risk assessment
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartDiagnosis}
                className="px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Start Diagnosis
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/20"
              >
                Explore Features
              </button>
            </div>

            {/* Login Prompt */}
            <div className="mt-8 inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-3 rounded-lg">
              <UserCircle className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-blue-200">
                Access requires medical professional authentication
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.icon.props.className.includes('Award') ? 'from-yellow-400 to-orange-500' : stat.icon.props.className.includes('Database') ? 'from-blue-400 to-cyan-500' : stat.icon.props.className.includes('BarChart') ? 'from-purple-400 to-pink-500' : 'from-green-400 to-emerald-500'}`}>
                  {React.cloneElement(stat.icon, { className: "w-6 h-6 text-white" })}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Diagnostic Suite</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Three specialized tools designed for different stages of cancer care
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
            <LogIn className="w-4 h-4" />
            <span className="text-sm font-medium">Login required to access tools</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              onClick={() => handleFeatureClick(feature.path, feature.role)}
            >
              <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
              <div className="p-8">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                  {React.cloneElement(feature.icon, { className: "w-8 h-8 text-white" })}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                
                {/* Role Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${feature.role === 'oncologist' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {feature.role === 'oncologist' ? (
                      <>
                        <Stethoscope className="w-3 h-3 mr-1" />
                        For Oncologists
                      </>
                    ) : (
                      <>
                        <Microscope className="w-3 h-3 mr-1" />
                        For Pathologists
                      </>
                    )}
                  </span>
                </div>
                
                <button onClick={(e) => { e.stopPropagation(); handleFeatureClick(feature.path, feature.role); }} className="flex items-center text-blue-600 font-semibold hover:text-blue-800 group-hover:translate-x-1 transition-transform">
                  Access Tool
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Simple three-step process for accurate cancer assessment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 -translate-y-1/2" />
            
            {[
              { step: "01", title: "Login & Select Role", description: "Sign in as oncologist or pathologist based on your expertise", icon: <LogIn className="w-6 h-6" /> },
              { step: "02", title: "AI Analysis", description: "Advanced machine learning algorithms process and analyze the data", icon: <Brain className="w-6 h-6" /> },
              { step: "03", title: "Clinical Insights", description: "Receive detailed reports with predictions, probabilities, and recommendations", icon: <Stethoscope className="w-6 h-6" /> }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                    {step.step}
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 inline-flex mb-4">
                    {React.cloneElement(step.icon, { className: "w-6 h-6 text-blue-600" })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Medical Experts</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Developed in collaboration with leading oncology specialists and researchers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className={`w-20 h-20 rounded-full ${member.color} flex items-center justify-center text-2xl font-bold mx-auto mb-4`}>
                {member.avatar}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-blue-600 font-medium mb-2">{member.role}</p>
              <p className="text-sm text-gray-600">{member.expertise}</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-center space-x-3">
                  <div className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full">Oncology</div>
                  <div className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full">AI Research</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Medical Professionals</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              What leading oncologists and researchers say about our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm text-gray-600">{testimonial.position}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Heart key={star} className="w-4 h-4 fill-pink-400 text-pink-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600">Find answers to common questions about our platform</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                onClick={() => {
                  const answer = document.getElementById(`answer-${index}`);
                  if (answer) {
                    answer.classList.toggle('hidden');
                  }
                }}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 transition-transform" />
              </button>
              <div id={`answer-${index}`} className="hidden px-6 pb-4">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Cancer Diagnosis?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of medical institutions using our platform for accurate, efficient cancer assessment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartDiagnosis}
              className="px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Login to Start Diagnosis
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open('mailto:contact@enahealthy.com', '_blank')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
            >
              Request Institutional Access
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-6">Professional medical credentials required • Free for academic use</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <Heart className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">ENA HEALTHY</h2>
              </div>
              <p className="text-gray-400 mb-6">
                Advanced AI diagnostics for better cancer care outcomes
              </p>
              <div className="flex space-x-4">
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Youtube className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Products</h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index}>
                    <button 
                      onClick={() => handleFeatureClick(feature.path, feature.role)}
                      className="text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      {feature.icon}
                      {feature.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Research Papers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  contact@enahealthy.com
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  Medical Innovation Center
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} ENA HEALTHY. All rights reserved.</p>
            <p className="mt-2">
              <a href="#" className="hover:text-gray-300 mx-2">Privacy Policy</a> • 
              <a href="#" className="hover:text-gray-300 mx-2">Terms of Service</a> • 
              <a href="#" className="hover:text-gray-300 mx-2">Medical Disclaimer</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}