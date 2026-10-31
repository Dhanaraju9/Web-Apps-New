import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  HelpCircle, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown,
  Copy, 
  Check,
  Clock,
  Sparkles,
  Search,
  Send,
  MessageSquare,
  CheckCircle2,
  PhoneCall,
  BookOpen,
  CreditCard,
  UserCheck,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SupportConfig {
  whatsappCountryCode: string;
  whatsappPhoneNumber: string;
  supportEmail: string;
  telegramUsername: string;
  supportTitle: string;
  supportDescription: string;
  supportAnnouncement: string;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  updatedAt?: number;
}

export const DEFAULT_SUPPORT_CONFIG: SupportConfig = {
  whatsappCountryCode: '91',
  whatsappPhoneNumber: '9493512768',
  supportEmail: 'Sobhadhanaraju1@gmail.com',
  telegramUsername: 'DHANARAJU0',
  supportTitle: 'Concierge Support & Help Center',
  supportDescription: 'We are dedicated to your exam success. Connect directly with our support team for assistance with your account, subscriptions, payments, or study content.',
  supportAnnouncement: 'Priority Aspirant Support • Prompt & Personal Assistance',
  whatsappEnabled: true,
  emailEnabled: true,
  telegramEnabled: true,
};

export const SUPPORT_CATEGORIES = [
  'Login & OTP Verification',
  'Subscription & Premium Access',
  'Payment & Billing Queries',
  'MCQ Content & Explanations',
  'Mock Tests & Analytics',
  'Account & Profile Settings',
  'Technical Assistance',
  'General Inquiry'
];

export const HELP_CENTER_FAQS = [
  {
    category: 'Account & Login',
    question: 'What should I do if I do not receive the mobile SMS OTP?',
    answer: 'Please ensure your 10-digit Indian mobile number is entered accurately and has active network coverage. If telecom DND filters delay the SMS, you can sign in instantly using Email & Password or Google Sign-In, or message us on WhatsApp for immediate account assistance.'
  },
  {
    category: 'Subscriptions & Payments',
    question: 'My payment was deducted, when will my Premium Plan activate?',
    answer: 'Premium plans activate automatically within seconds of Razorpay verification. If your bank or UPI app shows a debit but the plan is not yet reflected, please refresh the app once or share your Transaction / UTR ID with us on WhatsApp or Email for priority activation.'
  },
  {
    category: 'MCQ Practice & Syllabus',
    question: 'How do I attempt mock tests and practice questions?',
    answer: 'Navigate to the Home screen and choose your target subject or paper. You can start topic-wise practice to solve questions with immediate explanations, or enter the Mock Test Center for full-length timed tests.'
  },
  {
    category: 'Mock Tests & Analytics',
    question: 'How does the Mock Test scoring and negative marking work?',
    answer: 'Full-length and custom mock tests follow official competitive exam marking rules (+1 mark for correct answers, -1/3rd negative deduction for incorrect responses, zero penalty for unattempted questions). Topic-wise practice sets allow penalty-free learning with instant explanations.'
  },
  {
    category: 'MCQ Content & Explanations',
    question: 'How do I report an error in a question or explanation?',
    answer: 'Select "MCQ Content & Explanations" in the Write to Us section, mention the subject, topic, and question details, and click "Send Email" or "Chat on WhatsApp". Our academic review panel verifies and updates flagged questions promptly.'
  },
  {
    category: 'Current Affairs',
    question: 'Is current affairs updated regularly?',
    answer: 'Yes. The Current Affairs Center is updated with national events, state-specific updates, government schemes, economic indicators, and monthly revision capsules.'
  },
  {
    category: 'Bookmarks & Revision',
    question: 'How do I save questions for revision and bookmarks?',
    answer: 'Click the bookmark icon on any question card during practice or mock review. Access all saved questions in the Bookmarks section to filter by subject and re-test yourself.'
  },
  {
    category: 'Technical Assistance',
    question: 'Do I need an active internet connection to practice?',
    answer: 'Yes. An active internet connection ensures you always have real-time access to the latest question banks, official syllabus updates, live mock tests, and synced analytics across all your devices.'
  },
  {
    category: 'Account & Login',
    question: 'Why are my registered email and mobile number read-only in Profile?',
    answer: 'To protect your subscription security and prevent unauthorized account takeovers, verified login identifiers are locked against accidental edits. Contact our support team if you need an official credential update.'
  },
  {
    category: 'Display & Typography',
    question: 'Can I customize font sizes and themes for long reading sessions?',
    answer: 'Yes. Open Display & Typography from the navigation menu to adjust font families, reading text sizes, line spacing, and comfortable light themes tailored for extended exam preparation.'
  },
  {
    category: 'Contact & Support',
    question: 'How can I contact technical or billing support?',
    answer: 'You can reach our official support desk via WhatsApp, Email, or Telegram for fast assistance.'
  }
];

