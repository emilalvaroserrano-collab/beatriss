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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Beatrice OSS Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Firebase Auth & Sync Status */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 block">Firebase Account & Cloud Sync</label>
              {onOpenProfile && (
                <button
                  onClick={onOpenProfile}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <UserIcon className="w-3 h-3" />
                  View Profile Page
                </button>
              )}
            </div>
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-emerald-500/40" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold">
                      {user.email?.[0].toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">{user.displayName || 'Signed In'}</span>
                    <span className="text-[10px] text-slate-400 block">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 text-xs transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="text-slate-400 text-[11px]">Sign in with Google to sync sessions & transcripts to Firestore.</p>
                <button
                  onClick={signInWithGoogle}
                  className="px-3 py-1.5 shrink-0 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 text-xs transition-all shadow-md"
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
              <label className="font-semibold text-slate-200 block">Voice Activity Detection (VAD)</label>
              <VadControlWidget
                vadConfig={vadConfig}
                vadStatus={vadStatus}
                onUpdateConfig={onSaveVadConfig}
              />
            </div>
          )}

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 block">Beatrice Voice Persona</label>
            <div className="grid grid-cols-1 gap-2">
              {voices.map((v) => (
                <button
                  key={v.name}
                  onClick={() => onSaveConfig({ voiceName: v.name })}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    config.voiceName === v.name
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-200 text-xs block">{v.name}</span>
                    <span className="text-[11px] text-slate-400">{v.desc}</span>
                  </div>
                  {config.voiceName === v.name && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Video Stream FPS */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 block">
              Live Video Frame Stream Rate ({config.videoFps} FPS)
            </label>
            <input
              type="range"
              min={1}
              max={2}
              step={1}
              value={config.videoFps}
              onChange={(e) => onSaveConfig({ videoFps: Number(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-950 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Captures camera or screen JPEG frames and streams to Eburon Live API. 1 FPS is optimal for real-time vision without network latency.
            </p>
          </div>

          {/* System Instruction Prompt */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 block">System Persona Prompt</label>
            <textarea
              value={config.systemInstruction}
              onChange={(e) => onSaveConfig({ systemInstruction: e.target.value })}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl p-3 text-xs text-slate-200 focus:outline-none resize-none"
            />
          </div>

          {/* Active Tools Toggles */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 block">Enabled Function Tools</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableSandboxTool}
                  onChange={(e) => onSaveConfig({ enableSandboxTool: e.target.checked })}
                  className="accent-cyan-400"
                />
                <span>Code Sandbox</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableCliTool}
                  onChange={(e) => onSaveConfig({ enableCliTool: e.target.checked })}
                  className="accent-cyan-400"
                />
                <span>Terminal CLI</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableAgentTool}
                  onChange={(e) => onSaveConfig({ enableAgentTool: e.target.checked })}
                  className="accent-cyan-400"
                />
                <span>Sub-Agents</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableWebSearchTool}
                  onChange={(e) => onSaveConfig({ enableWebSearchTool: e.target.checked })}
                  className="accent-cyan-400"
                />
                <span>Web Search</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
