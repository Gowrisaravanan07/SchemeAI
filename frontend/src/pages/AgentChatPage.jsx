import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, ShieldCheck, CheckCircle2, AlertTriangle, 
  FileText, ExternalLink, ArrowRight, Loader2, Sparkles, 
  RotateCcw, Check, Building2, X, Phone, Mail, MessageSquare,
  Mic, MicOff, Volume2, Radio
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { chatWithMultiAgent, confirmApplication } from '../services/api';

export default function AgentChatPage({ userProfile, activeScheme, onClearActiveScheme, onOpenSchemeModal, onNavigate }) {
  const { language, t } = useLanguage();

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: t('chatTitle') + '\n\n' + (language === 'ta' 
        ? 'வணக்கம்! நான் உங்கள் அரசு நலத்திட்ட வழிகாட்டி AI. உங்கள் தொழில், கல்வி, குடும்ப வருமானம் அல்லது ஏதேனும் திட்டத்தை பற்றி என்னிடம் தமிழில் அல்லது ஆங்கிலத்தில் கேட்கலாம்.'
        : 'Welcome! I am your Multi-Agent Government Scheme Eligibility & Application Assistant. Ask me anything about welfare schemes, required documents, or eligibility criteria in English or தமிழ்.'),
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Maintain local profile state to accumulate extracted entities during chat
  const [localChatProfile, setLocalChatProfile] = useState(() => userProfile || {});

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTrace, setActiveTrace] = useState(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [isSubmittingWorkflow, setIsSubmittingWorkflow] = useState(false);

  // Citizen Contact Details for SMS/WhatsApp/Email notifications
  const [contactName, setContactName] = useState(() => userProfile?.name || 'Citizen Applicant');
  const [contactPhone, setContactPhone] = useState(() => userProfile?.phone || '');
  const [contactEmail, setContactEmail] = useState(() => userProfile?.email || '');
  const [enableAlerts, setEnableAlerts] = useState(true);

  // Voice Assistant Microphone State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setInputMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission blocked. Please allow mic in browser.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(language === 'ta' ? 'உங்கள் உலாவியில் குரல் அறிதல் ஆதரிக்கப்படவில்லை (Chrome/Edge பயன்படுத்தவும்).' : 'Voice speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, pendingConfirmation]);

  // If an active scheme was passed from a modal, send an initial prompt or update context
  useEffect(() => {
    if (activeScheme) {
      const schemeTitle = language === 'ta' ? (activeScheme.name_ta || activeScheme.name) : (activeScheme.name_en || activeScheme.name);
      setInputMessage(language === 'ta' ? `இந்த ${schemeTitle} திட்டத்தின் தகுதி மற்றும் விண்ணப்பிக்கும் முறையை விளக்குக.` : `Explain the eligibility and application procedure for ${schemeTitle}.`);
    }
  }, [activeScheme, language]);

  const handleSendMessage = async (queryText = null) => {
    const textToSend = queryText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputMessage('');
    setIsLoading(true);
    setActiveTrace(null);
    setPendingConfirmation(null);

    try {
      const response = await chatWithMultiAgent({
        message: textToSend,
        user_id: 'demo-user-123',
        user_profile: localChatProfile
      });

      if (response && response.success) {
        // Update local profile with newly extracted entities
        if (response.user_profile) {
          setLocalChatProfile(response.user_profile);
        }
        if (response.agent_trace && response.agent_trace.length > 0) {
          setActiveTrace(response.agent_trace);
        }

        const botMsg = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response,
          structured: response.structured_explanation,
          citations: response.citations || [],
          retrieved_schemes: response.retrieved_schemes || [],
          eligibility_evaluations: response.eligibility_evaluations || [],
          document_checklists: response.document_checklists || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, botMsg]);

        // If eligible schemes exist, setup human confirmation card
        const eligible = (response.retrieved_schemes || []).filter((s) => {
          const ev = (response.eligibility_evaluations || []).find((e) => e.scheme_id === s.id);
          return ev && (ev.status === 'Eligible' || ev.status === 'Potentially eligible');
        });

        if (eligible.length > 0) {
          const primaryScheme = eligible[0];
          const checklist = (response.document_checklists || []).find((c) => c.scheme_id === primaryScheme.id);
          setPendingConfirmation({
            scheme: primaryScheme,
            checklist: checklist,
            profile: response.user_profile || {}
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: language === 'ta' 
            ? `மன்னிக்கவும், தகவல் பெறுவதில் சிக்கல் ஏற்பட்டது (${error.message}). தயவுசெய்து மீண்டும் முயற்சிக்கவும்.`
            : `⚠️ Could not complete scheme analysis: ${error.message}. Please try asking again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleConfirmApplication = async () => {
    if (!pendingConfirmation) return;
    setIsSubmittingWorkflow(true);

    try {
      const result = await confirmApplication({
        user_id: 'demo-user-123',
        scheme_id: pendingConfirmation.scheme.id,
        user_profile: {
          ...pendingConfirmation.profile,
          name: contactName || pendingConfirmation.profile?.name || 'Citizen Applicant',
          phone: contactPhone || pendingConfirmation.profile?.phone,
          email: contactEmail || pendingConfirmation.profile?.email,
        },
        user_phone: contactPhone,
        user_email: contactEmail,
        document_checklist: pendingConfirmation.checklist
      });

      const confirmedScheme = pendingConfirmation.scheme;
      setPendingConfirmation(null);

      const cleanPhone = (contactPhone || '').replace(/[^0-9]/g, '');
      const schemeTitle = language === 'ta' ? (confirmedScheme.name_ta || confirmedScheme.name) : (confirmedScheme.name_en || confirmedScheme.name);
      const docs = confirmedScheme.documents_en || confirmedScheme.required_documents || [];
      const docListFormatted = docs.length > 0 ? docs.map((d, i) => `${i+1}. ${d}`).join('\n') : '1. Aadhaar Card\n2. Income Certificate\n3. Bank Passbook';
      const portalLink = confirmedScheme.official_source || confirmedScheme.official_portal_url || 'https://www.myscheme.gov.in';

      const whatsappRawText = 
`🏛️ *SchemeWise AI — Government Scheme Checklist*

📋 *Scheme:* ${schemeTitle}
💰 *Benefit:* ${confirmedScheme.benefits || 'Financial Aid'}
🆔 *Application Ref:* ${result.application?.id || 'APP-2026-N8N'}

📄 *Documents to Keep Ready:*
${docListFormatted}

🔗 *Apply on Official Govt Portal:*
${portalLink}

📌 _Instant checklist from SchemeWise AI_`;

      const whatsappUrl = cleanPhone 
        ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(whatsappRawText)}`
        : `https://wa.me/?text=${encodeURIComponent(whatsappRawText)}`;

      const contactSentText = contactPhone 
        ? (language === 'ta' ? `📲 உங்கள் கைபேசி எண் (${contactPhone})-க்கு வாட்ஸ்அப் / எஸ்எம்எஸ் ஆவண பட்டியல் தயாராக உள்ளது.` : `📲 Document checklist prepared for WhatsApp / SMS at ${contactPhone}.`)
        : (language === 'ta' ? `ℹ️ போர்ட்டல் இணைப்பு கீழே கொடுக்கப்பட்டுள்ளது.` : `ℹ️ Official application portal link ready.`);

      const emailSentText = contactEmail
        ? (language === 'ta' ? `✉️ மின்னஞ்சல் உறுதிப்படுத்தல் ${contactEmail}-க்கு அனுப்பப்பட்டது.` : `✉️ Email confirmation dispatched to ${contactEmail}.`)
        : '';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ **${language === 'ta' ? 'விண்ணப்பம் உறுதிசெய்யப்பட்டது & ஆவணப் பட்டியல் தயாராக உள்ளது!' : 'Application Confirmed & Document Checklist Ready!'}**\n\n- **Application Reference:** \`${result.application?.id || 'APP-2026-N8N'}\`\n- **Scheme:** ${result.application?.scheme_name || confirmedScheme.name}\n- **Benefit:** ${result.application?.benefit_amount || confirmedScheme.benefits || 'Government Financial Aid'}\n\n${contactSentText}\n${emailSentText}\n\n🔗 **[${language === 'ta' ? 'அதிகாரப்பூர்வ அரசு இணையதளத்தில் விண்ணப்பிக்கவும்' : 'Apply on Official Government Portal'}](${portalLink})**`,
          whatsapp_url: whatsappUrl,
          show_prep_button: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      alert(`Failed to submit: ${error.message}`);
    } finally {
      setIsSubmittingWorkflow(false);
    }
  };

  const suggestions = [
    t('chatSuggested1'),
    t('chatSuggested2'),
    t('chatSuggested3'),
    t('chatSuggested4')
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[82vh] bg-white dark:bg-myscheme-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden animate-fade-in text-left">
      {/* Top Assistant Header */}
      <div className="bg-white dark:bg-gray-800 px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-gray-700 flex items-center justify-center text-myscheme-green shadow-sm border border-green-100 dark:border-gray-600">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">{t('chatTitle')}</h2>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-myscheme-green border border-green-200 dark:bg-gray-700 dark:border-gray-600">
                Grounded AI
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-1">{t('chatSubtitle')}</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition"
          title="Clear chat"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Active Profile & Scheme Context Bar */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-5 py-2.5 flex items-center justify-between gap-2 text-xs flex-wrap shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {(localChatProfile.occupation || localChatProfile.state || localChatProfile.income) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-700">
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span>
                {[
                  localChatProfile.occupation,
                  localChatProfile.state,
                  localChatProfile.income ? `₹${localChatProfile.income}` : null
                ].filter(Boolean).join(', ') || 'Citizen'}
              </span>
            </span>
          )}

          {activeScheme && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'ta' ? (activeScheme.name_ta || activeScheme.name) : (activeScheme.name_en || activeScheme.name)}</span>
              {onClearActiveScheme && (
                <button onClick={onClearActiveScheme} className="hover:text-red-600 ml-1">
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          )}
        </div>

        <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">
          {language === 'ta' ? 'தமிழ் | English | Tanglish ஆதரிக்கப்படும்' : 'Tamil | English | Tanglish Supported'}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser ? 'bg-myscheme-green text-white shadow-sm' : 'bg-white text-myscheme-green border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${isUser ? 'text-right' : 'text-left'}`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser 
                    ? 'bg-myscheme-green text-white rounded-tr-none font-medium shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-sm'
                }`}>
                  {msg.content}

                  {msg.whatsapp_url && (
                    <div className="pt-4 flex flex-col gap-3">
                      {msg.show_prep_button && onNavigate && (
                        <button
                          onClick={() => onNavigate('app_prep')}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{language === 'ta' ? 'ஆவணங்களை சரிபார்க்கவும் (Verify Documents)' : 'Prepare & Verify Documents'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      <a
                        href={msg.whatsapp_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-myscheme-green hover:bg-myscheme-primaryHover text-white font-bold text-sm shadow-sm transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{language === 'ta' ? 'வாட்ஸ்அப்பில் திறக்க (Open WhatsApp)' : '📲 Open Checklist in WhatsApp'}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Citations */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2 text-xs items-center">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Sources:</span>
                    {msg.citations.map((c, i) => (
                      <a
                        key={i}
                        href={c.official_source}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded bg-green-50 text-myscheme-green border border-green-100 hover:bg-green-100 inline-flex items-center gap-1 dark:bg-gray-800 dark:border-gray-700 dark:text-green-400 dark:hover:bg-gray-700"
                      >
                        <span className="font-medium">{c.scheme_name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-gray-400 font-medium px-1">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Human Confirmation Card */}
        {pendingConfirmation && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-myscheme-green shadow-md space-y-4 animate-scale-up">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-black text-sm sm:text-base">
                <ShieldCheck className="w-5 h-5 text-myscheme-green" />
                <span>{language === 'ta' ? 'மனித உறுதிப்படுத்தல் & ஆட்டோமேஷன்' : 'Human Confirmation & n8n Dispatch'}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-green-50 text-myscheme-green border border-green-200 dark:bg-gray-700 dark:border-gray-600">
                {pendingConfirmation.scheme.short_name || 'Scheme Match'}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {pendingConfirmation.scheme.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {language === 'ta'
                  ? 'விண்ணப்ப ஆவணப் பட்டியல் மற்றும் நேரடி போர்ட்டல் வழிகாட்டியை உங்கள் வாட்ஸ்அப் / கைபேசிக்கு அனுப்ப உங்கள் தகவல்களை சரிபார்க்கவும்.'
                  : 'Receive the required document checklist and direct portal link via WhatsApp / SMS.'}
              </p>
            </div>

            {/* Contact Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1 uppercase tracking-wider">
                  <Phone className="w-3 h-3" />
                  <span>{t('contactPhone')}</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-myscheme-green dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1 uppercase tracking-wider">
                  <Mail className="w-3 h-3" />
                  <span>{t('contactEmail')}</span>
                </label>
                <input
                  type="email"
                  placeholder="citizen@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-myscheme-green dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 pt-2">
              <input
                type="checkbox"
                id="alertConsent"
                checked={enableAlerts}
                onChange={(e) => setEnableAlerts(e.target.checked)}
                className="rounded text-myscheme-green focus:ring-myscheme-green w-4 h-4 cursor-pointer"
              />
              <label htmlFor="alertConsent" className="cursor-pointer font-medium text-[11px]">
                {t('receiveAlerts')}
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                onClick={handleConfirmApplication}
                disabled={isSubmittingWorkflow}
                className="flex-1 py-3 px-4 bg-myscheme-green hover:bg-myscheme-primaryHover text-white text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmittingWorkflow ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{language === 'ta' ? 'உறுதிசெய்து ஆட்டோமேஷனைத் தொடங்க' : 'Confirm & Dispatch to My Phone'}</span>
              </button>
              <button
                onClick={() => setPendingConfirmation(null)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg transition"
              >
                {language === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gray-200 shadow-sm w-fit text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
            <Loader2 className="w-4 h-4 text-myscheme-green animate-spin" />
            <span>{language === 'ta' ? 'அரசு விதிகளை ஆராய்கிறது...' : 'Analyzing verified government criteria...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-x-auto shrink-0 flex items-center gap-2">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap mr-1">
          <Sparkles className="w-3 h-3 text-myscheme-green inline mr-1" />
          {language === 'ta' ? 'பரிந்துரைகள்:' : 'Suggestions:'}
        </span>
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(sug)}
            className="px-4 py-1.5 rounded-full bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-myscheme-green border border-gray-200 hover:border-green-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 text-xs font-medium whitespace-nowrap transition"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Voice Listening Active Indicator Bar */}
      {isListening && (
        <div className="bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-900/50 px-4 py-2 flex items-center justify-between animate-fade-in text-xs">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span>{language === 'ta' ? 'குரல் கேட்கிறது... தமிழில் அல்லது ஆங்கிலத்தில் பேசவும்' : 'Listening... Speak in Tamil or English'}</span>
          </div>
          <button
            onClick={toggleListening}
            className="text-xs font-bold text-red-700 hover:underline"
          >
            {language === 'ta' ? 'நிறுத்து' : 'Stop'}
          </button>
        </div>
      )}

      {speechError && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-1.5 text-xs text-amber-800 font-medium flex items-center justify-between">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)} className="text-amber-600 font-bold">✕</button>
        </div>
      )}

      {/* Message Input Box with Microphone Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 sm:gap-3 shrink-0"
      >
        {/* Microphone Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-3.5 rounded-xl font-bold transition shrink-0 flex items-center justify-center ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-md shadow-red-500/30'
              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-gray-700'
          }`}
          title={isListening ? 'Stop Speaking' : 'Speak in AI Assistant (Microphone)'}
        >
          {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-emerald-600" />}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isListening ? (language === 'ta' ? 'கேட்கிறது...' : 'Listening...') : t('chatPlaceholder')}
          disabled={isLoading}
          className="flex-1 px-4 py-3.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 focus:border-myscheme-green focus:ring-1 focus:ring-myscheme-green focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-3.5 rounded-xl bg-myscheme-green hover:bg-myscheme-primaryHover text-white font-bold transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          title={t('chatSend')}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
