/**
 * LOGIN CAROUSEL TRANSITIONS ENGINE
 * Global & Selective Login Carousel Transition Management
 */

import amaravatiImg from '../assets/images/indian_scene_amaravati_1793199163663.jpg';
import vizagImg from '../assets/images/indian_scene_vizag_1793199164358.jpg';
import tirumalaImg from '../assets/images/indian_scene_tirumala_1793199164313.jpg';
import charminarImg from '../assets/images/indian_scene_charminar_1793199164493.jpg';
import aspirantHubImg from '../assets/images/login_hero_card_1793198668631.jpg';

// ---------------------------------------------------------------------------
// 1. Exact Enum as required
// ---------------------------------------------------------------------------
export enum CarouselTransitionStyle {
  SLIDE = "slide",
  VERTICAL = "vertical",
  FADE = "fade",
  SLIDE_FADE = "slide_fade",
  ZOOM_SLIDE = "zoom_slide",
  FLIP = "flip",
  STACK = "stack",
  SPIN = "spin",
  WIPE = "wipe",
  PARALLAX = "parallax"
}

export type CarouselScopeType = 'SINGLE_APP' | 'SELECTIVE_APPS' | 'ALL_APPS';

export type CarouselTransitionDirection = 'left' | 'right' | 'up' | 'down';

export type CarouselSpeedPreset = 'slow' | 'normal' | 'fast' | 'custom';

