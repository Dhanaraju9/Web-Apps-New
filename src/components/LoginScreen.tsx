import React, { useState, useEffect, useRef } from 'react';
import { AppConfig } from '../types';
import { 
  ShieldCheck, Zap, Lock, ArrowRight, ArrowLeft, 
  Sparkles, CheckCircle2, AlertCircle, Phone, Mail, 
  RotateCw, Globe, Award, BookOpen, KeyRound,
  Check, Smartphone, ExternalLink, Shield,
  ChevronLeft, ChevronRight, MessageCircle
} from 'lucide-react';

import amaravatiImg from '../assets/images/indian_scene_amaravati_1793199163663.jpg';
import vizagImg from '../assets/images/indian_scene_vizag_1793199164358.jpg';
import tirumalaImg from '../assets/images/indian_scene_tirumala_1793199164313.jpg';
import charminarImg from '../assets/images/indian_scene_charminar_1793199164493.jpg';
import aspirantHubImg from '../assets/images/login_hero_card_1793198668631.jpg';

const INDIAN_LUXURY_SCENES = [
  {
    id: 'amaravati',
    image: amaravatiImg,
    fallbackUrl: '/src/assets/images/indian_scene_amaravati_1793199163663.jpg',
    badgeEn: 'AP Capital Landmark',
    badgeTe: 'అమరావతి రాజధాని & విధానసౌధ భవనం',
    titleEn: 'Amaravati Capital & Judicial Complex',
    titleTe: 'అమరావతి విధానసౌధ & న్యాయ సముదాయం',
    descEn: 'Pride of Civil Administration, High Court & State Governance',
    descTe: 'ఆంధ్రప్రదేశ్ పాలనా హృదయభూమి & నవ్యాంధ్ర ప్రగతి సౌధం',
  },
  {
    id: 'vizag',
    image: vizagImg,
    fallbackUrl: '/src/assets/images/indian_scene_vizag_1793199164358.jpg',
    badgeEn: 'Vizag Marine Promenade',
    badgeTe: 'వైజాగ్ మెరైన్ డ్రైవ్ & పోర్ట్ సిటీ',
    titleEn: 'Visakhapatnam Jewel of Coastline',
    titleTe: 'విశాఖపట్నం స్వయం సమృద్ధి తీరం',
    descEn: 'Economic & Maritime Hub of Andhra Pradesh',
    descTe: 'స్మార్ట్ పోర్ట్ సిటీ, ఐటీ కారిడార్ & ఆర్థిక చోదక శక్తి',
  },
  {
    id: 'tirumala',
    image: tirumalaImg,
    fallbackUrl: '/src/assets/images/indian_scene_tirumala_1793199164313.jpg',
    badgeEn: 'Sacred Heritage',
    badgeTe: 'దివ్య పుణ్యక్షేత్రం & శైల శిఖరాలు',
    titleEn: 'Tirumala Sacred Heritage Hills',
    titleTe: 'తిరుమల ఆధ్యాత్మిక శైల శిఖరాలు',
    descEn: 'Spiritual Culture, Divine Grandeur & Serene Hillscapes',
    descTe: 'సనాతన సంస్కృతి, సాంప్రదాయం & దివ్య సౌందర్య వైభవం',
  },
  {
    id: 'charminar',
    image: charminarImg,
    fallbackUrl: '/src/assets/images/indian_scene_charminar_1793199164493.jpg',
    badgeEn: 'Golden Heritage',
    badgeTe: 'స్వర్ణ వారసత్వ చారిత్రక చిహ్నం',
    titleEn: 'Charminar Historic Architecture',
    titleTe: 'చార్మినార్ చారిత్రక ఘనత',
    descEn: 'Centuries of Cultural & Architectural Glory',
    descTe: 'తెలుగు సాంస్కృతిక వైభవం & చారిత్రక ప్రతీక',
  },
  {
    id: 'aspirant_hub',
    image: aspirantHubImg,
    fallbackUrl: '/src/assets/images/login_hero_card_1793198668631.jpg',
    badgeEn: 'Civil Services Portal',
    badgeTe: 'ప్రభుత్వ ఉద్యోగ లక్ష్య సాధన',
    titleEn: 'Aspiration to Achievement',
    titleTe: 'కృషితో నాస్తి దుర్భిక్షం',
    descEn: 'Master Syllabus Units, High-Yield Drills & State Ranks',
    descTe: 'సిలబస్ యూనిట్లు, హై-ఈల్డ్ ప్రాక్టీస్ & స్టేట్ వైడ్ ర్యాంకింగ్స్',
  },
];
import { motion, AnimatePresence } from 'motion/react';
import {
  auth,
  registerWithEmailPassword,
  loginWithEmailPassword,
  resetUserPassword,
  syncUserProfileToFirestore,
} from '../lib/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import ApEmblem from './auth/ApEmblem';
import { sanitizeIndianPhoneNumber } from './auth/PhoneNumberInput';
import { listenForWebOtp, sendOtpApi, verifyOtpApi } from '../services/otpService';
import { syncUserProfileToSupabase } from '../services/supabaseService';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | null;
  }
}

