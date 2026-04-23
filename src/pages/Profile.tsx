import { useState } from 'react';
import { useSkills } from '../context/SkillContext';
import { Trophy, Medal, Zap, Star, Shield, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Profile() {
  const { skills } = useSkills();
  const mySkills = skills.filter(s => s.status === 'active');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Identity & Context Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-8 translate-x-8" />
          
          <div className="relative w-24 h-24 rounded-full border-4 border-surface shadow-md mb-4 bg-slate-800 flex items-center justify-center text-white text-3xl font-bold">
            MT
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-tertiary rounded-full flex items-center justify-center border-2 border-surface text-on-tertiary shadow-sm">
              <Shield size={14} className="fill-current" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-on-surface">M. Tinti</h1>
          <p className="text-on-surface-variant font-medium mt-1">Automation Specialist</p>
          
          <button className="mt-6 font-semibold bg-surface-container-low hover:bg-surface-container text-on-surface px-6 py-2.5 rounded-xl border border-outline-variant transition-colors text-sm">
            Edit Profile
          </button>
        </div>

        {/* Level Stats Card */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                <Star className="text-primary fill-current" size={24} />
                Level 42: Master
              </h2>
              <p className="text-sm font-medium text-on-surface-variant mt-1">8,450 / 10,000 XP to Level 43</p>
            </div>
            <div className="bg-primary-container text-primary font-bold text-xl px-4 py-2 rounded-xl border border-primary/20">
              #12 Rank
            </div>
          </div>

          <div className="w-full h-4 bg-surface-container rounded-full overflow-hidden mb-8 shadow-inner">
            <div className="h-full bg-primary w-[84%] rounded-full relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 text-center">
              <div className="text-2xl font-bold text-primary">156</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Shared</div>
            </div>
            <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 text-center">
              <div className="text-2xl font-bold text-secondary">3.2k</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Clones</div>
            </div>
            <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 text-center">
              <div className="text-2xl font-bold text-tertiary">98%</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">Succ. Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Gamification / Badges */}
        <div className="lg:col-span-6 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Trophy size={24} className="text-tertiary" />
            <h2 className="text-xl font-bold text-on-surface">Achievements</h2>
          </div>
          
          <h3 className="text-sm font-bold text-on-surface-variant mb-4">Recent Badges</h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-surface rounded-2xl border border-outline-variant/50 p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-tertiary/50 transition-colors">
              <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Medal size={24} className="fill-current" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface">First Share</span>
            </div>
            <div className="bg-surface rounded-2xl border border-outline-variant/50 p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Zap size={24} className="fill-current" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface">Auto Guru</span>
            </div>
            <div className="bg-surface-container rounded-2xl border border-dashed border-outline-variant p-4 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-12 h-12 bg-surface-variant text-on-surface-variant rounded-full flex items-center justify-center mb-2">
                <Shield size={24} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">10k Clones</span>
            </div>
          </div>
          
          <h3 className="text-sm font-bold text-on-surface-variant mb-4">Top Contributors</h3>
          <div className="bg-surface rounded-2xl border border-outline-variant/50 overflow-hidden">
            <div className="flex items-center gap-4 p-4 bg-tertiary/5 border-b border-outline-variant/50">
              <div className="w-6 text-center font-bold text-tertiary">1</div>
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">SK</div>
              <div className="flex-1 font-bold text-sm text-on-surface">Sarah Koenig</div>
              <div className="text-xs font-bold text-primary">12,400 XP</div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-primary/5 border-b border-outline-variant/50">
              <div className="w-6 text-center font-bold text-on-surface-variant">12</div>
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-bold">MT</div>
              <div className="flex-1 font-bold text-sm text-on-surface">M. Tinti (You)</div>
              <div className="text-xs font-bold text-primary">8,450 XP</div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="w-6 text-center font-bold text-on-surface-variant">13</div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">JD</div>
              <div className="flex-1 font-bold text-sm text-on-surface">Jordan Lee</div>
              <div className="text-xs font-bold text-on-surface-variant">8,210 XP</div>
            </div>
          </div>
        </div>

        {/* My Shared Skills */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">My Shared Skills</h2>
            <Link to="/skills" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Manage All</Link>
          </div>
          
          <div className="grid grid-cols-1 gap-5">
            {mySkills.slice(0, 2).map(skill => (
              <div key={skill.id} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant hover:border-primary/40 shadow-sm transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-primary transition-colors">
                    <Zap size={20} className="fill-current" />
                  </div>
                  <span className="px-3 py-1 bg-surface border border-outline-variant/50 text-on-surface text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    Public
                  </span>
                </div>
                <h3 className="font-bold text-on-surface text-lg mb-1">{skill.name}</h3>
                <p className="text-sm text-on-surface-variant mb-5 line-clamp-2">{skill.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-surface">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                    {skill.runs * 14} <span className="text-on-surface-variant font-medium">Clones</span>
                  </div>
                  <Link to={`/skill/${skill.id}`} className="text-sm font-semibold text-primary">Edit Logic</Link>
                </div>
              </div>
            ))}
            
            {/* CTA Add more */}
            <Link to="/create" className="bg-surface-container-lowest rounded-2xl p-6 border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] group">
              <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant mb-2 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              </div>
              <h3 className="font-bold text-on-surface mb-1">Share New Skill</h3>
              <p className="text-sm text-on-surface-variant">Publish an automation to the community.</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
