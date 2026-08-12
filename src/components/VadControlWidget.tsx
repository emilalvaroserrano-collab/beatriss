import React from 'react';
import { Mic, MicOff, Volume2, Sliders, Zap, Radio, ShieldAlert } from 'lucide-react';
import { VadConfig, VadStatus } from '../lib/audioUtils';

interface VadControlWidgetProps {
  vadConfig: VadConfig;
  vadStatus: VadStatus;
  onUpdateConfig: (newConfig: Partial<VadConfig>) => void;
  compact?: boolean;
}

export const VadControlWidget: React.FC<VadControlWidgetProps> = ({
  vadConfig,
  vadStatus,
  onUpdateConfig,
  compact = false,
}) => {
  // Energy meter ratio
  const energyRatio = Math.min(1, vadStatus.rms / 0.08);
  const thresholdRatio = Math.min(1, vadConfig.threshold / 0.08);

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-[#1c1c1e]/90 border border-white/10 px-3 py-1.5 rounded-xl text-xs backdrop-blur">
        <div className="relative flex items-center justify-center">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              vadStatus.isSpeaking
                ? 'bg-emerald-400 animate-ping'
                : vadConfig.enabled
                  ? 'bg-cyan-400'
                  : 'bg-zinc-600'
            }`}
          />
          <div
            className={`w-2.5 h-2.5 rounded-full absolute ${
              vadStatus.isSpeaking
                ? 'bg-emerald-500'
                : vadConfig.enabled
                  ? 'bg-cyan-500'
                  : 'bg-zinc-500'
            }`}
          />
        </div>

        <span className="font-mono text-[11px] text-zinc-300">
          {vadStatus.isSpeaking ? (
            <span className="text-emerald-400 font-bold">VAD: Speaking</span>
          ) : vadConfig.enabled ? (
            <span className="text-zinc-400">VAD: Listening</span>
          ) : (
            <span className="text-zinc-500">VAD: Off</span>
          )}
        </span>

        {/* Small energy bar */}
        <div className="w-12 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
          <div
            className={`h-full transition-all duration-75 ${
              vadStatus.isSpeaking ? 'bg-emerald-400' : 'bg-cyan-500/60'
            }`}
            style={{ width: `${Math.max(4, energyRatio * 100)}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
            style={{ left: `${thresholdRatio * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-[#1c1c1e]/90 border border-white/10 space-y-3 shadow-xl backdrop-blur text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00f2fe]/20 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-100 flex items-center gap-1.5">
              <span>Voice Activity Detection (VAD)</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  vadStatus.isSpeaking
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold'
                    : vadConfig.enabled
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}
              >
                {vadStatus.isSpeaking ? 'SPEECH ACTIVE' : vadConfig.enabled ? 'LISTENING' : 'DISABLED'}
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400">
              Real-time energy thresholding & auto barge-in turn detection
            </p>
          </div>
        </div>

        {/* VAD Toggle Switch */}
        <button
          type="button"
          onClick={() => onUpdateConfig({ enabled: !vadConfig.enabled })}
          className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all active:scale-95 cursor-pointer ${
            vadConfig.enabled
              ? 'bg-[#00f2fe]/20 text-[#00f2fe] border-[#00f2fe]/40'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
        >
          {vadConfig.enabled ? 'VAD Active' : 'Enable VAD'}
        </button>
      </div>

      {/* Audio Energy RMS Meter */}
      <div className="p-3 bg-black/50 rounded-xl border border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-zinc-400 flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-cyan-400" />
            Mic RMS Energy:
          </span>
          <span className="text-zinc-200">
            {(vadStatus.rms || 0).toFixed(4)} RMS (
            {vadStatus.db ? vadStatus.db.toFixed(1) : '-80'} dB)
          </span>
        </div>

        <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/10 relative">
          {/* Energy Fill */}
          <div
            className={`h-full transition-all duration-75 ${
              vadStatus.isSpeaking
                ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                : 'bg-gradient-to-r from-cyan-500/50 to-blue-500/50'
            }`}
            style={{ width: `${Math.max(2, energyRatio * 100)}%` }}
          />

          {/* Red VAD Threshold Marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-400 z-10 shadow-sm"
            style={{ left: `${thresholdRatio * 100}%` }}
            title={`Threshold: ${vadConfig.threshold.toFixed(3)}`}
          />
        </div>

        <div className="flex justify-between text-[9px] text-zinc-500 font-mono pt-0.5">
          <span>Quiet (0.00)</span>
          <span className="text-red-400">
            Threshold: {(vadConfig.threshold || 0.015).toFixed(3)}
          </span>
          <span>Loud (0.08)</span>
        </div>
      </div>

      {/* Sliders & Barge-In Config */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* Sensitivity Threshold Slider */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-300 font-medium flex justify-between">
            <span>Sensitivity Threshold</span>
            <span className="font-mono text-cyan-400">{vadConfig.threshold.toFixed(3)}</span>
          </label>
          <input
            type="range"
            min="0.005"
            max="0.050"
            step="0.002"
            value={vadConfig.threshold}
            onChange={(e) => onUpdateConfig({ threshold: parseFloat(e.target.value) })}
            className="w-full accent-[#00f2fe] bg-zinc-800 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        {/* Silence Timeout Slider */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-300 font-medium flex justify-between">
            <span>Silence Hangover</span>
            <span className="font-mono text-cyan-400">{vadConfig.silenceDurationMs}ms</span>
          </label>
          <input
            type="range"
            min="300"
            max="1500"
            step="50"
            value={vadConfig.silenceDurationMs}
            onChange={(e) => onUpdateConfig({ silenceDurationMs: parseInt(e.target.value, 10) })}
            className="w-full accent-[#00f2fe] bg-zinc-800 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        {/* Auto Barge-In Toggle */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="space-y-0.5">
            <div className="font-semibold text-zinc-200 text-[11px] flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Auto Barge-In
            </div>
            <div className="text-[9px] text-zinc-400">Stop AI audio on speech</div>
          </div>
          <button
            type="button"
            onClick={() => onUpdateConfig({ autoBargeIn: !vadConfig.autoBargeIn })}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
              vadConfig.autoBargeIn ? 'bg-[#00f2fe]' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                vadConfig.autoBargeIn ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
