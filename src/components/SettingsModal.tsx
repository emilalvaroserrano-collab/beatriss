import React from 'react';
import { Sliders, Sparkles, X, LogIn, LogOut, User as UserIcon, Radio } from 'lucide-react';
import { BeatriceConfig, VoiceName } from '../types';
import { VadConfig, VadStatus } from '../lib/audioUtils';
import { VadControlWidget } from './VadControlWidget';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BeatriceConfig;
  onSaveConfig: (newConfig: Partial<BeatriceConfig>) => void;
  vadConfig?: VadConfig;
  vadStatus?: VadStatus;
  onSaveVadConfig?: (newConfig: Partial<VadConfig>) => void;
  onOpenProfile?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  vadConfig,
  vadStatus,
  onSaveVadConfig,
  onOpenProfile,
}) => {
  const { user, signInWithGoogle, logout } = useAuth();

  if (!isOpen) return null;

  const voices: { name: VoiceName; desc: string }[] = [
    { name: 'Zephyr', desc: 'Warm, balanced, natural conversational tone (Default)' },
    { name: 'Puck', desc: 'Energetic, expressive, playful voice' },
    { name: 'Charon', desc: 'Deep, authoritative, calm technical tone' },
    { name: 'Kore', desc: 'Clear, gentle, melodic assistant tone' },
    { name: 'Fenrir', desc: 'Resonant, confident, focused voice' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-black/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Beatrice Voice & System Settings</h2>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">EBURON AI PREFERENCES</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-300 scrollbar-hide">
          {/* Firebase Auth & Sync Status */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#121215] border border-white/10">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-white block">Account & Cloud Synchronization</label>
              {onOpenProfile && (
                <button
                  onClick={onOpenProfile}
                  className="text-[11px] text-[#00f2fe] hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Profile Page
                </button>
              )}
            </div>
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full border border-cyan-500/40 object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold">
                      {user.email?.[0].toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-white block text-xs">{user.displayName || 'Signed In'}</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-zinc-400 text-[11px] leading-relaxed">Sign in with Google to sync voice sessions & transcripts securely.</p>
                <button
                  onClick={signInWithGoogle}
                  className="px-4 py-2 shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold flex items-center gap-1.5 text-xs transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Google Sign In
                </button>
              </div>
            )}
          </div>

          {/* Voice Activity Detection (VAD) Settings */}
          {vadConfig && vadStatus && onSaveVadConfig && (
            <div className="space-y-2">
              <label className="font-semibold text-white block">Voice Activity Detection (VAD)</label>
              <VadControlWidget
                vadConfig={vadConfig}
                vadStatus={vadStatus}
                onUpdateConfig={onSaveVadConfig}
              />
            </div>
          )}

          {/* Voice Selection */}
          <div className="space-y-3">
            <label className="font-semibold text-white block">Beatrice Voice Persona</label>
            <div className="grid grid-cols-1 gap-2">
              {voices.map((v) => (
                <button
                  key={v.name}
                  onClick={() => onSaveConfig({ voiceName: v.name })}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    config.voiceName === v.name
                      ? 'bg-[#00f2fe]/10 border-[#00f2fe]/50 text-cyan-200 shadow-md shadow-[#00f2fe]/10'
                      : 'bg-[#121215] border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div>
                    <span className="font-bold text-white text-xs block">{v.name}</span>
                    <span className="text-[11px] text-zinc-400">{v.desc}</span>
                  </div>
                  {config.voiceName === v.name && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00f2fe] animate-pulse shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Video Stream FPS */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-[#121215] border border-white/10">
            <label className="font-semibold text-white block">
              Live Video Frame Stream Rate ({config.videoFps} FPS)
            </label>
            <input
              type="range"
              min={1}
              max={2}
              step={1}
              value={config.videoFps}
              onChange={(e) => onSaveConfig({ videoFps: Number(e.target.value) })}
              className="w-full accent-[#00f2fe] bg-black cursor-pointer"
            />
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Streams camera or screen JPEG frames to Eburon Live API. 1 FPS is optimal for real-time vision processing.
            </p>
          </div>

          {/* System Instruction Prompt */}
          <div className="space-y-2">
            <label className="font-semibold text-white block">System Persona Prompt</label>
            <textarea
              value={config.systemInstruction}
              onChange={(e) => onSaveConfig({ systemInstruction: e.target.value })}
              rows={4}
              className="w-full bg-[#121215] border border-white/10 focus:border-[#00f2fe]/60 rounded-2xl p-3.5 text-xs text-white focus:outline-none resize-none placeholder-zinc-500 font-sans"
            />
          </div>

          {/* Active Tools Toggles */}
          <div className="space-y-2.5">
            <label className="font-semibold text-white block">Enabled Function Tools</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-[#121215] border border-white/10 cursor-pointer text-zinc-200 hover:border-white/20">
                <input
                  type="checkbox"
                  checked={config.enableSandboxTool}
                  onChange={(e) => onSaveConfig({ enableSandboxTool: e.target.checked })}
                  className="accent-[#00f2fe]"
                />
                <span>Code Sandbox</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-[#121215] border border-white/10 cursor-pointer text-zinc-200 hover:border-white/20">
                <input
                  type="checkbox"
                  checked={config.enableCliTool}
                  onChange={(e) => onSaveConfig({ enableCliTool: e.target.checked })}
                  className="accent-[#00f2fe]"
                />
                <span>Terminal CLI</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-[#121215] border border-white/10 cursor-pointer text-zinc-200 hover:border-white/20">
                <input
                  type="checkbox"
                  checked={config.enableAgentTool}
                  onChange={(e) => onSaveConfig({ enableAgentTool: e.target.checked })}
                  className="accent-[#00f2fe]"
                />
                <span>Sub-Agents</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-[#121215] border border-white/10 cursor-pointer text-zinc-200 hover:border-white/20">
                <input
                  type="checkbox"
                  checked={config.enableWebSearchTool}
                  onChange={(e) => onSaveConfig({ enableWebSearchTool: e.target.checked })}
                  className="accent-[#00f2fe]"
                />
                <span>Web Search</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