export function getStoredSupportConfig(): SupportConfig {
  try {
    const saved = localStorage.getItem('app_support_config_v2');
    if (saved) {
      return { ...DEFAULT_SUPPORT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return DEFAULT_SUPPORT_CONFIG;
}

export function saveSupportConfig(config: SupportConfig) {
  try {
    const updated = { ...config, updatedAt: Date.now() };
    localStorage.setItem('app_support_config_v2', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('support_config_updated', { detail: updated }));
  } catch (e) {}
}

/* Official WhatsApp Brand Icon */
export function WhatsAppBrandIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.031 2C6.508 2 2.023 6.485 2.023 12.008c0 1.766.461 3.49 1.337 5.012L2 22l5.122-1.343a9.967 9.967 0 0 0 4.909 1.293h.004c5.522 0 10.007-4.485 10.007-10.008C22.042 6.485 17.554 2 12.031 2zm5.828 14.132c-.246.693-1.432 1.326-1.996 1.411-.513.077-1.163.11-1.878-.117-.434-.138-.99-.322-1.703-.63-2.996-1.293-4.952-4.312-5.102-4.512-.15-.2-1.218-1.621-1.218-3.092 0-1.471.771-2.194 1.045-2.493.274-.3.598-.375.797-.375.199 0 .399.002.573.01.184.009.43-.07.673.514.249.599.847 2.069.921 2.219.075.15.125.324.025.524-.1.2-.15.324-.299.499-.15.175-.315.39-.449.524-.15.15-.305.312-.131.611.174.3.774 1.277 1.662 2.068 1.142 1.018 2.104 1.333 2.403 1.483.299.15.473.125.648-.075.174-.2.747-.873.946-1.172.2-.3.399-.25.673-.15.274.1 1.744.823 2.043.972.299.15.498.225.573.35.075.125.075.723-.171 1.416z" />
    </svg>
  );
}

/* Official Telegram Brand Icon */
export function TelegramBrandIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

interface SupportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  initialTab?: 'contact' | 'faq' | 'inquiry';
}

