import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Trophy, Medal, Crown, Star, Users, Flame, ArrowUpRight, Award, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardViewProps {
  activeApp: AppConfig;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: string;
  accuracy: string;
  mockTests: number;
  badge?: string;
  isUser?: boolean;
  avatar?: string;
  tier?: string;
}

export default function LeaderboardView({ activeApp }: LeaderboardViewProps) {

  // Load real leaderboard rankings (empty by default until real test scores exist)
  const leaderboardData: LeaderboardEntry[] = React.useMemo(() => {
    try {
      const stored = localStorage.getItem(`app_leaderboard_${activeApp.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  }, [activeApp.id]);

  return (
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-4 pb-8 font-sans">
      {/* Header Banner — Bright Royal Champagne, Ivory & Rose Pink */}
      <div className="bg-gradient-to-r from-[#FFF1CC] via-[#FFF8E7] to-[#FFE0EA] text-[#1E1B4B] rounded-2xl p-4 sm:p-6 shadow-md space-y-1.5 relative overflow-hidden border-2 border-amber-300">
        <div className="absolute right-4 top-4 opacity-15 text-7xl pointer-events-none">🏆</div>
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/90 text-[#1E1B4B] rounded-full text-[10px] font-black border border-amber-300 shadow-2xs">
            <span>🏆</span> Live All-India Aspirants Ranking
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#1E1B4B]">Elite Leaderboard — {activeApp.name}</h2>
          <p className="text-[11px] text-slate-700 font-semibold leading-tight">Compare your test scores, speed, and accuracy with top competitive exam aspirants across India.</p>
        </div>
      </div>

      {/* LEADERBOARD CONTAINER — Bright Ivory Pearl & Sapphire Sky */}
      <div className="bg-gradient-to-b from-[#FFF8E7] via-white to-[#DCEBFF]/50 rounded-2xl p-4 sm:p-6 text-[#1E1B4B] shadow-md space-y-4 border-2 border-amber-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 pb-4">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest bg-[#FFF1CC] px-2 py-0.5 rounded-full border border-amber-300">
              ⚡ Live Rankings
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#1E1B4B]">Top State & National Achievers</h3>
          </div>

        </div>

        {leaderboardData.length === 0 ? (
          <div className="bg-gradient-to-br from-[#FFF1CC]/60 via-white to-[#D9FBE8]/60 rounded-2xl p-8 sm:p-12 text-center border-2 border-amber-300 shadow-sm space-y-3">
            <div className="h-12 w-12 rounded-xl bg-[#FFF1CC] text-amber-700 flex items-center justify-center mx-auto text-2xl font-black border border-amber-400 shadow-2xs">
              🏆
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-sm sm:text-base font-black text-[#1E1B4B]">No Rankings Available</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                Live rankings will automatically appear here as aspirants participate in tests for {activeApp.name}.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Highlights */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
              {leaderboardData.slice(0, 3).map((item, idx) => (
                <div
                  key={item.rank}
                  className={`rounded-xl p-2 sm:p-3 text-center flex flex-col items-center justify-between relative border-2 ${
                    idx === 0 
                      ? 'bg-gradient-to-b from-[#FFFCF0] via-[#FFF1CC] to-[#FFE4D1] border-amber-400 shadow-md scale-105 z-10' 
                      : idx === 1
                        ? 'bg-gradient-to-b from-[#F4F9FF] via-[#DCEBFF] to-[#EDE7FF] border-sky-300 shadow-sm'
                        : 'bg-gradient-to-b from-[#F2FEF7] via-[#D9FBE8] to-[#D8F7F5] border-emerald-300 shadow-sm'
                  }`}
                >
                  <div className={`absolute -top-2.5 sm:-top-3 h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs shadow-md ${
                    idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-sky-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    #{item.rank}
                  </div>

                  <div className="relative mt-1">
                    <img src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} alt={item.name} className="h-8 w-8 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-amber-400 shadow-md" />
                    <span className="absolute bottom-0 right-0 text-[9px] sm:text-xs">👑</span>
                  </div>

                  <div className="space-y-0.5 mt-1 sm:mt-1.5 w-full">
                    <h4 className="text-[10px] sm:text-xs font-black text-[#1E1B4B] truncate max-w-[70px] xs:max-w-[90px] sm:max-w-none mx-auto">{item.name}</h4>
                    <p className="text-[9px] sm:text-[10px] font-extrabold text-amber-800">{item.score}</p>
                  </div>

                  <span className="mt-1 sm:mt-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/90 border border-amber-200 text-[8px] sm:text-[9px] font-extrabold text-[#1E1B4B] truncate max-w-full">
                    {item.accuracy}
                  </span>
                </div>
              ))}
            </div>

            {/* Full Ranking List Table */}
            <div className="bg-white rounded-xl border-2 border-amber-200 overflow-hidden divide-y divide-amber-100 shadow-sm">
              {leaderboardData.map((user) => (
                <div
                  key={user.rank}
                  className={`p-2.5 sm:p-4 flex items-center justify-between transition-colors ${
                    user.isUser ? 'bg-[#FFF1CC]/70 border-l-4 border-l-amber-500' : 'hover:bg-[#FFF8E7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    <span className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0 ${
                      user.rank === 1 ? 'bg-amber-500 text-white shadow-xs' :
                      user.rank === 2 ? 'bg-sky-600 text-white shadow-xs' :
                      user.rank === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-[#DCEBFF] text-[#1E1B4B] border border-sky-300'
                    }`}>
                      #{user.rank}
                    </span>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} alt={user.name} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-amber-300" />
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <h4 className="text-[11px] sm:text-sm font-black text-[#1E1B4B] truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">{user.name}</h4>
                          {user.isUser && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[8px] uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-slate-600 font-bold">{user.badge || 'Aspirant'} • {user.mockTests} Tests</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] sm:text-sm font-black text-indigo-900">{user.score}</p>
                    <p className="text-[9px] sm:text-[10px] text-emerald-700 font-extrabold">{user.accuracy}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-600 font-semibold">
            Leaderboard updates every 1 hour based on Grand Mock Test evaluations and daily quiz accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}
