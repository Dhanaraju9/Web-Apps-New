import React, { useState, useEffect, useMemo } from 'react';
import {
  AppConfig,
  CarouselTransitionStyle,
  CarouselScopeType,
  CarouselTransitionDirection,
  CarouselSpeedPreset,
  LoginCarouselConfig
} from '../../types';
import {
  INDIAN_LUXURY_SCENES,
  DEFAULT_CAROUSEL_CONFIG,
  TRANSITION_STYLE_METADATA,
  resolveCarouselConfig
} from '../../lib/carouselTransitions';
import CarouselShowcase from '../carousel/CarouselShowcase';
import {
  fetchLoginCarouselConfigsFromSupabase,
  saveLoginCarouselConfigToSupabase,
  deleteLoginCarouselConfigFromSupabase,
  recordAuditLogToSupabase
} from '../../services/supabaseService';
import {
  Sparkles,
  Save,
  RotateCw,
  Trash2,
  CheckCircle2,
  Layers,
  Smartphone,
  Monitor,
  Search,
  Filter,
  Check,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Gauge,
  Sliders,
  ShieldCheck,
  Eye,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CarouselTransitionStudioProps {
  apps: AppConfig[];
  currentAdminEmail?: string;
  selectedAppId: string;
  onSelectApp?: (appId: string) => void;
}

export default function CarouselTransitionStudio({
  apps,
  currentAdminEmail = 'sobhadhanaraju0@gmail.com',
  selectedAppId,
  onSelectApp
}: CarouselTransitionStudioProps) {
  // Saved configurations list
  const [configs, setConfigs] = useState<LoginCarouselConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Editing Form State
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [scopeType, setScopeType] = useState<CarouselScopeType>('ALL_APPS');
  const [selectedTargetAppIds, setSelectedTargetAppIds] = useState<string[]>(['all']);
  const [transitionStyle, setTransitionStyle] = useState<CarouselTransitionStyle>(CarouselTransitionStyle.FADE);
  const [transitionDuration, setTransitionDuration] = useState<number>(600);
  const [speedPreset, setSpeedPreset] = useState<CarouselSpeedPreset>('normal');
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(true);
  const [autoplayInterval, setAutoplayInterval] = useState<number>(4500);
  const [transitionDirection, setTransitionDirection] = useState<CarouselTransitionDirection>('left');
  const [infiniteLoop, setInfiniteLoop] = useState<boolean>(true);
  const [pauseOnInteraction, setPauseOnInteraction] = useState<boolean>(true);
  const [reduceMotionSupport, setReduceMotionSupport] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(true);

  // App Search in Selector
  const [appSearchQuery, setAppSearchQuery] = useState('');

  // Live Studio Preview State
  const [previewSceneIndex, setPreviewSceneIndex] = useState(0);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'te'>('en');

  // Diagnostic Simulator State: which app to simulate resolution for
  const [simulationAppId, setSimulationAppId] = useState<string>(selectedAppId || apps[0]?.id || '');

  // Load configs on mount
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const list = await fetchLoginCarouselConfigsFromSupabase();
      setConfigs(list);
    } catch (err) {
      console.warn('Failed to load carousel configurations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    window.setTimeout(() => setStatusMessage(null), 4000);
  };

  // Speed preset handler
  const handleSpeedPresetChange = (preset: CarouselSpeedPreset) => {
    setSpeedPreset(preset);
    if (preset === 'slow') setTransitionDuration(1000);
    else if (preset === 'normal') setTransitionDuration(600);
    else if (preset === 'fast') setTransitionDuration(350);
  };

  const handleDurationSliderChange = (val: number) => {
    setTransitionDuration(val);
    if (val >= 900) setSpeedPreset('slow');
    else if (val >= 500) setSpeedPreset('normal');
    else if (val <= 400) setSpeedPreset('fast');
    else setSpeedPreset('custom');
  };

  // Scope change handler
  const handleScopeTypeChange = (newScope: CarouselScopeType) => {
    setScopeType(newScope);
    if (newScope === 'ALL_APPS') {
      setSelectedTargetAppIds(['all']);
    } else if (newScope === 'SINGLE_APP') {
      setSelectedTargetAppIds([selectedAppId || apps[0]?.id || '']);
    } else if (newScope === 'SELECTIVE_APPS') {
      if (selectedTargetAppIds.includes('all') || selectedTargetAppIds.length === 0) {
        setSelectedTargetAppIds([apps[0]?.id || '']);
      }
    }
  };

  // Filtered Apps for Selector
  const filteredApps = useMemo(() => {
    return apps.filter(
      (a) =>
        a.name.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(appSearchQuery.toLowerCase())
    );
  }, [apps, appSearchQuery]);

  // Current Live Preview Config object
  const currentLivePreviewConfig: LoginCarouselConfig = useMemo(() => {
    return {
      id: editingConfigId || 'preview_studio_config',
      scope_type: scopeType,
      app_ids: selectedTargetAppIds,
      transition_style: transitionStyle,
      transition_duration: transitionDuration,
      speed_preset: speedPreset,
      autoplay_enabled: autoplayEnabled,
      autoplay_interval: autoplayInterval,
      transition_direction: transitionDirection,
      infinite_loop: infiniteLoop,
      pause_on_interaction: pauseOnInteraction,
      reduce_motion_support: reduceMotionSupport,
      is_active: isActive
    };
  }, [
    editingConfigId,
    scopeType,
    selectedTargetAppIds,
    transitionStyle,
    transitionDuration,
    speedPreset,
    autoplayEnabled,
    autoplayInterval,
    transitionDirection,
    infiniteLoop,
    pauseOnInteraction,
    reduceMotionSupport,
    isActive
  ]);

  // Simulated Resolution for selected simulationAppId
  const simulatedResolvedConfig = useMemo(() => {
    return resolveCarouselConfig(simulationAppId, configs);
  }, [simulationAppId, configs]);

  // Save current configuration to Supabase & Local Cache
  const handleSaveConfig = async () => {
    // Validation
    if (scopeType === 'SINGLE_APP' && (!selectedTargetAppIds[0] || selectedTargetAppIds[0] === 'all')) {
      showNotification('error', 'Please select exactly one specific application for Single-App scope.');
      return;
    }
    if (scopeType === 'SELECTIVE_APPS' && selectedTargetAppIds.length === 0) {
      showNotification('error', 'Please select at least one application for Selective-Apps scope.');
      return;
    }

    setIsSaving(true);
    try {
      const configToSave: LoginCarouselConfig = {
        ...currentLivePreviewConfig,
        id: editingConfigId || `carousel_${scopeType.toLowerCase()}_${Date.now()}`
      };

      const saved = await saveLoginCarouselConfigToSupabase(configToSave);

      // Audit log
      recordAuditLogToSupabase({
        adminEmail: currentAdminEmail,
        action: editingConfigId ? 'UPDATE_CAROUSEL_TRANSITION' : 'CREATE_CAROUSEL_TRANSITION',
        targetId: saved.id,
        targetType: 'carousel_config',
        details: `Saved ${saved.transition_style} transition (${saved.scope_type}) with ${saved.transition_duration}ms duration.`
      }).catch(() => {});

      await loadConfigs();
      setEditingConfigId(saved.id);
      showNotification(
        'success',
        `Carousel transition configuration saved successfully to Supabase! (${TRANSITION_STYLE_METADATA[saved.transition_style]?.name})`
      );
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to persist configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  // Load a saved config into editing form
  const handleEditConfig = (cfg: LoginCarouselConfig) => {
    setEditingConfigId(cfg.id);
    setScopeType(cfg.scope_type);
    setSelectedTargetAppIds(cfg.app_ids || []);
    setTransitionStyle(cfg.transition_style);
    setTransitionDuration(cfg.transition_duration || 600);
    setSpeedPreset(cfg.speed_preset || 'normal');
    setAutoplayEnabled(cfg.autoplay_enabled !== false);
    setAutoplayInterval(cfg.autoplay_interval || 4500);
    setTransitionDirection(cfg.transition_direction || 'left');
    setInfiniteLoop(cfg.infinite_loop !== false);
    setPauseOnInteraction(cfg.pause_on_interaction !== false);
    setReduceMotionSupport(cfg.reduce_motion_support !== false);
    setIsActive(cfg.is_active !== false);

    showNotification('success', `Loaded "${cfg.id}" for editing.`);
  };

  // Reset to create new configuration
  const handleNewConfig = () => {
    setEditingConfigId(null);
    setScopeType('ALL_APPS');
    setSelectedTargetAppIds(['all']);
    setTransitionStyle(CarouselTransitionStyle.FADE);
    setTransitionDuration(600);
    setSpeedPreset('normal');
    setAutoplayEnabled(true);
    setAutoplayInterval(4500);
    setTransitionDirection('left');
    setInfiniteLoop(true);
    setPauseOnInteraction(true);
    setReduceMotionSupport(true);
    setIsActive(true);
  };

  // Delete configuration
  const handleDeleteConfig = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete carousel configuration "${id}"?`)) return;

    try {
      await deleteLoginCarouselConfigFromSupabase(id);
      recordAuditLogToSupabase({
        adminEmail: currentAdminEmail,
        action: 'DELETE_CAROUSEL_TRANSITION',
        targetId: id,
        targetType: 'carousel_config',
        details: `Deleted carousel transition configuration ${id}.`
      }).catch(() => {});

      await loadConfigs();
      if (editingConfigId === id) {
        handleNewConfig();
      }
      showNotification('success', 'Configuration removed successfully.');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete configuration.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-700 border border-amber-300/40">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Login Carousel Transitions Studio</span>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Global & Selective
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configure 10 production-grade transition animations, preview live, and target individual, selective, or all apps.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleNewConfig}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Config</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveConfig}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-500 text-white text-xs font-black transition-all shadow-md shadow-amber-600/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{editingConfigId ? 'Save Changes' : 'Publish Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border shadow-sm ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Studio Grid: Left Controls (Tabs/Panels) & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =================================================================== */}
        {/* LEFT COLUMN: ANIMATION SELECTOR & CONTROLS (7 Cols)                 */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-6">

          {/* Section A: Scope & Application Targeting */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>1. Application Targeting Scope</span>
              </h3>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                Priority: {scopeType === 'SINGLE_APP' ? 'High (Single App)' : scopeType === 'SELECTIVE_APPS' ? 'Medium (Selective)' : 'Broad (All Apps)'}
              </span>
            </div>

            {/* Scope Type Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleScopeTypeChange('ALL_APPS')}
                className={`py-3 px-3 rounded-2xl text-xs font-black transition-all border flex flex-col items-center gap-1 cursor-pointer ${
                  scopeType === 'ALL_APPS'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>ALL APPS</span>
                <span className={`text-[10px] font-normal opacity-90 ${scopeType === 'ALL_APPS' ? 'text-amber-100' : 'text-slate-400'}`}>
                  Global Default
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleScopeTypeChange('SELECTIVE_APPS')}
                className={`py-3 px-3 rounded-2xl text-xs font-black transition-all border flex flex-col items-center gap-1 cursor-pointer ${
                  scopeType === 'SELECTIVE_APPS'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>SELECTIVE APPS</span>
                <span className={`text-[10px] font-normal opacity-90 ${scopeType === 'SELECTIVE_APPS' ? 'text-amber-100' : 'text-slate-400'}`}>
                  Target List ({selectedTargetAppIds.filter(id => id !== 'all').length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleScopeTypeChange('SINGLE_APP')}
                className={`py-3 px-3 rounded-2xl text-xs font-black transition-all border flex flex-col items-center gap-1 cursor-pointer ${
                  scopeType === 'SINGLE_APP'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>SINGLE APP</span>
                <span className={`text-[10px] font-normal opacity-90 ${scopeType === 'SINGLE_APP' ? 'text-amber-100' : 'text-slate-400'}`}>
                  Exact Override
                </span>
              </button>
            </div>

            {/* Scope: Single App Selector */}
            {scopeType === 'SINGLE_APP' && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Target Application:
                </label>
                <select
                  value={selectedTargetAppIds[0] || ''}
                  onChange={(e) => setSelectedTargetAppIds([e.target.value])}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.id})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 font-medium">
                  This transition will exclusively override all other settings for this chosen application.
                </p>
              </div>
            )}

            {/* Scope: Selective Apps Multi-Selector with Search & Select All */}
            {scopeType === 'SELECTIVE_APPS' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Select Target Applications ({selectedTargetAppIds.length} selected):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTargetAppIds(apps.map((a) => a.id))}
                      className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTargetAppIds([])}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search registered applications..."
                    value={appSearchQuery}
                    onChange={(e) => setAppSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200 custom-scrollbar">
                  {filteredApps.map((app) => {
                    const isSelected = selectedTargetAppIds.includes(app.id);
                    return (
                      <label
                        key={app.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedTargetAppIds(selectedTargetAppIds.filter((id) => id !== app.id));
                            } else {
                              setSelectedTargetAppIds([...selectedTargetAppIds, app.id]);
                            }
                          }}
                          className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs truncate">{app.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{app.id}</span>
                        </div>
                      </label>
                    );
                  })}
                  {filteredApps.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400">
                      No applications found matching search query.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section B: All 10 Supported Transition Styles */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>2. Supported Transition Styles (All 10 Implemented)</span>
              </h3>
              <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Selected: {TRANSITION_STYLE_METADATA[transitionStyle]?.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
              {Object.values(CarouselTransitionStyle).map((style) => {
                const isSelected = transitionStyle === style;
                const meta = TRANSITION_STYLE_METADATA[style];

                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      setTransitionStyle(style);
                      // Trigger an immediate next slide to showcase the newly selected style
                      setPreviewSceneIndex((prev) => (prev + 1) % INDIAN_LUXURY_SCENES.length);
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-md shadow-slate-900/20'
                        : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md inline-block mb-1.5 ${
                        isSelected ? 'bg-amber-400 text-stone-950 font-black' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {meta.category}
                      </span>
                      <h4 className="text-xs font-black tracking-tight">{meta.name}</h4>
                    </div>

                    <p className={`text-[10px] mt-2 line-clamp-2 ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {meta.description}
                    </p>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section C: Fine-Grained Animation Controls */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>3. Fine Animation Controls & Timing</span>
            </h3>

            {/* Timing & Speed Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Transition Duration:</span>
                <span className="font-mono font-black text-amber-700 text-sm">{transitionDuration} ms</span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={200}
                max={2000}
                step={25}
                value={transitionDuration}
                onChange={(e) => handleDurationSliderChange(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />

              {/* Presets */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {(['fast', 'normal', 'slow', 'custom'] as CarouselSpeedPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSpeedPresetChange(preset)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      speedPreset === preset
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset === 'fast' ? 'Fast (350ms)' : preset === 'normal' ? 'Normal (600ms)' : preset === 'slow' ? 'Slow (1000ms)' : 'Custom'}
                  </button>
                ))}
              </div>
            </div>

            {/* Direction Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Transition Direction (Where Supported):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'left', label: 'Left', icon: ArrowLeft },
                  { id: 'right', label: 'Right', icon: ArrowRight },
                  { id: 'up', label: 'Up', icon: ArrowUp },
                  { id: 'down', label: 'Down', icon: ArrowDown }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = transitionDirection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTransitionDirection(item.id as CarouselTransitionDirection)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSel
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Autoplay & Interaction Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Autoplay Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Auto Play</span>
                  <input
                    type="checkbox"
                    checked={autoplayEnabled}
                    onChange={(e) => setAutoplayEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                </div>
                {autoplayEnabled && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Interval:</span>
                      <span className="font-mono font-bold text-amber-700">{(autoplayInterval / 1000).toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min={1500}
                      max={12000}
                      step={500}
                      value={autoplayInterval}
                      onChange={(e) => setAutoplayInterval(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Infinite Loop Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Infinite Loop</span>
                  <span className="text-[10px] text-slate-500 font-medium">Wrap back to 1st slide</span>
                </div>
                <input
                  type="checkbox"
                  checked={infiniteLoop}
                  onChange={(e) => setInfiniteLoop(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {/* Pause on User Interaction */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Pause on Hover</span>
                  <span className="text-[10px] text-slate-500 font-medium">Freeze during interaction</span>
                </div>
                <input
                  type="checkbox"
                  checked={pauseOnInteraction}
                  onChange={(e) => setPauseOnInteraction(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {/* Reduce Motion Support */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Reduce Motion</span>
                  <span className="text-[10px] text-slate-500 font-medium">Accessibility compliance</span>
                </div>
                <input
                  type="checkbox"
                  checked={reduceMotionSupport}
                  onChange={(e) => setReduceMotionSupport(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Rule Active Status:</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isActive ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Apply this configuration</span>
              </label>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: LIVE PREVIEW STUDIO (5 Cols)                          */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-6">

          {/* Live Preview Container */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            
            {/* Live Studio Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Live Preview Studio
                </h3>
              </div>

              {/* Viewport mode toggle: Desktop vs Mobile */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    previewViewport === 'desktop'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Desktop Viewport"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    previewViewport === 'mobile'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Mobile Viewport"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Live Style Badge & Speed Badge */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0F2942] text-white">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 block tracking-wider">
                  Current Animation
                </span>
                <span className="text-xs font-black">
                  {TRANSITION_STYLE_METADATA[transitionStyle]?.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-300 block">
                  Direction: {transitionDirection.toUpperCase()}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {transitionDuration}ms
                </span>
              </div>
            </div>

            {/* Actual Animated Showcase (identical code to Login Screen) */}
            <div className={`mx-auto transition-all duration-300 ${
              previewViewport === 'mobile'
                ? 'max-w-[320px] border-4 border-slate-800 rounded-[32px] p-2 bg-slate-950 shadow-2xl'
                : 'w-full'
            }`}>
              <CarouselShowcase
                config={currentLivePreviewConfig}
                scenes={INDIAN_LUXURY_SCENES}
                activeSceneIndex={previewSceneIndex}
                setActiveSceneIndex={setPreviewSceneIndex}
                language={previewLanguage}
                aspectClassName={
                  previewViewport === 'mobile'
                    ? 'h-[440px] rounded-[24px]'
                    : 'h-[360px] sm:h-[400px] lg:h-[460px]'
                }
                showControls={true}
                showBadges={true}
                showPagination={true}
                isInteractive={true}
              />
            </div>

            {/* Manual Transition Trigger Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPreviewSceneIndex((prev) => (prev === 0 ? INDIAN_LUXURY_SCENES.length - 1 : prev - 1))}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev Slide</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewLanguage((prev) => (prev === 'en' ? 'te' : 'en'))}
                className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer"
              >
                Lang: {previewLanguage === 'en' ? 'English' : 'తెలుగు'}
              </button>

              <button
                type="button"
                onClick={() => setPreviewSceneIndex((prev) => (prev + 1) % INDIAN_LUXURY_SCENES.length)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Slide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Section D: Diagnostic Runtime Simulator */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>4. Configuration Priority & Diagnostic Resolution</span>
            </h3>
            
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Resolution Order: <strong>Single-App</strong> → <strong>Selective-Apps</strong> → <strong>Global All-Apps</strong> → <strong>Default Baseline</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 block">
                Test Resolution for App:
              </label>
              <select
                value={simulationAppId}
                onChange={(e) => setSimulationAppId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {apps.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Resolution Card Output */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
              <div className="flex items-center justify-between font-black">
                <span>Active Rule:</span>
                <span className="font-mono text-emerald-700">{simulatedResolvedConfig.id}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold">Resolved Style:</span>
                <span className="font-bold text-slate-900 uppercase">
                  {TRANSITION_STYLE_METADATA[simulatedResolvedConfig.transition_style]?.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold">Scope / Duration:</span>
                <span className="font-mono">{simulatedResolvedConfig.scope_type} • {simulatedResolvedConfig.transition_duration}ms</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom List: Saved Carousel Configurations */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Saved Configurations in Supabase ({configs.length})</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage all active rules across your application network. More specific rules take precedence.
            </p>
          </div>

          <button
            type="button"
            onClick={loadConfigs}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="Refresh from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Configurations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px]">
                <th className="py-3 px-3">Scope</th>
                <th className="py-3 px-3">Target Apps</th>
                <th className="py-3 px-3">Transition Style</th>
                <th className="py-3 px-3">Duration & Speed</th>
                <th className="py-3 px-3">Autoplay</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {configs.map((cfg) => {
                const isCurrentEditing = editingConfigId === cfg.id;
                const meta = TRANSITION_STYLE_METADATA[cfg.transition_style] || { name: cfg.transition_style };

                return (
                  <tr
                    key={cfg.id}
                    className={`transition-colors ${
                      isCurrentEditing ? 'bg-amber-50/60 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        cfg.scope_type === 'SINGLE_APP'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : cfg.scope_type === 'SELECTIVE_APPS'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {cfg.scope_type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 max-w-xs truncate font-mono text-[11px] text-slate-700">
                      {cfg.scope_type === 'ALL_APPS'
                        ? 'All Registered Apps'
                        : cfg.app_ids?.join(', ') || 'None'}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-black text-slate-900">{meta.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {cfg.transition_direction}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      {cfg.transition_duration}ms
                    </td>

                    <td className="py-3.5 px-3 text-[11px]">
                      {cfg.autoplay_enabled ? (
                        <span className="text-emerald-700 font-bold">ON ({(cfg.autoplay_interval / 1000).toFixed(1)}s)</span>
                      ) : (
                        <span className="text-slate-400">OFF</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        cfg.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {cfg.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditConfig(cfg)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteConfig(cfg.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                          title="Delete Configuration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {configs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No custom configurations found in Supabase. Default fallback rule is active.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
