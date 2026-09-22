import React from 'react';
import { 
  CheckCircle2, Circle, Clock, FileText, CheckSquare, 
  Send, UserCheck, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ApplicationLifecycleTracker({ scheme, currentStep = 4, onBack }) {
  const { language } = useLanguage();

  const steps = [
    { id: 1, name: 'Scheme Discovered', icon: FileText, desc: 'Identified relevant scheme based on profile.' },
    { id: 2, name: 'Eligibility Checked', icon: UserCheck, desc: 'Passed all AI condition checks.' },
    { id: 3, name: 'Documents Collected', icon: CheckSquare, desc: 'Required documents uploaded.' },
    { id: 4, name: 'Documents Verified', icon: ShieldCheck, desc: 'Cross-document consistency passed.' },
    { id: 5, name: 'Application Ready', icon: CheckCircle2, desc: 'Ready for submission.' },
    { id: 6, name: 'Application Submitted', icon: Send, desc: 'Sent to official portal/nodal officer.' },
    { id: 7, name: 'Under Review', icon: Clock, desc: 'Pending government officer approval.' },
  ];

  if (!scheme) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-sm mb-2">
          <Clock className="w-5 h-5" />
          <span>Application Lifecycle Tracker</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900">{scheme.name_en || scheme.name}</h2>
        <p className="text-slate-500 text-sm mt-1">Track the end-to-end journey of your application.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        
        {/* Progress Line Background */}
        <div className="absolute left-12 top-12 bottom-12 w-0.5 bg-slate-100 sm:left-14" />
        
        {/* Progress Line Foreground */}
        <div 
          className="absolute left-12 top-12 w-0.5 bg-emerald-500 transition-all duration-1000 ease-out sm:left-14"
          style={{ height: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100}%` }}
        />

        <div className="space-y-8 relative z-10">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isUpcoming = currentStep < step.id;

            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-start gap-4 sm:gap-6 group">
                <div className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 transition-colors duration-500 bg-white ${
                  isCompleted ? 'border-emerald-500 text-emerald-500' : 
                  isCurrent ? 'border-indigo-600 text-indigo-600 ring-4 ring-indigo-50' : 
                  'border-slate-200 text-slate-300'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>

                <div className={`pt-1.5 sm:pt-2 transition-colors duration-500 ${
                  isCompleted ? 'text-slate-800' : 
                  isCurrent ? 'text-indigo-900' : 
                  'text-slate-400'
                }`}>
                  <h4 className="font-extrabold text-sm sm:text-base">{step.name}</h4>
                  <p className="text-xs sm:text-sm mt-0.5 opacity-80">{step.desc}</p>
                  
                  {isCurrent && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      In Progress
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button 
          onClick={onBack}
          className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}
