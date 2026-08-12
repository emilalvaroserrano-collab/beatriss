import React from 'react';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  LogOut,
  LogIn,
  X,
  Database,
  Sparkles,
  Activity,
  CheckCircle2,
  Volume2,
  Clock,
  Mic,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SessionStatus, BeatriceConfig } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SessionStatus;
  config: BeatriceConfig;
  transcriptsCount: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  status,
  config,
  transcriptsCount,
}) => {
  const { user, signInWithGoogle, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl">
        
        {/* Profile Header */}
        <div className="px-6 py-5 bg-black/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">User Profile & Sync</h2>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">FIRESTORE IDENTITY</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-300 scrollbar-hide">
          
          {/* Main User Card */}
          <div className="p-6 rounded-3xl bg-[#121215] border border-white/10 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />
            
            {user ? (
              <>
                <div className="relative mb-3.5">
                  <img
                    src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user.displayName || 'User Profile'}
                    className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400/50 p-0.5 shadow-xl shadow-cyan-500/20"
                  />
                  <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-black rounded-full border-2 border-black" title="Authenticated">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {user.displayName || 'Authenticated User'}
                </h3>
                
                <div className="flex items-center gap-1.5 mt-1 text-zinc-400 text-xs font-mono">
                  <Mail className="w-3.5 h-3.5 text-[#00f2fe]" />
                  <span>{user.email}</span>
                </div>

                <div className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Firebase Cloud Sync Active
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-3.5">
                  <UserIcon className="w-9 h-9" />
                </div>
                <h3 className="text-base font-bold text-white">Guest Session</h3>
                <p className="text-zinc-400 text-xs mt-1 max-w-[240px] leading-relaxed">
                  You are currently using Beatrice OSS in guest mode. Sign in to sync your transcripts and memory.
                </p>
                <div className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Guest Mode (Local Only)
                </div>
              </>
            )}
          </div>

          {/* Account Actions Button */}
          <div>
            {user ? (
              <button
                onClick={() => {
                  logout();
                }}
                className="w-full py-3 px-4 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-2 font-semibold text-xs transition-all active:scale-98 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out of Account
              </button>
            ) : (
              <button
                onClick={() => {
                  signInWithGoogle();
                }}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-98 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Sign In with Google
              </button>
            )}
          </div>

          {/* Real-time Session & Data Stats */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Database className="w-3.5 h-3.5 text-[#00f2fe]" />
              Cloud Data & Session Metrics
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-[#121215] border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-mono">Database Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user ? 'Synchronized' : 'Guest Local'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121215] border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-mono">Saved Transcripts</span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {transcriptsCount} items
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121215] border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-mono">Voice Persona</span>
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1 mt-1">
                  <Volume2 className="w-3.5 h-3.5 text-[#00f2fe]" />
                  {config.voiceName}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121215] border border-white/10">
                <span className="text-[10px] text-zinc-400 block font-mono">Live Connection</span>
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1 mt-1">
                  <Activity className="w-3.5 h-3.5" />
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded-2xl bg-[#121215] border border-white/10 text-[10px] text-zinc-400 space-y-1">
            <span className="font-semibold text-white block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00f2fe]" />
              Privacy & Cloud Security
            </span>
            <p className="leading-relaxed">
              Your voice sessions, transcripts, and tools data are processed securely via Eburon Live API. Authenticated data is stored in your private Firebase Firestore collection.
            </p>
          </div>

        </div>

        {/* Profile Footer */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
