import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import {
  LoginCarouselConfig,
  CarouselSceneItem,
  INDIAN_LUXURY_SCENES,
  DEFAULT_CAROUSEL_CONFIG,
  CarouselTransitionStyle,
  getCarouselAnimationVariants
} from '../../lib/carouselTransitions';
import {
  isImageFullyPreloaded,
  preloadCarouselImage,
  preloadAllCarouselScenes
} from '../../lib/carouselImagePreloader';

interface CarouselShowcaseProps {
  config?: LoginCarouselConfig;
  scenes?: CarouselSceneItem[];
  activeSceneIndex: number;
  setActiveSceneIndex: React.Dispatch<React.SetStateAction<number>>;
  language?: 'en' | 'te';
  className?: string;
  showControls?: boolean;
  showBadges?: boolean;
  showPagination?: boolean;
  aspectClassName?: string;
  isInteractive?: boolean;
}

export default function CarouselShowcase({
  config = DEFAULT_CAROUSEL_CONFIG,
  scenes = INDIAN_LUXURY_SCENES,
  activeSceneIndex,
  setActiveSceneIndex,
  language = 'en',
  className = '',
  showControls = true,
  showBadges = true,
  showPagination = true,
  aspectClassName = 'h-[340px] sm:h-[420px] md:h-[480px] lg:h-full lg:min-h-[600px] xl:min-h-[640px]',
  isInteractive = true,
}: CarouselShowcaseProps) {
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Buffer state: keep track of displayed scene vs requested scene
  // This guarantees the current image stays 100% visible until the next image is fully loaded & decoded
  const [displayedIndex, setDisplayedIndex] = useState<number>(activeSceneIndex);
  const previousSettledSceneRef = useRef<CarouselSceneItem>(scenes[activeSceneIndex] || scenes[0]);

  // Eagerly preload and warm all carousel scenes immediately on mount
  useEffect(() => {
    preloadAllCarouselScenes(scenes);
  }, [scenes]);

  // Check prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // When activeSceneIndex changes, verify image is loaded before switching display
  useEffect(() => {
    const targetScene = scenes[activeSceneIndex] || scenes[0];
    if (!targetScene) return;

    if (isImageFullyPreloaded(targetScene.image)) {
      setDisplayedIndex(activeSceneIndex);
      previousSettledSceneRef.current = targetScene;
    } else {
      // Keep current scene visible, preload next image in background
      let isCancelled = false;
      preloadCarouselImage(targetScene.image).then(() => {
        if (!isCancelled) {
          setDisplayedIndex(activeSceneIndex);
          previousSettledSceneRef.current = targetScene;
        }
      });
      return () => {
        isCancelled = true;
      };
    }
  }, [activeSceneIndex, scenes]);

  // Proactively warm adjacent next & previous slides in the background
  useEffect(() => {
    if (!scenes || scenes.length <= 1) return;
    const nextIdx = (displayedIndex + 1) % scenes.length;
    const prevIdx = (displayedIndex - 1 + scenes.length) % scenes.length;
    preloadCarouselImage(scenes[nextIdx].image);
    preloadCarouselImage(scenes[prevIdx].image);
  }, [displayedIndex, scenes]);

  // Autoplay management
  useEffect(() => {
    if (!config.autoplay_enabled) return;
    if (isInteractive && config.pause_on_interaction && isHovered) return;

    const intervalMs = Math.max(1200, Number(config.autoplay_interval) || 4500);
    const timer = setInterval(() => {
      setActiveSceneIndex((prev) => {
        if (!config.infinite_loop && prev >= scenes.length - 1) {
          return prev;
        }
        return (prev + 1) % scenes.length;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [
    config.autoplay_enabled,
    config.autoplay_interval,
    config.infinite_loop,
    config.pause_on_interaction,
    isHovered,
    isInteractive,
    scenes.length,
    setActiveSceneIndex
  ]);

  const currentScene = scenes[displayedIndex] || scenes[0];
  const baseScene = previousSettledSceneRef.current || currentScene;
  const hasErr = imageError[currentScene.id];

  const [navDirection, setNavDirection] = useState<'left' | 'right'>(
    config.transition_direction === 'right' ? 'right' : 'left'
  );

  const handlePrev = () => {
    setNavDirection('right');
    setActiveSceneIndex((prev) => {
      if (prev <= 0) {
        return config.infinite_loop ? scenes.length - 1 : 0;
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setNavDirection('left');
    setActiveSceneIndex((prev) => {
      if (prev >= scenes.length - 1) {
        return config.infinite_loop ? 0 : prev;
      }
      return prev + 1;
    });
  };

  const isReduceMotionActive = Boolean(config.reduce_motion_support && prefersReducedMotion);
  const variants = getCarouselAnimationVariants(config.transition_style, {
    direction: navDirection || config.transition_direction,
    duration: config.transition_duration,
    reduceMotion: isReduceMotionActive
  });

  const is3DStyle = config.transition_style === CarouselTransitionStyle.FLIP;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full rounded-3xl overflow-hidden border-2 border-amber-300/80 shadow-[0_25px_60px_-15px_rgba(180,120,40,0.22)] bg-stone-900 group select-none ${aspectClassName} ${className}`}
      style={is3DStyle ? { perspective: '1200px', transformStyle: 'preserve-3d' } : undefined}
    >
      {/* 
        Persistent Underlying Buffer Layer:
        Renders the settled scene continuously in the background so there is NEVER
        a black flash, dark gap, or empty card during exit animations or transitions.
      */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden" 
        aria-hidden="true"
      >
        {baseScene && !imageError[baseScene.id] && (
          <img
            src={baseScene.image}
            alt=""
            loading="eager"
            decoding="sync"
            fetchPriority="high"
            className="w-full h-full object-cover object-center brightness-[1.15] contrast-[1.06] saturate-[1.08]"
            style={{ 
              filter: 'brightness(1.15) contrast(1.06) saturate(1.08)',
              transform: 'translateZ(0)'
            }}
          />
        )}
      </div>

      {/* 
        Active Motion Carousel Layer:
        Uses concurrent transition (mode="popLayout", initial={false})
        to crossfade or translate slides seamlessly without an unmounted empty black interval.
      */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${currentScene.id}_${config.transition_style}`}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={variants.transition}
          className="absolute inset-0 w-full h-full z-10"
          style={is3DStyle ? { 
            transformStyle: 'preserve-3d', 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            willChange: 'transform, opacity'
          } : {
            willChange: 'transform, opacity'
          }}
        >
          {/* Main Visual Image Layer - Bright, Clear, Vibrant & Instant */}
          {!hasErr ? (
            <img
              src={currentScene.image}
              alt={currentScene.titleEn}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              onError={() => {
                // If local bundle fails, attempt fallbackUrl before showing error fallback
                if (currentScene.fallbackUrl && currentScene.fallbackUrl !== currentScene.image) {
                  const fallbackImg = new Image();
                  fallbackImg.onload = () => {
                    // Fallback succeeded
                  };
                  fallbackImg.onerror = () => {
                    setImageError((prev) => ({ ...prev, [currentScene.id]: true }));
                  };
                  fallbackImg.src = currentScene.fallbackUrl;
                } else {
                  setImageError((prev) => ({ ...prev, [currentScene.id]: true }));
                }
              }}
              className="w-full h-full object-cover object-center brightness-[1.15] contrast-[1.06] saturate-[1.08] transition-transform duration-700 ease-out"
              style={{ 
                filter: 'brightness(1.15) contrast(1.06) saturate(1.08)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-800 via-stone-700 to-amber-900 p-6 sm:p-8 flex flex-col justify-between">
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
              </div>
            </div>
          )}

          {/* Top Row: Luxury Gold Badge & Slide Indicator (Clean Floating Glass) */}
          {showBadges && (
            <div className="absolute top-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between w-full pointer-events-auto z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/95 text-stone-950 text-[11px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md border border-amber-300/80 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                <span>{language === 'te' ? currentScene.badgeTe : currentScene.badgeEn}</span>
              </span>

              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-950/60 border border-amber-400/40 text-[11px] sm:text-xs font-mono font-bold text-amber-300 backdrop-blur-md shadow-sm">
                <span>{displayedIndex + 1}</span>
                <span className="text-stone-400">/</span>
                <span className="text-stone-300">{scenes.length}</span>
              </div>
            </div>
          )}

          {/* Ultra-Slim Caption Area: Black overlay height reduced by 40% for maximum image exposure and clarity */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/22 via-black/10 to-transparent pt-0.5 sm:pt-1 pb-0.5 sm:pb-1 px-2.5 sm:px-3 pointer-events-auto">
            {/* ONLY the Main Heading - Crisp Compact Bold White Typography */}
            <div className="flex items-center justify-center text-center px-1 sm:px-3">
              <h2 className="text-[11px] sm:text-xs md:text-sm font-black text-white leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] [text-shadow:_0_1px_5px_rgba(0,0,0,0.9)] tracking-tight">
                {language === 'te' ? currentScene.titleTe : currentScene.titleEn}
              </h2>
            </div>

            {/* Micro Carousel Pagination Dots at Bottom of Caption Bar (No overlap with heading) */}
            {showPagination && (
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-0.5">
                {scenes.map((scene, idx) => (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                      displayedIndex === idx
                        ? 'w-3.5 sm:w-4 bg-amber-400 shadow-xs shadow-amber-400/60 ring-1 ring-black/20'
                        : 'w-1 bg-white/70 hover:bg-white'
                    }`}
                    aria-label={`Go to scene ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Chevron Buttons */}
      {showControls && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-stone-950/60 hover:bg-stone-950 border border-amber-300/60 text-white hover:text-amber-300 transition-all cursor-pointer backdrop-blur-md shadow-lg opacity-80 group-hover:opacity-100"
            aria-label="Previous Scene"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-stone-950/60 hover:bg-stone-950 border border-amber-300/60 text-white hover:text-amber-300 transition-all cursor-pointer backdrop-blur-md shadow-lg opacity-80 group-hover:opacity-100"
            aria-label="Next Scene"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Active Transition Badge Watermark for Studio Live Feedback */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="px-2.5 py-1 rounded-lg bg-stone-950/80 border border-amber-400/40 text-[10px] font-mono font-bold text-amber-300 backdrop-blur-md uppercase tracking-wider">
          {config.transition_style} • {config.transition_duration}ms
        </span>
      </div>
    </div>
  );
}