export interface LoginCarouselConfig {
  id: string;
  scope_type: CarouselScopeType;
  app_ids: string[]; // targeted application ids
  transition_style: CarouselTransitionStyle;
  transition_duration: number; // 200 - 2000 milliseconds
  speed_preset?: CarouselSpeedPreset;
  autoplay_enabled: boolean;
  autoplay_interval: number; // 1500 - 15000 milliseconds
  transition_direction: CarouselTransitionDirection;
  infinite_loop: boolean;
  pause_on_interaction: boolean;
  reduce_motion_support: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CarouselSceneItem {
  id: string;
  image: string;
  fallbackUrl: string;
  badgeEn: string;
  badgeTe: string;
  titleEn: string;
  titleTe: string;
  descEn: string;
  descTe: string;
}

// ---------------------------------------------------------------------------
// Standard Login Carousel Scenes
// ---------------------------------------------------------------------------
export const INDIAN_LUXURY_SCENES: CarouselSceneItem[] = [
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

// ---------------------------------------------------------------------------
// Default Baseline Configuration
// ---------------------------------------------------------------------------
export const DEFAULT_CAROUSEL_CONFIG: LoginCarouselConfig = {
  id: 'a0000000-0000-0000-0000-000000000001',
  scope_type: 'ALL_APPS',
  app_ids: ['all'],
  transition_style: CarouselTransitionStyle.FADE,
  transition_duration: 600,
  speed_preset: 'normal',
  autoplay_enabled: true,
  autoplay_interval: 4500,
  transition_direction: 'left',
  infinite_loop: true,
  pause_on_interaction: true,
  reduce_motion_support: true,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const TRANSITION_STYLE_METADATA: Record<CarouselTransitionStyle, {
  name: string;
  badge: string;
  description: string;
  category: 'Classic' | 'Cinematic' | '3D & Dynamic';
}> = {
  [CarouselTransitionStyle.SLIDE]: {
    name: 'Horizontal Slide',
    badge: 'Smooth Sliding',
    description: 'Horizontal translation between carousel slides with directional ease.',
    category: 'Classic'
  },
  [CarouselTransitionStyle.VERTICAL]: {
    name: 'Vertical Slide',
    badge: 'Column Flow',
    description: 'Vertical ascending or descending movement between carousel frames.',
    category: 'Classic'
  },
  [CarouselTransitionStyle.FADE]: {
    name: 'Cross Fade',
    badge: 'Pure Opacity',
    description: 'Gentle dissolve with soft contrast curves for minimum distraction.',
    category: 'Classic'
  },
  [CarouselTransitionStyle.SLIDE_FADE]: {
    name: 'Slide & Fade',
    badge: 'Hybrid Classic',
    description: 'Combined directional horizontal velocity with progressive opacity blending.',
    category: 'Classic'
  },
  [CarouselTransitionStyle.ZOOM_SLIDE]: {
    name: 'Zoom & Slide',
    badge: 'Cinematic Scale',
    description: 'Dynamic zoom scaling combined with horizontal movement.',
    category: 'Cinematic'
  },
  [CarouselTransitionStyle.FLIP]: {
    name: '3D Flip Card',
    badge: 'Spatial 3D',
    description: 'Premium 3D perspective rotationY card flipping transition.',
    category: '3D & Dynamic'
  },
  [CarouselTransitionStyle.STACK]: {
    name: 'Card Stacking',
    badge: 'Elevation Stack',
    description: 'Layered card deck stacking with elevation depth translation.',
    category: '3D & Dynamic'
  },
  [CarouselTransitionStyle.SPIN]: {
    name: 'Controlled Spin',
    badge: 'Rotational Velocity',
    description: 'Micro rotational velocity transition with subtle scale spring.',
    category: '3D & Dynamic'
  },
  [CarouselTransitionStyle.WIPE]: {
    name: 'Directional Wipe',
    badge: 'Geometric Reveal',
    description: 'Directional clip-path curtain reveal across the viewport axis.',
    category: 'Cinematic'
  },
  [CarouselTransitionStyle.PARALLAX]: {
    name: 'Multi-layer Parallax',
    badge: 'Depth Parallax',
    description: 'Independent foreground typography and background imagery depth motion.',
    category: 'Cinematic'
  }
};

// ---------------------------------------------------------------------------
// 6. Configuration Priority Resolver
// 1. App-specific configuration ('SINGLE_APP')
// 2. Selective-app configuration ('SELECTIVE_APPS')
// 3. Global configuration ('ALL_APPS')
// 4. Application default configuration
// ---------------------------------------------------------------------------
export function resolveCarouselConfig(
  activeAppId: string,
  configs: LoginCarouselConfig[] = []
): LoginCarouselConfig {
  const activeConfigs = (configs || []).filter(c => c && c.is_active);

  // 1. App-specific configuration ('SINGLE_APP')
  const singleAppConfig = activeConfigs.find(
    c => c.scope_type === 'SINGLE_APP' && c.app_ids?.includes(activeAppId)
  );
  if (singleAppConfig) return singleAppConfig;

  // 2. Selective-app configuration ('SELECTIVE_APPS')
  const selectiveAppConfig = activeConfigs.find(
    c => c.scope_type === 'SELECTIVE_APPS' && c.app_ids?.includes(activeAppId)
  );
  if (selectiveAppConfig) return selectiveAppConfig;

  // 3. Global configuration ('ALL_APPS') customized by Admin
  const customGlobalConfig = activeConfigs.find(
    c => (c.scope_type === 'ALL_APPS' || c.app_ids?.includes('all')) && c.id !== DEFAULT_CAROUSEL_CONFIG.id
  );
  if (customGlobalConfig) return customGlobalConfig;

  // Baseline default in active list with FADE
  const baselineConfig = activeConfigs.find(c => c.id === DEFAULT_CAROUSEL_CONFIG.id);
  if (baselineConfig) {
    return {
      ...DEFAULT_CAROUSEL_CONFIG,
      ...baselineConfig,
      transition_style: baselineConfig.transition_style || CarouselTransitionStyle.FADE
    };
  }

  // 4. Application default configuration (Automatic FADE)
  return DEFAULT_CAROUSEL_CONFIG;
}

// ---------------------------------------------------------------------------
// 3. Complete Motion Animation Variants for All 10 Styles
// ---------------------------------------------------------------------------
export interface AnimationVariantParams {
  direction?: CarouselTransitionDirection;
  duration?: number; // in milliseconds
  reduceMotion?: boolean;
}

export interface CarouselMotionVariants {
  initial: any;
  animate: any;
  exit: any;
  transition: any;
}

export function getCarouselAnimationVariants(
  style: CarouselTransitionStyle,
  params: AnimationVariantParams = {}
): CarouselMotionVariants {
  const {
    direction = 'left',
    duration = 600,
    reduceMotion = false
  } = params;

  const durationSec = Math.max(0.15, Math.min(2.5, duration / 1000));

  // Reduced motion fallback
  if (reduceMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: Math.min(0.3, durationSec), ease: 'easeInOut' }
    };
  }

  // Direction signs
  const isReverse = direction === 'right' || direction === 'down';

  switch (style) {
    // 1. slide – Horizontal sliding between carousel images
    case CarouselTransitionStyle.SLIDE:
      return {
        initial: { x: isReverse ? '-100%' : '100%', opacity: 1 },
        animate: { x: 0, opacity: 1 },
        exit: { x: isReverse ? '100%' : '-100%', opacity: 1 },
        transition: { duration: durationSec, ease: [0.25, 1, 0.5, 1] }
      };

    // 2. vertical – Vertical sliding between images
    case CarouselTransitionStyle.VERTICAL:
      return {
        initial: { y: direction === 'down' ? '-100%' : '100%', opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: direction === 'down' ? '100%' : '-100%', opacity: 1 },
        transition: { duration: durationSec, ease: [0.25, 1, 0.5, 1] }
      };

    // 3. fade – Smooth opacity crossfade
    case CarouselTransitionStyle.FADE:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: durationSec, ease: 'easeInOut' }
      };