interface LoginScreenProps {
  activeApp: AppConfig;
  onLoginSuccess: () => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
}

export default function LoginScreen({ activeApp, onLoginSuccess, onOpenLegal }: LoginScreenProps) {
  // Screens: 'login' | 'otp'
  const [currentScreen, setCurrentScreen] = useState<'login' | 'otp'>('login');
  // Login Tab: 'mobile' | 'gmail' | 'whatsapp'
  const [loginTab, setLoginTab] = useState<'mobile' | 'gmail' | 'whatsapp'>('mobile');
  // Email Auth Sub-Mode: 'signin' | 'register' | 'forgot'
  const [emailAuthMode, setEmailAuthMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  // Language: 'en' | 'te'
  const [language, setLanguage] = useState<'en' | 'te'>('en');

  const appSupportsTelugu = activeApp?.locale === 'te' || activeApp?.id?.includes('-te') || (activeApp?.mediums && activeApp?.mediums.includes('Telugu'));
  const examName = activeApp?.name || 'APPSC Group 2';

  // Form Inputs
  const [mobileNumber, setMobileNumber] = useState('');
  const [gmailAddress, setGmailAddress] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailDisplayName, setEmailDisplayName] = useState('');
  
  // 6-digit OTP array
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Explicit OTP State Manager: 'idle' | 'sending' | 'sent' | 'verifying' | 'success'
  const [otpStage, setOtpStage] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'success'>('idle');
  const isMountedRef = useRef(true);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const serverRequestIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Authentication & UX States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Image load fallback state
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  // Active luxury Indian scene index for auto-sliding carousel
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % INDIAN_LUXURY_SCENES.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, []);

  // Dedicated 60-Second Resend Countdown Manager
  const startCountdown = (seconds = 60) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Safe unmount teardown
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Web OTP API Auto-Fill Effect
  useEffect(() => {
    if (currentScreen !== 'otp') return;
    let cleanup: any;
    listenForWebOtp((incomingCode) => {
      const digits = incomingCode.replace(/\D/g, '').slice(0, 6);
      if (digits.length >= 4) {
        const newArr = ['', '', '', '', '', ''];
        for (let i = 0; i < 6; i++) {
          newArr[i] = digits[i] || '';
        }
        setOtpDigits(newArr);
        setSuccessMsg(language === 'te' ? 'SMS ద్వారా OTP ఆటో-ఫిల్ చేయబడింది! ✨' : 'OTP auto-filled via SMS Web OTP API! ✨');
      }
    }).then((unsub) => {
      cleanup = unsub;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [currentScreen]);

  // Auto-Submit Verification as soon as all 6 digits are typed
  useEffect(() => {
    if (
      currentScreen === 'otp' && 
      otpDigits.every(d => d.trim() !== '') && 
      otpStage !== 'verifying' && 
      otpStage !== 'success' && 
      !isSubmitting
    ) {
      handleVerifyOtp();
    }
  }, [otpDigits, currentScreen, otpStage, isSubmitting]);

  // Firebase Phone Authentication: reCAPTCHA lifecycle
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const createVerifier = async (): Promise<RecaptchaVerifier> => {
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;

    const container = document.getElementById('recaptcha-container');
    if (!container) {
      throw new Error('reCAPTCHA container is missing. Refresh the page and try again.');
    }
    container.innerHTML = '';

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('[Firebase Phone Auth] reCAPTCHA verified');
      },
      'expired-callback': () => {
        console.warn('[Firebase Phone Auth] reCAPTCHA expired, clearing');
        recaptchaVerifierRef.current = null;
        window.recaptchaVerifier = null;
      }
    });

    recaptchaVerifierRef.current = verifier;
    window.recaptchaVerifier = verifier;
    return verifier;
  };

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSubmitting || otpStage === 'sending' || otpStage === 'verifying') return;

    setErrorMsg('');
    setSuccessMsg('');

    const { cleanDigits, isValid, validationError } = sanitizeIndianPhoneNumber(mobileNumber);
    if (!isValid || cleanDigits.length !== 10) {
      setErrorMsg(validationError || (language === 'te'
        ? '6, 7, 8 లేదా 9తో ప్రారంభమయ్యే సరైన 10 అంకెల భారతీయ మొబైల్ నంబర్ నమోదు చేయండి.'
        : 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'));
      return;
    }

    setOtpStage('sending');
    setIsSubmitting(true);

    try {
      const verifier = await createVerifier();
      const result = await signInWithPhoneNumber(auth, `+91${cleanDigits}`, verifier);
      if (!isMountedRef.current) return;

      setConfirmationResult(result);
      confirmationResultRef.current = result;
      serverRequestIdRef.current = null;
      setMobileNumber(cleanDigits);
      setOtpStage('sent');
      setCurrentScreen('otp');
      setOtpDigits(['', '', '', '', '', '']);
      startCountdown(60);
      setSuccessMsg(language === 'te'
        ? `+91 ${cleanDigits} నంబర్‌కు SMS ద్వారా OTP పంపబడింది.`
        : `Verification code sent via SMS to +91 ${cleanDigits}.`);

      window.setTimeout(() => {
        if (isMountedRef.current) otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (error: any) {
      console.warn('[Firebase Phone Auth] Notice: Firebase Phone Auth unavailable or threw config error. Triggering transactional backend OTP engine fallback:', error?.code || error?.message);
      
      try {
        const resp = await sendOtpApi(`+91${cleanDigits}`, 'sms');
        if (!isMountedRef.current) return;

        setConfirmationResult(null);
        confirmationResultRef.current = null;
        serverRequestIdRef.current = resp.requestId;
        setMobileNumber(cleanDigits);
        setOtpStage('sent');
        setCurrentScreen('otp');
        setOtpDigits(['', '', '', '', '', '']);
        startCountdown(60);
        setSuccessMsg(resp.message || (language === 'te'
          ? `+91 ${cleanDigits} నంబర్‌కు SMS ద్వారా OTP పంపబడింది.`
          : `Verification code sent via SMS to +91 ${cleanDigits}.`));

        window.setTimeout(() => {
          if (isMountedRef.current) otpInputRefs.current[0]?.focus();
        }, 150);
      } catch (fallbackErr: any) {
        console.error('Server OTP Send Error:', fallbackErr);
        setErrorMsg(fallbackErr?.message || (language === 'te'
          ? 'OTP పంపడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.'
          : 'Unable to send OTP. Please check mobile number and try again.'));
        setOtpStage('idle');
        setConfirmationResult(null);
        confirmationResultRef.current = null;
        serverRequestIdRef.current = null;
        setCurrentScreen('login');
      } finally {
        recaptchaVerifierRef.current?.clear();
        recaptchaVerifierRef.current = null;
        window.recaptchaVerifier = null;
        const container = document.getElementById('recaptcha-container');
        if (container) container.replaceChildren();
      }
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  const handleSendWhatsAppOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSubmitting || otpStage === 'sending' || otpStage === 'verifying') return;

    setErrorMsg('');
    setSuccessMsg('');

    const { cleanDigits, isValid, validationError } = sanitizeIndianPhoneNumber(mobileNumber);
    if (!isValid || cleanDigits.length !== 10) {
      setErrorMsg(validationError || (language === 'te'
        ? '6, 7, 8 లేదా 9తో ప్రారంభమయ్యే సరైన 10 అంకెల భారతీయ మొబైల్ నంబర్ నమోదు చేయండి.'
        : 'Enter a valid 10-digit Indian mobile number.'));
      return;
    }

    setOtpStage('sending');
    setIsSubmitting(true);

    try {
      const resp = await sendOtpApi(`+91${cleanDigits}`, 'whatsapp');
      if (!isMountedRef.current) return;

      setConfirmationResult(null);
      confirmationResultRef.current = null;
      serverRequestIdRef.current = resp.requestId;
      setMobileNumber(cleanDigits);
      setOtpStage('sent');
      setCurrentScreen('otp');
      setOtpDigits(['', '', '', '', '', '']);
      startCountdown(60);
      setSuccessMsg(language === 'te'
        ? `+91 ${cleanDigits} నంబర్‌కు వాట్సాప్ (WhatsApp) ద్వారా సెక్యూరిటీ కోడ్ పంపబడింది.`
        : `WhatsApp OTP verification code dispatched to +91 ${cleanDigits}.`);

      window.setTimeout(() => {
        if (isMountedRef.current) otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (error: any) {
      console.error('WhatsApp OTP send error:', error);
      setErrorMsg(error?.message || (language === 'te'
        ? 'వాట్సాప్ కోడ్ పంపడం విఫలమైంది. దయచేసి సాధారణ SMS నొక్కండి.'
        : 'Failed to send WhatsApp verification code. Try standard SMS.'));
      setOtpStage('idle');
      setCurrentScreen('login');
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  const handleToggleLanguage = () => {
    setLanguage((previous) => (previous === 'en' ? 'te' : 'en'));
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned[cleaned.length - 1];
    setOtpDigits(newDigits);

    if (index < 5 && cleaned) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setOtpDigits(newDigits);
    const nextEmptyIndex = newDigits.findIndex(d => !d);
    if (nextEmptyIndex !== -1) {
      otpInputRefs.current[nextEmptyIndex]?.focus();
    } else {
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSubmitting || otpStage === 'verifying' || otpStage === 'success') return;

    setErrorMsg('');
    const code = otpDigits.join('');
    const activeConfirmation = confirmationResultRef.current || confirmationResult;
    const serverRequestId = serverRequestIdRef.current;

    if (!activeConfirmation && !serverRequestId) {
      setErrorMsg(language === 'te' ? 'ముందుగా OTP పొందండి.' : 'Request an OTP before verifying it.');
      setOtpStage('idle');
      setCurrentScreen('login');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setErrorMsg(language === 'te' ? 'పూర్తి 6 అంకెల OTP నమోదు చేయండి.' : 'Enter the complete 6-digit OTP.');
      return;
    }

    setOtpStage('verifying');
    setIsSubmitting(true);
    try {
      if (activeConfirmation) {
        // Firebase Confirmation Result Flow
        const credential = await activeConfirmation.confirm(code);
        if (!isMountedRef.current) return;

        const user = credential.user;
        await syncUserProfileToFirestore(user, { phoneNumber: user.phoneNumber || `+91${mobileNumber.replace(/\D/g, '')}` });
        await syncUserProfileToSupabase(user, { phoneNumber: user.phoneNumber || `+91${mobileNumber.replace(/\D/g, '')}` });
        if (!isMountedRef.current) return;

        setOtpStage('success');
        setSuccessMsg(language === 'te' ? 'మొబైల్ నంబర్ విజయవంతంగా ధృవీకరించబడింది!' : 'Phone number verified successfully.');
        localStorage.setItem(`aspirant_user_logged_in_${activeApp?.id || 'app'}`, 'true');
        localStorage.setItem('aspirant_user_logged_in', 'true');
        localStorage.setItem('aspirant_user_uid', user.uid);
        if (user.phoneNumber) localStorage.setItem('aspirant_user_phone', user.phoneNumber);

        window.setTimeout(() => {
          if (isMountedRef.current) onLoginSuccess();
        }, 350);
      } else if (serverRequestId) {
        // Transactional Server API OTP Flow
        const resp = await verifyOtpApi(serverRequestId, `+91${mobileNumber.replace(/\D/g, '')}`, code);
        if (!isMountedRef.current) return;

        const user = resp.user || {
          uid: `usr_${Date.now()}`,
          phoneNumber: `+91${mobileNumber.replace(/\D/g, '')}`,
        };

        const simulatedFirebaseUser: any = {
          uid: user.uid,
          phoneNumber: user.phoneNumber || `+91${mobileNumber.replace(/\D/g, '')}`,
          displayName: (user as any).displayName || `Aspirant (${mobileNumber.slice(-4)})`,
          email: `${mobileNumber.replace(/\D/g, '')}@aspirant.app`,
          emailVerified: true,
        };

        await syncUserProfileToFirestore(simulatedFirebaseUser, { phoneNumber: simulatedFirebaseUser.phoneNumber });
        await syncUserProfileToSupabase(simulatedFirebaseUser, { phoneNumber: simulatedFirebaseUser.phoneNumber });
        if (!isMountedRef.current) return;

        setOtpStage('success');
        setSuccessMsg(language === 'te' ? 'మొబైల్ నంబర్ విజయవంతంగా ధృవీకరించబడింది!' : 'Phone number verified successfully.');
        localStorage.setItem(`aspirant_user_logged_in_${activeApp?.id || 'app'}`, 'true');
        localStorage.setItem('aspirant_user_logged_in', 'true');
        localStorage.setItem('aspirant_user_uid', simulatedFirebaseUser.uid);
        localStorage.setItem('aspirant_user_phone', simulatedFirebaseUser.phoneNumber);

        window.setTimeout(() => {
          if (isMountedRef.current) onLoginSuccess();
        }, 350);
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      const code = error?.code || '';
      console.warn('[Phone Auth] Verification attempt notice:', code || error?.message);
      const messages: Record<string, string> = {
        'auth/invalid-verification-code': language === 'te'
          ? 'తప్పు OTP కోడ్. దయచేసి మళ్లీ చూడండి.'
          : 'Incorrect OTP code. Please check the SMS and try again.',
        'auth/code-expired': language === 'te'
          ? 'ఈ OTP గడువు ముగిసింది. దయచేసి కొత్త OTPని అభ్యర్థించండి.'
          : 'This verification code has expired. Please request a new OTP.',
        'auth/session-expired': language === 'te'
          ? 'ధృవీకరణ సెషన్ గడువు ముగిసింది.'
          : 'Verification session expired. Please request a new OTP.',
        'auth/too-many-requests': language === 'te'
          ? 'చాలా సార్లు ప్రయత్నించారు. కొద్దిసేపు వేచి ఉండండి.'
          : 'Too many verification attempts. Please wait a moment.',
        'auth/network-request-failed': language === 'te'
          ? 'నెట్‌వర్క్ సమస్య.'
          : 'Network error. Please check your internet connection.',
      };
      setOtpStage('sent');
      setErrorMsg(messages[code] || (error?.message ? String(error.message) : 'OTP verification failed. Please try again.'));

      window.setTimeout(() => {
        if (isMountedRef.current) {
          otpInputRefs.current[0]?.focus();
          otpInputRefs.current[0]?.select();
        }
      }, 100);
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        if (res.user) {
          await syncUserProfileToFirestore(res.user);
          localStorage.setItem(`aspirant_user_logged_in_${activeApp?.id || 'app'}`, 'true');
          localStorage.setItem('aspirant_user_logged_in', 'true');
          localStorage.setItem('aspirant_user_uid', res.user.uid);
          if (res.user.email) {
            localStorage.setItem('aspirant_user_email', res.user.email);
          }
          onLoginSuccess();
          return;
        }
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      const code = err.code || '';
      let msg = language === 'te' ? 'Google సైన్-ఇన్ విఫలమైంది.' : 'Google sign-in failed.';
      if (code === 'auth/popup-closed-by-user') {
        msg = language === 'te' ? 'సైన్-ఇన్ పాపప్ మూసివేయబడింది.' : 'Sign-in popup was closed before completing.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const email = gmailAddress.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      setErrorMsg(
        language === 'te'
          ? 'దయచేసి సరైన ఈమెయిల్ చిరునామాను నమోదు చేయండి.'
          : 'Please enter a valid email address.'
      );
      return;
    }

    if (emailAuthMode === 'forgot') {
      setIsSubmitting(true);
      try {
        await resetUserPassword(email);
        setSuccessMsg(
          language === 'te'
            ? 'పాస్‌వర్డ్ రీసెట్ లింక్ మీ ఈమెయిల్‌కు పంపబడింది!'
            : 'Password reset link sent to your email! Please check your inbox.'
        );
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to send password reset email.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!emailPassword || emailPassword.length < 6) {
      setErrorMsg(
        language === 'te'
          ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (emailAuthMode === 'register') {
        await registerWithEmailPassword(email, emailPassword, emailDisplayName.trim() || undefined);
        setSuccessMsg(
          language === 'te'
            ? 'ఖాతా విజయవంతంగా సృష్టించబడింది! స్వాగతం.'
            : 'Account created successfully! Welcome to the portal.'
        );
        setTimeout(() => {
          onLoginSuccess();
        }, 300);
      } else {
        await loginWithEmailPassword(email, emailPassword);
        setSuccessMsg(
          language === 'te'
            ? 'విజయవంతంగా లాగిన్ అయ్యారు!'
            : 'Signed in successfully!'
        );
        setTimeout(() => {
          onLoginSuccess();
        }, 300);
      }
    } catch (err: any) {
      console.warn('Email authentication notice:', err);
      let friendlyMsg = err.message || 'Authentication failed. Please verify credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMsg = language === 'te' 
          ? 'ఈమెయిల్ లేదా పాస్‌వర్డ్ సరైనది కాదు.' 
          : 'Invalid email or password. If you are a new user, click Create Account.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMsg = language === 'te'
          ? 'ఈ ఈమెయిల్ ఇప్పటికే నమోదు చేయబడింది. దయచేసి సైన్ ఇన్ చేయండి.'
          : 'Email is already registered. Please click Sign In.';
      }
      setErrorMsg(friendlyMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedMobile = mobileNumber.length === 10
    ? `+91 ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5)}`
    : `+91 ${mobileNumber}`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FAF8F5] via-[#F4EFE6] to-[#EAE1D2] text-stone-900 flex flex-col justify-between items-center px-4 py-4 sm:py-6 lg:py-8 font-sans selection:bg-amber-600 selection:text-white relative overflow-x-hidden">
      {/* Hidden reCAPTCHA Container */}
      <div id="recaptcha-container"></div>

      {/* Luminous Warm Luxury Ambient Lighting */}
      <div className="fixed top-12 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-300/25 via-amber-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[550px] h-[550px] bg-gradient-to-tl from-amber-400/20 via-orange-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 right-10 w-[350px] h-[350px] bg-amber-200/15 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & BRANDING                                                  */}
      {/* ========================================================================= */}
      <header className="relative z-10 w-full max-w-7xl flex items-center justify-between py-2 mb-3 px-2">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-2xl bg-white border-2 border-amber-300/70 shadow-sm">
            <ApEmblem size={38} />
          </div>
          <div>
            <h1 className="text-stone-900 font-black text-base sm:text-lg lg:text-xl tracking-tight leading-tight flex items-center gap-2">
              <span>{examName}</span>
              <span className="text-[10px] sm:text-[11px] font-black uppercase bg-gradient-to-r from-amber-600 to-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                Official
              </span>
            </h1>
            <p className="text-xs text-stone-600 font-semibold">
              {language === 'te' && appSupportsTelugu ? 'పోటీ పరీక్షల సాధన & మాక్ టెస్ట్ వేదిక' : 'Official Aspirant Exam Prep & MCQ Arena'}
            </p>
          </div>
        </div>

        {appSupportsTelugu && (
          <button
            type="button"
            onClick={handleToggleLanguage}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-amber-200/80 text-xs font-bold text-stone-800 transition-all shadow-xs cursor-pointer hover:shadow-sm"
          >
            <Globe className="w-4 h-4 text-amber-600" />
            <span>{language === 'te' ? 'English' : 'తెలుగు'}</span>
          </button>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN SHOWCASE: EXPANSIVE FULL-SCREEN CAROUSEL + LUXURY LOGIN CARD      */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-7xl my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-stretch">
        
        {/* ======================================================================= */}
        {/* LEFT: EXPANSIVE CAROUSEL HERO SHOWCASE (LARGE / FULL-SCREEN STYLE)     */}
        {/* ======================================================================= */}
        <section className="lg:col-span-7 xl:col-span-7 flex flex-col gap-3">
          <div className="relative w-full rounded-3xl overflow-hidden border-2 border-amber-300/80 shadow-[0_25px_60px_-15px_rgba(180,120,40,0.22)] bg-stone-900 h-[340px] sm:h-[420px] md:h-[480px] lg:h-full lg:min-h-[600px] xl:min-h-[640px] group">
            <AnimatePresence mode="wait">
              {(() => {
                const currentScene = INDIAN_LUXURY_SCENES[activeSceneIndex];
                const hasErr = imageError[currentScene.id];

                return (
                  <motion.div
                    key={currentScene.id}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {!hasErr ? (
                      <img
                        src={currentScene.image}
                        alt={currentScene.titleEn}
                        onError={() => setImageError((prev) => ({ ...prev, [currentScene.id]: true }))}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 p-6 sm:p-8 flex flex-col justify-between">
                        <div className="flex items-center gap-2.5">
                          <Award className="w-7 h-7 text-amber-400" />
                          <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                            {language === 'te' ? currentScene.badgeTe : currentScene.badgeEn}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-white">
                            {language === 'te' ? currentScene.titleTe : currentScene.titleEn}
                          </h3>
                          <p className="text-sm text-stone-300 mt-1">
                            {language === 'te' ? currentScene.descTe : currentScene.descEn}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Rich Cinematic Scrim Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-950/20 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
                      {/* Top Row: Luxury Gold Badge & Slide Number */}
                      <div className="flex items-center justify-between w-full">
                        <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-amber-500/90 text-stone-950 text-xs font-black uppercase tracking-wider backdrop-blur-md border border-amber-300/80 shadow-md">
                          <Sparkles className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                          <span>{language === 'te' ? currentScene.badgeTe : currentScene.badgeEn}</span>
                        </span>
                        
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/75 border border-amber-400/40 text-xs font-mono font-bold text-amber-300 backdrop-blur-md">
                          <span>{activeSceneIndex + 1}</span>
                          <span className="text-stone-400">/</span>
                          <span className="text-stone-300">{INDIAN_LUXURY_SCENES.length}</span>
                        </div>
                      </div>

                      {/* Bottom Row: Large Grand Title & Subtitle */}
                      <div className="space-y-2 max-w-2xl">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-lg">
                          {language === 'te' ? currentScene.titleTe : currentScene.titleEn}
                        </h2>
                        <p className="text-xs sm:text-sm lg:text-base text-amber-100/95 font-medium leading-relaxed drop-shadow-md">
                          {language === 'te' ? currentScene.descTe : currentScene.descEn}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* Carousel Navigation Chevron Buttons */}
            <button
              type="button"
              onClick={() => setActiveSceneIndex((prev) => (prev === 0 ? INDIAN_LUXURY_SCENES.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-stone-950/60 hover:bg-stone-950 border border-amber-300/50 text-white hover:text-amber-300 transition-all cursor-pointer backdrop-blur-md shadow-lg opacity-80 group-hover:opacity-100"
              aria-label="Previous Scene"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSceneIndex((prev) => (prev + 1) % INDIAN_LUXURY_SCENES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-stone-950/60 hover:bg-stone-950 border border-amber-300/50 text-white hover:text-amber-300 transition-all cursor-pointer backdrop-blur-md shadow-lg opacity-80 group-hover:opacity-100"
              aria-label="Next Scene"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Carousel Pagination Indicators */}
            <div className="absolute bottom-3 sm:bottom-4 inset-x-0 z-20 flex items-center justify-center gap-2">
              {INDIAN_LUXURY_SCENES.map((scene, idx) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setActiveSceneIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSceneIndex === idx
                      ? 'w-7 sm:w-8 bg-amber-400 shadow-md shadow-amber-400/50'
                      : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to scene ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop Prestige Feature Strip */}
          <div className="hidden lg:flex items-center justify-between px-5 py-3 rounded-2xl bg-white/80 border border-amber-200/80 shadow-xs text-xs font-bold text-stone-700 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'te' ? '100% అధికారిక సిలబస్' : '100% Official Exam Syllabus'}</span>
            </div>
            <div className="h-3 w-px bg-stone-300" />
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{language === 'te' ? '5000+ అధ్యాయాల వారీ ప్రశ్నలు' : '5,000+ Topic Wise MCQs'}</span>
            </div>
            <div className="h-3 w-px bg-stone-300" />
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{language === 'te' ? 'ఆంధ్రప్రదేశ్ & తెలంగాణ టెస్ట్ సిరీస్' : 'AP & TS Real-time Mock Tests'}</span>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* RIGHT: PREMIUM LUXURIOUS LOGIN CARD CONTAINER                           */}
        {/* ======================================================================= */}
        <section className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full bg-white/95 backdrop-blur-2xl rounded-3xl border-2 border-amber-200/80 shadow-[0_25px_60px_-15px_rgba(180,130,40,0.16)] p-6 sm:p-8 flex flex-col gap-5 relative overflow-hidden"
          >
            {/* Top Royal Gold Accent Bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

            {/* Login Card Heading */}
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                <span>{language === 'te' ? 'అభ్యర్థి లాగిన్ వేదిక' : 'Aspirant Portal Sign In'}</span>
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-semibold">
                {language === 'te' 
                  ? 'మీ మొబైల్ లేదా ఈమెయిల్‌తో తక్షణమే ప్రాక్టీస్ ప్రారంభించండి' 
                  : 'Log in with Mobile OTP or Email to start your prep journey'}
              </p>
            </div>

            {/* ======================================================== */}
            {/* LOGIN TABS CONTROLLER (SMS OTP vs WHATSAPP vs EMAIL)      */}
            {/* ======================================================== */}
            {currentScreen === 'login' && (
              <div className="flex items-center p-1.5 bg-[#FAF7F2] rounded-2xl border border-amber-200/80 text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginTab('mobile');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginTab === 'mobile'
                      ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white font-black shadow-md shadow-amber-600/25'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'SMS OTP' : 'SMS OTP'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginTab('whatsapp');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginTab === 'whatsapp'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black shadow-md shadow-emerald-600/25'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-700" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginTab('gmail');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginTab === 'gmail'
                      ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white font-black shadow-md shadow-amber-600/25'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'ఈమెయిల్' : 'Email'}</span>
                </button>
              </div>
            )}

            {/* Alerts */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="flex-1 leading-snug">{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && !errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="flex-1 leading-snug">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ======================================================== */}
            {/* SCREEN 1A: MOBILE NUMBER INPUT FORM                     */}
            {/* ======================================================== */}
            {currentScreen === 'login' && loginTab === 'mobile' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-stone-800 block mb-1.5">
                    {language === 'te' ? 'భారతీయ మొబైల్ నంబర్ నమోదు చేయండి' : 'Enter 10-Digit Mobile Number'}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-amber-700 font-black text-sm flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-stone-500" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setMobileNumber(val);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="98765 43210"
                      maxLength={10}
                      autoFocus
                      className="w-full bg-[#FAF8F5] border-2 border-stone-200 focus:border-amber-600 focus:bg-white rounded-xl pl-16 pr-4 py-3.5 text-base font-extrabold tracking-widest text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-amber-200/50 shadow-inner transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {language === 'te' 
                        ? 'మీ మొబైల్ నంబర్‌కు SMS ద్వారా భద్రతా కోడ్ (OTP) పంపబడుతుంది.' 
                        : 'We will send a 6-digit SMS verification code to your number.'}
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || mobileNumber.length !== 10}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white font-black text-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-white" />
                      <span>{language === 'te' ? 'OTP పంపుతోంది...' : 'Sending SMS OTP...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'te' ? 'OTP కోడ్ పొందండి' : 'Get OTP Code'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* SCREEN 1B: WHATSAPP NUMBER & DEEP LINK LOGIN             */}
            {/* ======================================================== */}
            {currentScreen === 'login' && loginTab === 'whatsapp' && (
              <form onSubmit={handleSendWhatsAppOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-emerald-800 block mb-1.5 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'te' ? 'వాట్సాప్ నంబర్‌తో సైన్ ఇన్ చేయండి' : 'WhatsApp Account Login'}</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-emerald-700 font-black text-sm flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-stone-500" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setMobileNumber(val);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="98765 43210"
                      maxLength={10}
                      autoFocus
                      className="w-full bg-[#FAF8F5] border-2 border-emerald-300 focus:border-emerald-600 focus:bg-white rounded-xl pl-16 pr-4 py-3.5 text-base font-extrabold tracking-widest text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-emerald-200/50 shadow-inner transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {language === 'te' 
                        ? 'మీ వాట్సాప్ అకౌంట్‌కి 6 అంకెల సెక్యూరిటీ మెసేజ్ పంపబడుతుంది.' 
                        : 'Security verification code will be dispatched to your WhatsApp.'}
                    </span>
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting || mobileNumber.length !== 10}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white font-black text-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin text-white" />
                        <span>{language === 'te' ? 'వాట్సాప్ మెసేజ్ పంపుతోంది...' : 'Sending WhatsApp Code...'}</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                        <span>{language === 'te' ? 'వాట్సాప్ OTP పొందండి' : 'Get WhatsApp OTP'}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://wa.me/918008123456?text=${encodeURIComponent(
                      `APPSC Group 2 Login Code Request for ${mobileNumber || 'Aspirant'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'te' ? 'నేరుగా వాట్సాప్‌లో తెరిచి లాగిన్ అవ్వండి' : 'Open Direct WhatsApp Deep-Link'}</span>
                  </a>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* SCREEN 1C: EMAIL & ONE-TAP GOOGLE AUTHENTICATION        */}
            {/* ======================================================== */}
            {currentScreen === 'login' && loginTab === 'gmail' && (
              <div className="space-y-4">
                {/* One-Tap Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-extrabold text-xs transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer border-2 border-stone-200 hover:border-amber-300 active:scale-[0.99]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{language === 'te' ? 'Google తో కొనసాగించండి' : 'Continue with Google'}</span>
                </button>

                <div className="relative flex items-center justify-center my-1.5">
                  <div className="border-t border-stone-200 w-full" />
                  <span className="bg-white px-3 text-[10px] text-stone-500 font-bold uppercase tracking-wider shrink-0">
                    {language === 'te' ? 'లేదా ఈమెయిల్‌తో' : 'or email account'}
                  </span>
                </div>

                {/* Sub Mode Toggle */}
                <div className="flex items-center gap-1.5 justify-center text-xs font-bold bg-[#FAF7F2] p-1 rounded-xl border border-amber-200/60">
                  <button
                    type="button"
                    onClick={() => setEmailAuthMode('signin')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      emailAuthMode === 'signin' ? 'text-amber-800 bg-white border border-amber-200 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {language === 'te' ? 'సైన్ ఇన్' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailAuthMode('register')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      emailAuthMode === 'register' ? 'text-amber-800 bg-white border border-amber-200 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {language === 'te' ? 'కొత్త ఖాతా' : 'Create Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailAuthMode('forgot')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      emailAuthMode === 'forgot' ? 'text-amber-800 bg-white border border-amber-200 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {language === 'te' ? 'పాస్‌వర్డ్ రీసెట్' : 'Forgot?'}
                  </button>
                </div>

                <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
                  {emailAuthMode === 'register' && (
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {language === 'te' ? 'పూర్తి పేరు' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={emailDisplayName}
                        onChange={(e) => setEmailDisplayName(e.target.value)}
                        placeholder="Aspirant Name"
                        className="w-full bg-[#FAF8F5] border-2 border-stone-200 focus:border-amber-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-3 focus:ring-amber-200/50 shadow-inner"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {language === 'te' ? 'ఈమెయిల్ చిరునామా' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={gmailAddress}
                      onChange={(e) => setGmailAddress(e.target.value)}
                      placeholder="aspirant@gmail.com"
                      required
                      className="w-full bg-[#FAF8F5] border-2 border-stone-200 focus:border-amber-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-3 focus:ring-amber-200/50 shadow-inner"
                    />
                  </div>

                  {emailAuthMode !== 'forgot' && (
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        {language === 'te' ? 'పాస్‌వర్డ్' : 'Password'}
                      </label>
                      <input
                        type="password"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full bg-[#FAF8F5] border-2 border-stone-200 focus:border-amber-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-3 focus:ring-amber-200/50 shadow-inner"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white font-black text-xs active:scale-[0.99] disabled:opacity-50 transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    {isSubmitting ? (
                      <RotateCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>
                          {emailAuthMode === 'register' 
                            ? (language === 'te' ? 'ఖాతా సృష్టించండి' : 'Register Account')
                            : emailAuthMode === 'forgot'
                            ? (language === 'te' ? 'రీసెట్ లింక్ పంపండి' : 'Send Reset Link')
                            : (language === 'te' ? 'సైన్ ఇన్ చేయండి' : 'Sign In')}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ======================================================== */}
            {/* SCREEN 2: 6-DIGIT OTP VERIFICATION VIEW                  */}
            {/* ======================================================== */}
            {currentScreen === 'otp' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                      setOtpStage('idle');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{language === 'te' ? 'నంబర్ మార్చండి' : 'Change Number'}</span>
                  </button>
                  <span className="text-xs font-extrabold text-stone-700">
                    {formattedMobile}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-2 text-center">
                    {language === 'te' ? 'SMS లో పంపిన 6 అంకెల OTP కోడ్‌ని నమోదు చేయండి' : 'Enter 6-Digit Verification Code'}
                  </label>

                  {/* 6 OTP Inputs */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2 my-3">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 sm:w-12 h-12 text-center bg-[#FAF8F5] border-2 border-stone-200 focus:border-amber-600 focus:bg-white rounded-xl text-xl font-black text-stone-900 focus:outline-none focus:ring-4 focus:ring-amber-200/50 shadow-inner transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting || otpDigits.some(d => !d)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white font-black text-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting || otpStage === 'verifying' ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-white" />
                      <span>{language === 'te' ? 'ధృవీకరిస్తోంది...' : 'Verifying OTP...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'te' ? 'ధృవీకరించి కొనసాగండి' : 'Verify & Proceed'}</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Resend Countdown */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-stone-500 font-medium">
                    {language === 'te' ? 'కోడ్ రాలేదా?' : "Didn't receive code?"}
                  </span>
                  {countdown > 0 ? (
                    <span className="text-amber-700 font-extrabold">
                      {language === 'te' ? `${countdown} సెకన్లలో రీసెండ్ చేయవచ్చు` : `Resend in ${countdown}s`}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleSendOtp(e)}
                      className="text-amber-700 hover:text-amber-900 font-extrabold underline cursor-pointer"
                    >
                      {language === 'te' ? 'కొత్త OTP పంపండి' : 'Resend SMS OTP'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Security Assurance Badge */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{language === 'te' ? '256-బిట్ సురక్షిత పోర్టల్' : '256-Bit Encrypted Portal'}</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-stone-900 transition-colors cursor-pointer hover:underline"
                >
                  {language === 'te' ? 'గోప్యత' : 'Privacy'}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-stone-900 transition-colors cursor-pointer hover:underline"
                >
                  {language === 'te' ? 'నిబంధనలు' : 'Terms'}
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer Copyright */}
      <footer className="relative z-10 w-full text-center text-xs text-stone-500 font-medium py-3">
        © {new Date().getFullYear()} APPSC Group 2 Aspirant Portal • Powered by AI Studio
      </footer>
    </div>
  );
}
