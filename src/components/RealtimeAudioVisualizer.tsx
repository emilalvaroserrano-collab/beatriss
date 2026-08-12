import React, { useEffect, useRef, useState } from 'react';
import { Radio, Mic, MicOff, Waves, BarChart3, Disc, Activity, Volume2 } from 'lucide-react';
import { SessionStatus } from '../types';
import { AudioController, VadStatus } from '../lib/audioUtils';

interface RealtimeAudioVisualizerProps {
  audioController: AudioController;
  status: SessionStatus;
  isConnected: boolean;
  vadStatus?: VadStatus;
  isMuted?: boolean;
}

export const RealtimeAudioVisualizer: React.FC<RealtimeAudioVisualizerProps> = ({
  audioController,
  status,
  isConnected,
  vadStatus,
  isMuted = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visMode, setVisMode] = useState<'spectrum' | 'waveform' | 'ring'>('spectrum');

  const [metrics, setMetrics] = useState({
    micVol: 0,
    speakerVol: 0,
    peakFreqHz: 0,
    micStatus: 'Offline',
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const peakHolds = new Array(32).fill(0);

    const render = () => {
      animId = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Fetch real-time hardware spectrum and time-domain waveform
      const spectrum = audioController.getRealtimeSpectrum();
      const waveforms = audioController.getWaveformData();

      const micFreqs = spectrum.inputFreqs;
      const speakerFreqs = spectrum.outputFreqs;
      const micVol = spectrum.inputVol;
      const speakerVol = spectrum.outputVol;

      const isAIPlaying = status === 'speaking';
      const isUserSpeaking = vadStatus?.isSpeaking || micVol > 0.02;

      // Calculate Mic Peak Frequency (0-8000 Hz)
      let peakIdx = 0;
      let peakVal = 0;
      micFreqs.forEach((v, i) => {
        if (v > peakVal) {
          peakVal = v;
          peakIdx = i;
        }
      });
      const peakHz = Math.round(((peakIdx + 1) * 8000) / 32);

      // Update UI Telemetry
      if (Math.random() < 0.25) {
        setMetrics({
          micVol,
          speakerVol,
          peakFreqHz: peakHz,
          micStatus: isMuted
            ? 'Muted'
            : isUserSpeaking
            ? 'Voice Active'
            : isConnected
            ? 'Listening'
            : 'Idle',
        });
      }

      // MODE 1: 32-Bin Dual/Mic Equalizer Bars with Peak Holds
      if (visMode === 'spectrum') {
        const numBars = 32;
        const gap = 3;
        const barWidth = (width - gap * (numBars - 1)) / numBars;

        for (let i = 0; i < numBars; i++) {
          const micVal = isMuted ? 0 : micFreqs[i] || 0;
          const speakerVal = speakerFreqs[i] || 0;
          const activeVal = isAIPlaying ? speakerVal : micVal;

          // Peak hold decay
          if (activeVal > peakHolds[i]) {
            peakHolds[i] = activeVal;
          } else {
            peakHolds[i] = Math.max(0, peakHolds[i] - 0.025);
          }

          const h = Math.max(3, activeVal * height * 0.88);
          const x = i * (barWidth + gap);
          const y = height - h;

          // Gradient: Cyan/Teal for Mic Input, Green/Blue for AI Speaker Output
          const grad = ctx.createLinearGradient(0, height, 0, y);
          if (isAIPlaying) {
            grad.addColorStop(0, '#10b981');
            grad.addColorStop(0.6, '#06b6d4');
            grad.addColorStop(1, '#3b82f6');
          } else if (isUserSpeaking) {
            grad.addColorStop(0, '#00f2fe');
            grad.addColorStop(0.5, '#38bdf8');
            grad.addColorStop(1, '#818cf8');
          } else {
            grad.addColorStop(0, '#3f3f46');
            grad.addColorStop(1, '#71717a');
          }

          // Draw Bar
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, h, [3, 3, 0, 0]);
          ctx.fill();

          // Draw Peak Hold Marker Line
          const peakY = height - Math.max(3, peakHolds[i] * height * 0.88);
          ctx.fillStyle = isAIPlaying ? '#34d399' : '#38bdf8';
          ctx.fillRect(x, peakY - 2, barWidth, 2);
        }
      }

      // MODE 2: Oscilloscope Waveform Trace
      else if (visMode === 'waveform') {
        const rawWave = isAIPlaying ? waveforms.outputWave : waveforms.inputWave;

        ctx.lineWidth = 2;
        ctx.strokeStyle = isMuted
          ? '#52525b'
          : isAIPlaying
          ? '#10b981'
          : isUserSpeaking
          ? '#00f2fe'
          : '#38bdf8';

        ctx.beginPath();
        const sliceWidth = width / rawWave.length;
        let x = 0;

        for (let i = 0; i < rawWave.length; i++) {
          const v = isMuted ? 128 : rawWave[i];
          const norm = v / 128.0; // centered at 1.0
          const y = (norm * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Glow Layer
        ctx.lineWidth = 5;
        ctx.strokeStyle = isAIPlaying
          ? 'rgba(16, 185, 129, 0.15)'
          : 'rgba(0, 242, 254, 0.2)';
        ctx.stroke();
      }

      // MODE 3: Radial Frequency Ring
      else if (visMode === 'ring') {
        const cx = width / 2;
        const cy = height / 2;
        const baseRadius = Math.min(cx, cy) * 0.4;

        ctx.save();
        ctx.translate(cx, cy);

        const activeFreqs = isAIPlaying ? speakerFreqs : micFreqs;
        const numBins = activeFreqs.length;

        for (let i = 0; i < numBins; i++) {
          const val = isMuted ? 0 : activeFreqs[i];
          const angle = (i / numBins) * Math.PI * 2;
          const barLen = Math.max(4, val * 45);

          const x1 = Math.cos(angle) * baseRadius;
          const y1 = Math.sin(angle) * baseRadius;
          const x2 = Math.cos(angle) * (baseRadius + barLen);
          const y2 = Math.sin(angle) * (baseRadius + barLen);

          ctx.strokeStyle = isAIPlaying ? '#10b981' : isUserSpeaking ? '#00f2fe' : '#71717a';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Central Pulsing Orb Core
        const coreVol = isAIPlaying ? speakerVol : micVol;
        ctx.fillStyle = isAIPlaying ? '#10b981' : isUserSpeaking ? '#00f2fe' : '#27272a';
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(10, baseRadius * 0.6 + coreVol * 22), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [audioController, status, visMode, vadStatus, isMuted, isConnected]);

  return (
    <div className="bg-[#1c1c1e]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl space-y-3">
      {/* Header with Mic Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
              isMuted
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : metrics.micStatus === 'Voice Active'
                ? 'bg-[#00f2fe]/20 text-[#00f2fe] border-[#00f2fe]/40 animate-pulse'
                : 'bg-white/5 text-zinc-300 border-white/10'
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs text-white tracking-wide">
                Mic Realtime Spectrum
              </h3>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  isMuted
                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                    : metrics.micStatus === 'Voice Active'
                    ? 'bg-[#00f2fe]/15 text-[#00f2fe] border-[#00f2fe]/30 font-bold'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {metrics.micStatus}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              Freq: {metrics.peakFreqHz} Hz | Level: {(metrics.micVol * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Visualizer Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setVisMode('spectrum')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              visMode === 'spectrum'
                ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="32-Bin Equalizer Bars"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setVisMode('waveform')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              visMode === 'waveform'
                ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Mic Oscilloscope Waveform"
          >
            <Waves className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setVisMode('ring')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              visMode === 'ring'
                ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Radial Spectrum Ring"
          >
            <Disc className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-28 bg-black/60 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
        <canvas ref={canvasRef} width={500} height={112} className="w-full h-full block" />

        {/* Muted or Disconnected Overlays */}
        {isMuted && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center text-red-400 text-xs gap-2 font-mono">
            <MicOff className="w-4 h-4" />
            <span>Microphone is Muted</span>
          </div>
        )}

        {!isConnected && !isMuted && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-zinc-500 text-xs gap-2 font-mono">
            <Radio className="w-4 h-4 text-zinc-600" />
            <span>Connect session to stream live audio</span>
          </div>
        )}
      </div>

      {/* Realtime Mic Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <span className="text-zinc-400">Mic Energy:</span>
          <span className="text-[#00f2fe] font-bold">{(metrics.micVol * 100).toFixed(1)}%</span>
        </div>
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <span className="text-zinc-400">AI Speaker:</span>
          <span className="text-emerald-400 font-bold">{(metrics.speakerVol * 100).toFixed(1)}%</span>
        </div>
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <span className="text-zinc-400">Peak Freq:</span>
          <span className="text-purple-400 font-bold">{metrics.peakFreqHz} Hz</span>
        </div>
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
          <span className="text-zinc-400">VAD Threshold:</span>
          <span className="text-zinc-200 font-bold">
            {vadStatus ? `${(vadStatus.threshold * 100).toFixed(1)}%` : '1.5%'}
          </span>
        </div>
      </div>
    </div>
  );
};