    // 4. slide_fade – Combined horizontal movement and opacity
    case CarouselTransitionStyle.SLIDE_FADE:
      return {
        initial: { x: isReverse ? -70 : 70, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: isReverse ? 70 : -70, opacity: 0 },
        transition: { duration: durationSec, ease: [0.16, 1, 0.3, 1] }
      };

    // 5. zoom_slide – Zoom and horizontal sliding combination
    case CarouselTransitionStyle.ZOOM_SLIDE:
      return {
        initial: { x: isReverse ? '-40%' : '40%', scale: 0.88, opacity: 0 },
        animate: { x: '0%', scale: 1, opacity: 1 },
        exit: { x: isReverse ? '40%' : '-40%', scale: 1.12, opacity: 0 },
        transition: { duration: durationSec, ease: [0.22, 1, 0.36, 1] }
      };

    // 6. flip – Premium 3D rotationY image transition (Smooth 180° rotation with realistic depth & subtle shadows)
    case CarouselTransitionStyle.FLIP: {
      const halfDuration = durationSec * 0.55;
      const easeCurve = [0.25, 1, 0.5, 1];
      return {
        initial: {
          rotateY: isReverse ? -90 : 90,
          opacity: 0,
          scale: 0.93,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
        },
        animate: {
          rotateY: 0,
          opacity: 1,
          scale: 1,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transition: {
            duration: halfDuration,
            ease: easeCurve,
            opacity: { duration: halfDuration * 0.75, ease: 'linear' }
          }
        },
        exit: {
          rotateY: isReverse ? 90 : -90,
          opacity: 0,
          scale: 0.93,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
          transition: {
            duration: halfDuration,
            ease: easeCurve,
            opacity: { duration: halfDuration * 0.65, ease: 'linear' }
          }
        },
        transition: {
          duration: halfDuration,
          ease: easeCurve
        }
      };
    }

    // 7. stack – Layered card stacking and movement
    case CarouselTransitionStyle.STACK:
      return {
        initial: { y: isReverse ? -50 : 50, scale: 0.85, opacity: 0 },
        animate: { y: 0, scale: 1, opacity: 1 },
        exit: { y: isReverse ? 50 : -50, scale: 1.08, opacity: 0 },
        transition: { duration: durationSec, ease: [0.25, 0.8, 0.25, 1] }
      };

    // 8. spin – Controlled rotational transition
    case CarouselTransitionStyle.SPIN:
      return {
        initial: { rotate: isReverse ? -16 : 16, scale: 0.86, opacity: 0 },
        animate: { rotate: 0, scale: 1, opacity: 1 },
        exit: { rotate: isReverse ? 16 : -16, scale: 0.86, opacity: 0 },
        transition: { duration: durationSec, ease: [0.19, 1, 0.22, 1] }
      };

    // 9. wipe – Directional image reveal via clip-path
    case CarouselTransitionStyle.WIPE:
      const initialClip = direction === 'right' 
        ? 'inset(0% 100% 0% 0%)'
        : direction === 'up'
        ? 'inset(100% 0% 0% 0%)'
        : direction === 'down'
        ? 'inset(0% 0% 100% 0%)'
        : 'inset(0% 0% 0% 100%)';
      return {
        initial: { clipPath: initialClip, opacity: 0.7 },
        animate: { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: durationSec, ease: [0.65, 0, 0.35, 1] }
      };

    // 10. parallax – Multi-layer depth movement with foreground and background motion
    case CarouselTransitionStyle.PARALLAX:
      return {
        initial: { x: isReverse ? '-30%' : '30%', scale: 1.08, opacity: 0 },
        animate: { x: '0%', scale: 1, opacity: 1 },
        exit: { x: isReverse ? '30%' : '-30%', scale: 0.95, opacity: 0 },
        transition: { duration: durationSec, ease: [0.16, 1, 0.3, 1] }
      };

    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: durationSec, ease: 'easeOut' }
      };
  }
}

// Re-export high-performance image preloader utilities
export {
  isImageFullyPreloaded,
  preloadCarouselImage,
  preloadAllCarouselScenes
} from './carouselImagePreloader';
