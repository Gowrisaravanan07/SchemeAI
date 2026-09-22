import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, User, MapPin, DollarSign, 
  Briefcase, GraduationCap, CheckCircle2, RotateCw, X, Phone, Mail
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TN_DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 
  'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Dindigul',
  'Kanchipuram', 'Cuddalore', 'Thoothukudi', 'Tiruppur', 'Karur',
  'Kanniyakumari', 'Virudhunagar', 'Namakkal', 'Pudukkottai', 'Villupuram'
];

const OTHER_STATES = [
  'Tamil Nadu', 'Uttar Pradesh', 'Karnataka', 'Maharashtra', 
  'Delhi', 'Bihar', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Gujarat'
];

export default function ScreeningWizard({ onSubmit, isLoading, onCancel, error }) {
  const { language, t } = useLanguage();

  const [formData, setFormData] = useState({
    name: 'Citizen Applicant',
    phone: '',
    email: '',
    state: 'Tamil Nadu',
    district: 'Chennai',
    age: 20,
    gender: 'female',
    occupation: 'Student',
    income: 250000,
    category: 'General',
    education: 'Undergraduate',
    govt_school: true,
    landholding: false,
    disability: false,
    ration_card: 'PHH (Priority Household)'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-8 animate-fade-in text-left">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('wizardTitle')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('wizardTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t('wizardSubtitle')}
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-200 flex items-center gap-2">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* State / District */}
          <div>
            <label className="block text-slate-700 font-extrabold mb-1.5">
              {t('stepState')}
            </label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
            >
              {OTHER_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {formData.state === 'Tamil Nadu' && (
            <div>
              <label className="block text-slate-700 font-extrabold mb-1.5">
                {language === 'ta' ? 'மாவட்டம்' : 'District'}
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
              >
                {TN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Age */}
          <div>
            <label className="block text-slate-700 font-extrabold mb-1.5">
              {t('stepAge')} (Years)
            </label>
            <input
              type="number"
              required
              min={1}
              max={110}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-slate-700 font-extrabold mb-1.5">
              {t('stepGender')}
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
            >
              <option value="female">{language === 'ta' ? 'பெண் (Female)' : 'Female'}</option>
              <option value="male">{language === 'ta' ? 'ஆண் (Male)' : 'Male'}</option>
              <option value="transgender">{language === 'ta' ? 'திருநங்கை / திருநம்பி (Transgender)' : 'Transgender / Other'}</option>
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-slate-700 font-extrabold mb-1.5">
              {t('stepOccupation')}
            </label>
            <select
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
            >
              <option value="Student">{language === 'ta' ? 'மாணவர் / மாணவி (Student)' : 'Student / Youth'}</option>
              <option value="Farmer">{language === 'ta' ? 'விவசாயி / உழவர் (Farmer)' : 'Farmer / Agriculturist'}</option>
              <option value="Business Owner">{language === 'ta' ? 'தொழில் முனைவோர் / வியாபாரி (Business)' : 'Business Owner / MSME'}</option>
              <option value="Artisan">{language === 'ta' ? 'கைவினைஞர் (Artisan/Craftsman)' : 'Artisan / Traditional Craftsman'}</option>
              <option value="Street Vendor">{language === 'ta' ? 'தெருவோர வியாபாரி (Street Vendor)' : 'Street Vendor / Hawker'}</option>
              <option value="Homemaker">{language === 'ta' ? 'குடும்பத் தலைவி (Homemaker)' : 'Homemaker / Housewife'}</option>
              <option value="Unemployed">{language === 'ta' ? 'வேலையற்றோர் (Unemployed/Graduate)' : 'Unemployed / Graduate'}</option>
              <option value="Daily Wage">{language === 'ta' ? 'தினக்கூலி தொழிலாளி (Daily Wage)' : 'Daily Wage / Unorganized Worker'}</option>
              <option value="Senior Citizen">{language === 'ta' ? 'மூத்த குடிமக்கள் (Senior Citizen)' : 'Senior Citizen (60+)'}</option>
            </select>
          </div>

          {/* Annual Family Income */}
          <div>
            <label className="block text-slate-700 font-extrabold mb-1.5">
              {t('stepIncome')}
            </label>
            <input
              type="number"
              required
              min={0}
              step={10000}
              value={formData.income}
              onChange={(e) => setFormData({ ...formData, income: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Social Category (Caste) */}
          <div>
            <label className="block text-slate-700 font-extrabold mb-1.5">
              {t('stepCategory')}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
            >
              <option value="General">General / OC</option>
              <option value="OBC">OBC / BC (Backward Class)</option>
              <option value="MBC">MBC (Most Backward Class)</option>
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="SCC">SCC (Converted Christian)</option>
              <option value="EWS">EWS (Economically Weaker Section)</option>
            </select>
          </div>

          {/* Education */}
          <div>
            <label className="block text-slate-700 font-extrabold mb-1.5">
              {t('stepEducation')}
            </label>
            <select
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
            >
              <option value="School Student">School (Class 6-12)</option>
              <option value="10th Pass">10th Pass</option>
              <option value="12th Pass">12th Pass</option>
              <option value="Diploma">Diploma / ITI</option>
              <option value="Undergraduate">Undergraduate (Degree / Engineering)</option>
              <option value="Postgraduate">Postgraduate</option>
              <option value="No Formal Education">No Formal Education</option>
            </select>
          </div>
        </div>

        {/* Special Flags Checkboxes */}
        <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <p className="font-extrabold text-slate-700 text-xs uppercase tracking-wider mb-2">
            {language === 'ta' ? 'கூடுதல் தகுதி விவரங்கள்' : 'Additional Eligibility Markers'}
          </p>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.govt_school}
              onChange={(e) => setFormData({ ...formData, govt_school: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-slate-800 font-medium">
              {t('stepGovtSchool')}
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.landholding}
              onChange={(e) => setFormData({ ...formData, landholding: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-slate-800 font-medium">
              {t('stepLandholding')}
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.disability}
              onChange={(e) => setFormData({ ...formData, disability: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-slate-800 font-medium">
              {t('stepDisability')}
            </span>
          </label>
        </div>

        {/* Optional Notification & Contact Details */}
        <div className="p-4 sm:p-5 bg-indigo-50/60 rounded-2xl border border-indigo-200/80 space-y-3">
          <p className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'ta' ? 'வாட்ஸ்அப் / எஸ்எம்எஸ் நினைவூட்டல் (விருப்பத்தேர்வு)' : 'WhatsApp / SMS Notification Details (Optional)'}</span>
          </p>
          <p className="text-xs text-indigo-950/70 font-medium">
            {t('contactPhoneNote')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-slate-700 font-extrabold mb-1 text-xs">
                {t('contactPhone')}
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-extrabold mb-1 text-xs">
                {t('contactEmail')}
              </label>
              <input
                type="email"
                placeholder="citizen@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RotateCw className="w-5 h-5 animate-spin" />
              <span>{t('analyzingBtn')}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{t('analyzeBtn')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
