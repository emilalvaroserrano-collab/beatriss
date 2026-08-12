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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Profile Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">User Profile</h2>
              <p className="text-[10px] text-slate-400">Account status & cloud sync identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          
          {/* Main User Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900/90 border border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />
            
            {user ? (
              <>
                <div className="relative mb-3">
                  <img
                    src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user.displayName || 'User Profile'}
                    className="w-20 h-20 rounded-full object-cover border-2 border-cyan-500/40 p-0.5 shadow-xl shadow-cyan-500/10"
                  />
                  <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-slate-950 rounded-full border-2 border-slate-950" title="Authenticated">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {user.displayName || 'Authenticated User'}
                </h3>
                
                <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-xs">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{user.email}</span>
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Firebase Google Account Connected
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 mb-3">
                  <UserIcon className="w-9 h-9" />
                </div>
                <h3 className="text-base font-bold text-white">Guest Session</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-[240px]">
                  You are currently using Beatrice OSS in local guest mode. Sign in to back up your conversations.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Guest Mode (Local Storage)
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
                className="w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-2 font-semibold text-xs transition-all active:scale-98 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out of Account
              </button>
            ) : (
              <button
                onClick={() => {
                  signInWithGoogle();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-98 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Sign In with Google
              </button>
            )}
          </div>

          {/* Real-time Session & Data Stats */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Cloud Data & Session Metrics
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Firestore Database</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user ? 'Synchronized' : 'Guest Local'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Saved Transcripts</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                  {transcriptsCount} items
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Voice Persona</span>
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1 mt-0.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  {config.voiceName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Live Connection</span>
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Privacy & Security Notice
            </span>
            <p>
              Your voice sessions, transcripts, and tools data are processed securely via Eburon Live API. Authenticated data is stored in your private Firebase Firestore collection.
            </p>
          </div>

        </div>

        {/* Profile Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
