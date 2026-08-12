import React, { useRef, useState } from 'react';
import { Camera, CameraOff, Eye, Monitor, RefreshCw, Scan, ShieldCheck } from 'lucide-react';
import { VideoController } from '../lib/videoUtils';

interface VideoFeedProps {
  onStartCamera: (videoElem: HTMLVideoElement) => Promise<void>;
  onStartScreen: (videoElem: HTMLVideoElement) => Promise<void>;
  onStopVideo: () => void;
  streamType: 'camera' | 'screen' | 'off';
  fps?: number;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  onStartCamera,
  onStartScreen,
  onStopVideo,
  streamType,
  fps = 1,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleCameraToggle = async () => {
    if (streamType === 'camera') {
      onStopVideo();
    } else if (videoRef.current) {
      await onStartCamera(videoRef.current);
    }
  };

  const handleScreenToggle = async () => {
    if (streamType === 'screen') {
      onStopVideo();
    } else if (videoRef.current) {
      await onStartScreen(videoRef.current);
    }
  };

  const handleTriggerSnapshot = () => {
    if (!videoRef.current) return;
    setIsScanning(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setSnapshot(canvas.toDataURL('image/jpeg', 0.85));
    }
    setTimeout(() => setIsScanning(false), 1200);
  };

  return (
    <div className="relative bg-[#1c1c1e]/40 backdrop-blur-2xl rounded-3xl border border-white/5 overflow-hidden flex flex-col justify-between p-4 min-h-[280px]">
      {/* Top Overlay Badge */}
      <div className="flex items-center justify-between z-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 text-xs text-zinc-300">
        <div className="flex items-center gap-2">
          <Eye className={`w-4 h-4 ${streamType !== 'off' ? 'text-[#00f2fe] animate-pulse' : 'text-zinc-500'}`} />
          <span className="font-semibold tracking-[0.2px]">
            {streamType === 'camera'
              ? 'Camera Stream'
              : streamType === 'screen'
              ? 'Screen Live Feed'
              : 'Video Stream Off'}
          </span>
        </div>

        {streamType !== 'off' && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
              {fps} FPS • Streaming
            </span>
          </div>
        )}
      </div>

      {/* Video Stream Element or Placeholder */}
      <div className="relative my-2 flex-1 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800/50">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover rounded-xl ${
            streamType === 'off' ? 'hidden' : 'block'
          }`}
        />

        {/* Scan Overlay Effect when Snapshot or Frame Sent */}
        {isScanning && streamType !== 'off' && (
          <div className="absolute inset-0 bg-cyan-500/10 border-2 border-cyan-400/60 rounded-xl animate-pulse flex items-center justify-center">
            <Scan className="w-10 h-10 text-cyan-300 animate-spin" />
          </div>
        )}

        {streamType === 'off' && (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-2">
              <CameraOff className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-xs font-medium text-slate-400">Live Video Stream Disabled</p>
            <p className="text-[11px] text-slate-600 max-w-xs mt-1">
              Enable your Camera or Screen Share so Beatrice can visually inspect code, UI components, or diagrams in real time.
            </p>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-2 z-10 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCameraToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              streamType === 'camera'
                ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {streamType === 'camera' ? 'Stop Camera' : 'Start Camera'}
          </button>

          <button
            onClick={handleScreenToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              streamType === 'screen'
                ? 'bg-indigo-500/20 border border-indigo-400/40 text-indigo-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            {streamType === 'screen' ? 'Stop Screen' : 'Share Screen'}
          </button>
        </div>

        {streamType !== 'off' && (
          <button
            onClick={handleTriggerSnapshot}
            title="Inspect current visual frame"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700"
          >
            <Scan className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inspect Frame</span>
          </button>
        )}
      </div>
    </div>
  );
};
