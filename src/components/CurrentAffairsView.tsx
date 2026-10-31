import React, { useState, useEffect } from 'react';
import { CurrentAffairsItem, AppConfig, BookmarkItem } from '../types';
import { 
  ArrowLeft, Calendar, Clock, Award, 
  Eye, EyeOff, 
  Layers, ChevronRight,
  Bookmark, BookmarkCheck
} from 'lucide-react';
import { isBookmarked, toggleBookmarkCA, fetchBookmarks } from '../services/bookmarkService';
import { motion, AnimatePresence } from 'motion/react';
import MathText from './MathText';
import { useMcqFontSize } from '../lib/mcqFontStore';
import { McqFontControls } from './McqFontControls';
import {
  getCuratedCurrentAffairsImage,
  getBrightCardTheme,
  SmartCardImage,
} from '../lib/subjectVisuals';

interface CurrentAffairsViewProps {
  activeApp: AppConfig;
  currentAffairs?: CurrentAffairsItem[];
  onBackToHome: () => void;
  selectedLanguage: string;
}

export default function CurrentAffairsView({
  activeApp,
  currentAffairs = [],
  onBackToHome,
  selectedLanguage,
}: CurrentAffairsViewProps) {
  const { scaledTextStyle } = useMcqFontSize();
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedNews, setSelectedNews] = useState<CurrentAffairsItem | null>(null);
  const [readingMode, setReadingMode] = useState<boolean>(false);
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [isArticlePaletteOpen, setIsArticlePaletteOpen] = useState<boolean>(false);

  const years = ['2026', '2025', '2024'];
  const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const safeCurrentAffairs = Array.isArray(currentAffairs) ? currentAffairs : [];
  const appNews = safeCurrentAffairs.filter(ca => 
    ca && (
      !ca.appIds ||
      ca.appIds.length === 0 ||
      ca.appIds.includes(activeApp?.id) || 
      ca.appIds.includes('all') || 
      ca.appIds.includes('all-india') || 
      ca.appIds.includes(`all-${activeApp?.countryId}`) ||
      ca.appIds.includes(activeApp?.countryId) ||
      (activeApp?.countryId === 'india' && ca.appIds?.includes('all-india'))
    )
  );

  const langMatchNews = appNews.filter(ca => ca.language === selectedLanguage || (!ca.language && selectedLanguage === 'en'));
  const displayNews = langMatchNews.length > 0 ? langMatchNews : appNews;

  const filteredNews = displayNews.filter(item => {
    if (selectedMonth !== 'All' && !item.month?.toLowerCase().includes(selectedMonth.toLowerCase())) {
      return false;
    }
    if (selectedYear && !item.publishedDate?.includes(selectedYear) && !item.month?.includes(selectedYear)) {
      return false;
    }
    return true;
  });

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    fetchBookmarks('default_user_1', activeApp?.id).then((data) => {
      if (data) setBookmarks(data);
    });
  }, [activeApp?.id]);

  const handleToggleBookmarkItem = async (caItem: CurrentAffairsItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { updatedBookmarks } = await toggleBookmarkCA({
      userId: 'default_user_1',
      appId: activeApp?.id || 'default',
      caItem,
      currentBookmarks: bookmarks
    });
    setBookmarks(updatedBookmarks);
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Header & Navigation Banner (Compact & Clean) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-700 p-4 sm:p-6 rounded-2xl text-white shadow-lg border border-sky-400/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/4 opacity-20 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80" alt="News" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        </div>

        <div className="relative z-10 space-y-1.5">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white border border-white/30 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#FFF1CC] border border-amber-300 text-[#1E1B4B] text-[9px] font-black uppercase tracking-wider">
              📰 Premium
            </span>
            <span className="text-[10px] text-sky-50 font-bold">Daily Updates</span>
          </div>

          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
            Current Affairs
          </h1>
        </div>
      </div>

      {/* Year & Month Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3">
        {/* Years Selector */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider mr-1 shrink-0">Year:</span>
          {years.map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                selectedYear === yr
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>

        {/* Months Horizontal Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-100 scrollbar-thin">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider mr-2 shrink-0">Month:</span>
          {months.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedMonth === m
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ARTICLES GRID FEED (Simple Fade) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.length > 0 ? (
          filteredNews.map((item, idx) => {
            const caImg = getCuratedCurrentAffairsImage(item, idx);
            const cardTheme = getBrightCardTheme(`${item.category || ''} ${item.title || ''}`, idx);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ y: -2 }}
                onClick={() => {
                  setSelectedNews(item);
                }}
                className={`${cardTheme.cardBgClass} rounded-2xl overflow-hidden border ${cardTheme.borderClass} shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer`}
              >
                {/* Compact Image Header */}
                <div className="relative h-32 sm:h-40 w-full overflow-hidden bg-sky-100">
                  <SmartCardImage
                    src={caImg}
                    alt={item.title}
                    fallbackLabel={item.category || 'Current Affairs'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />

                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 z-10">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm border ${cardTheme.badgeBgClass}`}>
                      {item.month || selectedYear}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold shadow-2xs border flex items-center gap-1 ${cardTheme.mcqPillClass}`}>
                        {item.publishedDate || 'Today'}
                      </span>
                      <button
                        onClick={(e) => handleToggleBookmarkItem(item, e)}
                        title={isBookmarked(bookmarks, 'current_affairs', item.id) ? 'Remove Bookmark' : 'Save Article'}
                        className={`p-1 rounded-lg border transition-all cursor-pointer shadow-xs ${
                          isBookmarked(bookmarks, 'current_affairs', item.id)
                            ? 'bg-amber-400 text-[#1E1B4B] border-amber-500'
                            : 'bg-white/95 hover:bg-white text-[#1E1B4B] border-slate-200'
                        }`}
                      >
                        {isBookmarked(bookmarks, 'current_affairs', item.id) ? (
                          <BookmarkCheck className="w-3 h-3 fill-[#1E1B4B]" />
                        ) : (
                          <Bookmark className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compact Card Body */}
                <div className={`p-4 flex-1 flex flex-col justify-between space-y-3 ${cardTheme.bodyBgClass} border-t border-white/80`}>
                  <div className="space-y-1.5">
                    <div className={`h-0.5 w-8 rounded-full bg-gradient-to-r ${cardTheme.accentBarClass}`} />
                    <h3 className={`text-[13px] sm:text-sm font-black ${cardTheme.titleColorClass} leading-snug line-clamp-2`}>
                      <MathText text={item.title} />
                    </h3>

                    <div className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed font-medium">
                      <MathText text={item.content} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1E1B4B]/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#1E1B4B]/70">
                      Exam Focused
                    </span>
                    <button
                      onClick={() => {
                        setSelectedNews(item);
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm hover:brightness-105 bg-white text-[#1E1B4B] border border-slate-200`}
                    >
                      Read <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
            <div className="text-2xl">📭</div>
            <h4 className="text-sm font-black text-slate-900">No Articles Found</h4>
            <p className="text-[11px] text-slate-500">Try selecting 'All' months or another year to browse archive articles.</p>
          </div>
        )}
      </div>

      {/* ARTICLE READER MODAL (Fade Transition) */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 overflow-y-auto overscroll-contain transition-colors duration-300 ${
              readerTheme === 'sepia' 
                ? 'bg-[#fbf0d9]' 
                : readerTheme === 'dark' 
                ? 'bg-[#121824]' 
                : 'bg-slate-950/80 backdrop-blur-md'
            }`}
          >
            <div className="flex flex-col min-h-screen">
              {/* Top Reader Navigation Bar */}
              <div className={`border-b px-6 py-4 flex items-center justify-between shadow-lg shrink-0 transition-all ${
                readingMode ? 'opacity-0 hover:opacity-100 pointer-events-none hover:pointer-events-auto bg-slate-900/90 text-white border-slate-800' : 'bg-slate-900 text-white border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setSelectedNews(null); setReadingMode(false); }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to News
                  </button>
                  <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                    📅 {selectedNews.month || selectedYear}
                  </span>
                </div>

                {/* Reader Controls */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <button
                    onClick={() => setReadingMode(!readingMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      readingMode 
                        ? 'bg-amber-500 text-slate-950 shadow-md animate-pulse' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                    title="Toggle Distraction-Free Reading Mode"
                  >
                    {readingMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{readingMode ? 'Zen Mode ON' : 'Zen Mode'}</span>
                  </button>

                  {/* Theme Selector */}
                  <div className="hidden md:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                      onClick={() => setReaderTheme('light')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${readerTheme === 'light' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setReaderTheme('sepia')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${readerTheme === 'sepia' ? 'bg-[#f5e6cb] text-slate-900' : 'text-slate-400 hover:text-white'}`}
                    >
                      Sepia
                    </button>
                    <button
                      onClick={() => setReaderTheme('dark')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${readerTheme === 'dark' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Dark
                    </button>
                  </div>

                  {/* Article Palette Button */}
                  <button
                    onClick={() => setIsArticlePaletteOpen(!isArticlePaletteOpen)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isArticlePaletteOpen
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-1 ring-indigo-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
                    }`}
                    title="Article Palette"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Palette</span>
                  </button>

                  {/* MCQ Font Size Controls */}
                  <McqFontControls variant="dark" showLabel={false} />

                  <button
                    onClick={() => { setSelectedNews(null); setReadingMode(false); setIsArticlePaletteOpen(false); }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Close Reader"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Article Palette Drawer */}
              {isArticlePaletteOpen && (
                <div className="bg-slate-900/95 border-b border-slate-800 p-4 animate-in slide-in-from-top-2 shadow-xl">
                  <div className="max-w-4xl mx-auto space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                        <Layers className="h-4 w-4" /> Articles Palette ({filteredNews.length})
                      </span>
                      <button
                        onClick={() => setIsArticlePaletteOpen(false)}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-0.5 rounded-md hover:bg-slate-800"
                      >
                        ✕ Close
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                      {filteredNews.map((news, idx) => (
                        <button
                          key={news.id}
                          onClick={() => {
                            setSelectedNews(news);
                            setIsArticlePaletteOpen(false);
                          }}
                          className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            selectedNews?.id === news.id
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md ring-2 ring-amber-300'
                              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                          }`}
                        >
                          <span className="h-5 w-5 rounded-lg bg-black/30 flex items-center justify-center text-[10px] shrink-0 font-mono">
                            {idx + 1}
                          </span>
                          <span className="truncate flex-1">{news.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Scrollable Reader Article Body */}
              <div className={`p-4 sm:p-6 transition-colors flex-1 ${
                readerTheme === 'sepia' 
                  ? 'bg-[#fbf0d9] text-[#43302b]' 
                  : readerTheme === 'dark' 
                  ? 'bg-[#121824] text-slate-200' 
                  : 'bg-slate-100 text-slate-900'
              }`}>
                <div className="max-w-3xl mx-auto">
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    className={`rounded-2xl shadow-lg p-5 sm:p-8 space-y-6 transition-all ${
                      readerTheme === 'sepia' 
                        ? 'bg-[#f5e6cb] border border-[#e6d0ab]' 
                        : readerTheme === 'dark' 
                        ? 'bg-[#192235] border border-slate-800' 
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    {!readingMode && (
                      <div className="space-y-4 border-b border-slate-200/60 pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wide">
                              {selectedNews.month || 'Current Affairs'}
                            </span>
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {selectedNews.publishedDate || 'Published Recently'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => selectedNews && handleToggleBookmarkItem(selectedNews, e)}
                              title={selectedNews && isBookmarked(bookmarks, 'current_affairs', selectedNews.id) ? 'Remove Bookmark' : 'Save Article'}
                              className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                                selectedNews && isBookmarked(bookmarks, 'current_affairs', selectedNews.id)
                                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              }`}
                            >
                              {selectedNews && isBookmarked(bookmarks, 'current_affairs', selectedNews.id) ? (
                                <>
                                  <BookmarkCheck className="w-3.5 h-3.5 fill-slate-950" />
                                  <span>Bookmarked</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-3.5 h-3.5" />
                                  <span>Bookmark</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <h1 
                          className={`text-xl sm:text-2xl font-black leading-tight ${readerTheme === 'dark' ? 'text-white' : readerTheme === 'sepia' ? 'text-[#2c1d1a]' : 'text-slate-900'}`}
                        >
                          <MathText text={selectedNews.title} />
                        </h1>
                      </div>
                    )}

                    {readingMode && (
                      <div className="flex items-center justify-between border-b border-slate-500/20 pb-4">
                        <span className="text-xs font-bold tracking-wider opacity-60 uppercase">Distraction-Free Reading Mode</span>
                        <button
                          onClick={() => setReadingMode(false)}
                          className="text-xs font-bold underline cursor-pointer text-indigo-500 hover:text-indigo-600"
                        >
                          Exit Zen Mode
                        </button>
                      </div>
                    )}

                    {/* Standard Article Text */}
                    <div 
                      className={`whitespace-pre-line leading-relaxed font-normal rounded-2xl p-4 sm:p-6 transition-all ${
                        readerTheme === 'sepia' 
                          ? 'bg-[#fbf0d9]/60 text-[#3b2722]' 
                          : readerTheme === 'dark' 
                          ? 'bg-[#121824]/60 text-slate-200' 
                          : 'bg-slate-50/70 text-slate-800'
                      }`}
                      style={{ ...scaledTextStyle, lineHeight: 1.85 }}
                    >
                      {readingMode && (
                        <h2 className={`text-xl sm:text-2xl font-bold mb-6 pb-4 border-b border-current/10 ${readerTheme === 'dark' ? 'text-white' : readerTheme === 'sepia' ? 'text-[#2c1d1a]' : 'text-slate-900'}`}>
                          <MathText text={selectedNews.title} />
                        </h2>
                      )}
                      <MathText text={selectedNews.content} />
                    </div>

                    <div className="pt-6 border-t border-slate-200/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs font-extrabold opacity-75">
                        <Award className="h-4 w-4 text-indigo-500" />
                        <span>Premium Exam Study Guide</span>
                      </div>
                      <button
                        onClick={() => { setSelectedNews(null); setReadingMode(false); }}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer"
                      >
                        Close Reader
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