export default function SupportCenterModal({
  isOpen,
  onClose,
  appName = 'Exam Preparation Portal',
  initialTab = 'contact'
}: SupportCenterModalProps) {
  const [config, setConfig] = useState<SupportConfig>(getStoredSupportConfig);
  const [activeTab, setActiveTab] = useState<'contact' | 'faq' | 'inquiry'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>(SUPPORT_CATEGORIES[0]);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [inquirySubmitted, setInquirySubmitted] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      }
    };
    window.addEventListener('support_config_updated', handleUpdate);
    return () => {
      window.removeEventListener('support_config_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredSupportConfig());
      setActiveTab(initialTab);
      setInquirySubmitted(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const cleanCountry = (config.whatsappCountryCode || '91').replace(/\D/g, '') || '91';
  const cleanPhone = (config.whatsappPhoneNumber || '9493512768').replace(/\D/g, '');
  const waNumber = `${cleanCountry}${cleanPhone}`;
  const formattedPhoneDisplay = `+${cleanCountry} ${cleanPhone}`;

  const waText = encodeURIComponent(
    `Hello Support Team,\n\nApp: ${appName}\nTopic: ${selectedCategory}\n\n${customMessage.trim() ? customMessage.trim() : 'I need assistance regarding the app.'}`
  );
  const waLink = `https://wa.me/${waNumber}?text=${waText}`;

  const emailSubject = encodeURIComponent(`Support Request: ${selectedCategory} — ${appName}`);
  const emailBody = encodeURIComponent(
    `Hello Support Team,\n\nApp Name: ${appName}\nCategory: ${selectedCategory}\n\nInquiry Details:\n${customMessage.trim() ? customMessage.trim() : 'Please share details of your question or issue here...'}\n\n---\nSent via ${appName} Support Center`
  );
  const emailLink = `mailto:${config.supportEmail}?subject=${emailSubject}&body=${emailBody}`;

  const cleanTelegram = (config.telegramUsername || 'DHANARAJU0').replace(/^@/, '').trim();
  const telegramLink = `https://t.me/${cleanTelegram}`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2200);
  };

  const filteredFaqs = HELP_CENTER_FAQS.filter(
    item =>
      !faqSearch.trim() ||
      item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-[#2A2118]/40 backdrop-blur-md overflow-y-auto font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-4xl bg-[#FFFDF9] border border-[#E6D4B5] rounded-2xl sm:rounded-[2rem] shadow-[0_25px_70px_-15px_rgba(140,105,45,0.22)] overflow-hidden my-4 sm:my-6 flex flex-col max-h-[94vh] sm:max-h-[90vh]"
      >
        {/* ================================================================= */}
        {/* HEADER                                                            */}
        {/* ================================================================= */}
        <div className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E4] to-[#F3E5CA] px-4 sm:px-8 pt-4 sm:pt-7 pb-4 border-b border-[#E6D4B5] shrink-0">
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase text-[#8A641B]">
                <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>{appName}</span>
                <span>·</span>
                <span>Help & Support</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#2C2013] font-serif leading-tight">
                Help & Support
              </h2>

              <p className="text-xs text-[#63513D] font-medium max-w-2xl leading-relaxed hidden xs:block">
                {config.supportDescription}
              </p>
            </div>

            <button 
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#FFFDF9]/90 hover:bg-[#F5E9D3] text-[#63513D] hover:text-[#2C2013] transition-all cursor-pointer border border-[#DFC9A3] shadow-2xs shrink-0"
              aria-label="Close Support"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Navigation Bar */}
          <div className="relative z-10 mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#E6D4B5]/70">
            {config.supportAnnouncement && (
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#7A5612]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                <span>{config.supportAnnouncement}</span>
              </div>
            )}

            {/* Segmented View Switcher */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F4E9D5] border border-[#E2CCA4] w-full sm:w-auto justify-stretch sm:justify-start">
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'contact'
                    ? 'bg-[#FFFDF9] text-[#2C2013] shadow-2xs border border-[#DFC89E]'
                    : 'text-[#6E583F] hover:text-[#2C2013]'
                }`}
              >
                Contact Support
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('faq')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'faq'
                    ? 'bg-[#FFFDF9] text-[#2C2013] shadow-2xs border border-[#DFC89E]'
                    : 'text-[#6E583F] hover:text-[#2C2013]'
                }`}
              >
                Help & FAQs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inquiry')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  activeTab === 'inquiry'
                    ? 'bg-[#FFFDF9] text-[#2C2013] shadow-2xs border border-[#DFC89E]'
                    : 'text-[#6E583F] hover:text-[#2C2013]'
                }`}
              >
                Write to Us
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BODY                                                              */}
        {/* ================================================================= */}
        <div className="p-4 sm:p-7 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F7F0E4] flex-1">
          
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#7A5A1E]">
                    Direct Official Channels
                  </h3>
                  <span className="text-[11px] text-[#7D6B57] font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
                    <span>Response within 15–60 mins</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
                  {/* Card 1: WhatsApp */}
                  {config.whatsappEnabled && (
                    <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E6D5B8] hover:border-[#C59B27] shadow-2xs flex flex-col justify-between space-y-4 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-[#F3FAF6] border border-[#C6E7D4] text-[#15803D] flex items-center justify-center">
                            <WhatsAppBrandIcon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-extrabold text-[#15803D] uppercase tracking-wider">
                            Instant Chat
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-[#2C2013]">WhatsApp Support</h4>
                          <p className="text-[11px] text-[#6E5A48] font-medium mt-0.5">
                            Fast help for OTP, login & payments
                          </p>
                        </div>

                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#3A2B1C] font-mono">
                          <span className="truncate">{formattedPhoneDisplay}</span>
                          <button 
                            type="button"
                            onClick={() => handleCopy(formattedPhoneDisplay, 'whatsapp')}
                            className="text-[#8C6D32] hover:text-[#15803D] cursor-pointer ml-1.5 shrink-0"
                            title="Copy number"
                          >
                            {copiedField === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <a 
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#1E8E52] to-[#157A43] text-white text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <WhatsAppBrandIcon className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  )}

                  {/* Card 2: Email */}
                  {config.emailEnabled && (
                    <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E6D5B8] hover:border-[#C59B27] shadow-2xs flex flex-col justify-between space-y-4 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-[#FDF6E7] border border-[#E5CA8F] text-[#9A6B13] flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-extrabold text-[#9A6B13] uppercase tracking-wider">
                            Official Email
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-[#2C2013]">Email Support</h4>
                          <p className="text-[11px] text-[#6E5A48] font-medium mt-0.5">
                            Account, syllabus & billing queries
                          </p>
                        </div>

                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#3A2B1C] font-mono">
                          <span className="truncate" title={config.supportEmail}>{config.supportEmail}</span>
                          <button 
                            type="button"
                            onClick={() => handleCopy(config.supportEmail, 'email')}
                            className="text-[#8C6D32] hover:text-[#9A6B13] cursor-pointer ml-1.5 shrink-0"
                            title="Copy email"
                          >
                            {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <a 
                        href={emailLink}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#C99722] to-[#A37408] text-white text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send Email</span>
                      </a>
                    </div>
                  )}

                  {/* Card 3: Telegram */}
                  {config.telegramEnabled && (
                    <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E6D5B8] hover:border-[#C59B27] shadow-2xs flex flex-col justify-between space-y-4 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-[#F2F8FD] border border-[#C5E0F5] text-[#0369A1] flex items-center justify-center">
                            <TelegramBrandIcon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-extrabold text-[#0369A1] uppercase tracking-wider">
                            Direct Channel
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-[#2C2013]">Telegram Support</h4>
                          <p className="text-[11px] text-[#6E5A48] font-medium mt-0.5">
                            Study updates & quick help
                          </p>
                        </div>

                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#3A2B1C] font-mono">
                          <span className="truncate">@{cleanTelegram}</span>
                          <button 
                            type="button"
                            onClick={() => handleCopy(`@${cleanTelegram}`, 'telegram')}
                            className="text-[#8C6D32] hover:text-[#0369A1] cursor-pointer ml-1.5 shrink-0"
                            title="Copy username"
                          >
                            {copiedField === 'telegram' ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <a 
                        href={telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <TelegramBrandIcon className="w-4 h-4" />
                        <span>Open Telegram</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Inquiry Topic Selection */}
              <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E6D5B8] shadow-2xs space-y-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#2C2013] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#B8860B]" />
                    <span>Pre-fill Your Support Message</span>
                  </h4>
                  <p className="text-[11px] text-[#6E5A48] font-medium mt-0.5">
                    Select a topic below to auto-fill your message before opening WhatsApp or Email
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  {SUPPORT_CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold text-left transition-all border cursor-pointer truncate ${
                          isSelected
                            ? 'bg-[#FDF4E1] text-[#6B480A] border-[#C99A2E] ring-1 ring-[#DFC075]'
                            : 'bg-[#FAF6EE]/70 text-[#5C4A38] border-[#E6D5B8] hover:bg-[#FAF3E4]'
                        }`}
                        title={cat}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Mention your mobile number, email, question topic, or issue details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6EE]/80 border border-[#DFC9A3] text-xs font-semibold text-[#2C2013] placeholder:text-[#96836E] focus:outline-none focus:bg-white focus:border-[#B8860B] resize-none"
                />
              </div>

              {/* Trust Guarantee */}
              <div className="bg-[#FDF8EC] border border-[#E5CE9C] rounded-2xl p-3.5 sm:p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
                <div className="text-xs text-[#594324] space-y-0.5">
                  <span className="font-black text-[#2C2013] block">Official Aspirant Privacy Protection</span>
                  <p className="font-medium leading-relaxed text-[11px]">
                    Share your registered mobile or email address for quick verification. Support will never ask for your password, PIN, or confidential OTP.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C6D32] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search questions (e.g. OTP, payment, mock test, negative marking, font)..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#E2CDA6] text-xs font-semibold text-[#2C2013] placeholder:text-[#948069] focus:outline-none focus:border-[#B8860B] shadow-2xs"
                />
              </div>

              <div className="space-y-2.5">
                {filteredFaqs.map((faq, idx) => {
                  const isOpenFaq = openFaqIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-[#FFFFFF] rounded-xl sm:rounded-2xl border border-[#E6D5B8] overflow-hidden transition-all shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpenFaq ? null : idx)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-[#FAF6EE]/60 transition-colors cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#9A6B13] block">
                            {faq.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-[#2C2013]">
                            {faq.question}
                          </h4>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-[#8C6D32] shrink-0 transition-transform duration-200 ${
                            isOpenFaq ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpenFaq && (
                        <div className="px-4 pb-3.5 pt-1 text-xs text-[#594736] font-medium leading-relaxed border-t border-[#F2E8D5] bg-[#FFFDF9]">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#FDF8EC] border border-[#E5CE9C] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#2C2013]">Need further help?</h4>
                  <p className="text-[11px] text-[#6E5A48] font-medium">
                    Reach out directly via WhatsApp, Email, or Telegram.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#9E7006] text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-xs shrink-0"
                >
                  View Contact Channels
                </button>
              </div>
            </div>
          )}

          {activeTab === 'inquiry' && (
            <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-6 border border-[#E6D5B8] shadow-2xs space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-[#EFE3CE] pb-3">
                <h3 className="text-sm sm:text-base font-black text-[#2C2013]">
                  Submit a Support Request
                </h3>
                <p className="text-[11px] sm:text-xs text-[#6E5A48] font-medium mt-0.5">
                  Select a category and describe your issue or question details below.
                </p>
              </div>

              {inquirySubmitted ? (
                <div className="p-5 rounded-xl bg-[#F4FBF7] border border-[#C3E6D1] text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E3F6EB] text-[#15803D] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-[#1E3A2B]">
                      Support Request Ready!
                    </h4>
                    <p className="text-xs text-[#3B5E4B] font-medium max-w-md mx-auto">
                      Choose your preferred channel below to send your request directly to our team:
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    {config.whatsappEnabled && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-[#168045] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <WhatsAppBrandIcon className="w-4 h-4" />
                        <span>Send via WhatsApp</span>
                      </a>
                    )}
                    {config.emailEnabled && (
                      <a
                        href={emailLink}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#9A6B13] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send via Email</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setInquirySubmitted(false)}
                      className="px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-[#4A3A28] text-xs font-bold cursor-pointer"
                    >
                      Edit Request
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#4A3A28] block mb-1.5">
                      Select Request Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                      {SUPPORT_CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-2 rounded-xl text-[11px] font-bold text-left border cursor-pointer truncate ${
                            selectedCategory === cat
                              ? 'bg-[#FDF4E1] text-[#6B480A] border-[#C99A2E]'
                              : 'bg-[#FAF6EE] text-[#5C4A38] border-[#E6D5B8] hover:bg-[#F5EBD6]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#4A3A28] block mb-1.5">
                      Details / Issue Description
                    </label>
                    <textarea
                      rows={3}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Describe your question, payment reference, or technical issue..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6EE]/80 border border-[#DFC9A3] text-xs font-semibold text-[#2C2013] placeholder:text-[#96836E] focus:outline-none focus:bg-white focus:border-[#B8860B] resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    {config.whatsappEnabled && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-[#168045] hover:bg-[#126B39] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                      >
                        <WhatsAppBrandIcon className="w-4 h-4" />
                        <span>Send via WhatsApp</span>
                      </a>
                    )}
                    {config.emailEnabled && (
                      <a
                        href={emailLink}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#C99722] to-[#A37408] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send via Email</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ================================================================= */}
        {/* FOOTER                                                            */}
        {/* ================================================================= */}
        <div className="px-4 sm:px-8 py-3 bg-[#FAF4E8] border-t border-[#E6D4B5] flex items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-[#6E5A48] font-semibold truncate">
            {config.supportEmail}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#EFE3CE] hover:bg-[#E5D3B5] text-[#2C2013] border border-[#D8C098] text-xs font-extrabold tracking-wider uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

