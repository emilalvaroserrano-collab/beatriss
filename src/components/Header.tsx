import React from 'react';
import {
  Activity,
  Cpu,
  Mic,
  MicOff,
  Radio,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BeatriceConfig, SessionStatus, VoiceName } from '../types';

interface HeaderProps {
  status: SessionStatus;
  config: BeatriceConfig;
  onUpdateConfig: (newConfig: Partial<BeatriceConfig>) => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  latencyMs?: number;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  config,
  onUpdateConfig,
  onOpenSettings,
  isMuted,
  onToggleMute,
  latencyMs = 45,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Connected
          </div>
        );
      case 'speaking':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold animate-pulse">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            Beatrice Speaking...
          </div>
        );
      case 'listening':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Listening...
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Initializing Live API...
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Connection Offline
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium">
            Disconnected
          </div>
        );
    }
  };

  const voices: VoiceName[] = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Brand & App Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Beatrice <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">OSS</span>
            </h1>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Eburon Live API • Voice, Live Video & Function Execution
          </p>
        </div>
      </div>

      {/* Voice Controls & Metrics */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Latency & Telemetry */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Latency: <strong className="text-slate-200">{latencyMs}ms</strong></span>
          <span className="text-slate-700">|</span>
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>Model: <strong className="text-slate-200">eburon-3.1-flash-live</strong></span>
        </div>

        {/* Voice selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
          <span className="text-xs text-slate-400 hidden sm:inline">Voice:</span>
          <select
            value={config.voiceName}
            onChange={(e) => onUpdateConfig({ voiceName: e.target.value as VoiceName })}
            className="bg-transparent text-xs text-cyan-300 font-medium focus:outline-none cursor-pointer"
          >
            {voices.map((v) => (
              <option key={v} value={v} className="bg-slate-900 text-slate-200">
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Mute Mic Button */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          className={`p-2 rounded-lg border transition-all ${
            isMuted
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Open Settings"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
