import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AgentTask,
  AttachmentInfo,
  BeatriceConfig,
  CanvasContent,
  CliCommandRun,
  CodeSandboxRun,
  ContextWindowConfig,
  ConversationMemoryState,
  SessionStatus,
  ToolCallLog,
  TranscriptItem,
  WsServerMessage,
} from './types';
import { AudioController, VadConfig, VadStatus } from './lib/audioUtils';
import { VideoController } from './lib/videoUtils';
import { MobileOrb } from './components/MobileOrb';
import { VideoFeed } from './components/VideoFeed';
import { TranscriptsView } from './components/TranscriptsView';
import { ToolsWorkbench } from './components/ToolsWorkbench';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { ContextWindowHUD } from './components/ContextWindowHUD';
import { MemoryInspectorModal } from './components/MemoryInspectorModal';
import { VadControlWidget } from './components/VadControlWidget';
import { useAuth } from './context/AuthContext';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Settings,
  Mic,
  MicOff,
  MessageSquare,
  Video,
  Wrench,
  RefreshCw,
  X,
  User as UserIcon,
  Brain,
} from 'lucide-react';

export default function App() {
  const { user, signInWithGoogle } = useAuth();
  const [status, setStatus] = useState<SessionStatus>('disconnected');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [toolLogs, setToolLogs] = useState<ToolCallLog[]>([]);
  const [sandboxRuns, setSandboxRuns] = useState<CodeSandboxRun[]>([]);
  const [cliRuns, setCliRuns] = useState<CliCommandRun[]>([]);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const [canvasData, setCanvasData] = useState<CanvasContent | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [streamType, setStreamType] = useState<'camera' | 'screen' | 'off'>('off');

  const [inputVol, setInputVol] = useState<number>(0);
  const [outputVol, setOutputVol] = useState<number>(0);

  // Active Mobile Drawer: 'none' | 'chat' | 'video' | 'tools'
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'chat' | 'video' | 'tools'>('none');

  const [config, setConfig] = useState<BeatriceConfig>({
    voiceName: 'Zephyr',
    systemInstruction:
      'You are Beatrice OSS, an advanced open-source AI voice & video assistant built with Eburon Live API.',
    enableVideo: true,
    videoFps: 1,
    enableSandboxTool: true,
    enableCliTool: true,
    enableAgentTool: true,
    enableWebSearchTool: true,
    enableWeatherTool: true,
    enableCanvasTool: true,
  });

  // Conversation Memory & Context Window States
  const [contextConfig, setContextConfig] = useState<ContextWindowConfig>({
    maxContextTokens: 128000,
    autoPruneThreshold: 0.8,
    compressionMode: 'auto_summarize',
    memoryRetentionTurns: 20,
  });

  const [memoryState, setMemoryState] = useState<ConversationMemoryState>({
    totalEstimatedTokens: 0,
    activeTurnsCount: 0,
    compressedSummary: '',
    pruneCount: 0,
  });

  const [isMemoryInspectorOpen, setIsMemoryInspectorOpen] = useState<boolean>(false);
  const [isCompressingMemory, setIsCompressingMemory] = useState<boolean>(false);

  // Voice Activity Detection (VAD) States
  const [vadConfig, setVadConfigState] = useState<VadConfig>({
    enabled: true,
    threshold: 0.015,
    silenceDurationMs: 700,
    speechMinDurationMs: 150,
    autoBargeIn: true,
  });

  const [vadStatus, setVadStatus] = useState<VadStatus>({
    isSpeaking: false,
    rms: 0,
    db: -80,
    threshold: 0.015,
    speechDurationMs: 0,
    silenceDurationMs: 0,
  });

  const handleUpdateVadConfig = useCallback((newCfg: Partial<VadConfig>) => {
    setVadConfigState((prev) => {
      const updated = { ...prev, ...newCfg };
      audioCtrlRef.current.setVadConfig(updated);
      return updated;
    });
  }, []);

  // Sync VAD callbacks with AudioController
  useEffect(() => {
    audioCtrlRef.current.setVadConfig(vadConfig);
    audioCtrlRef.current.onVadStatus((s) => setVadStatus(s));
    audioCtrlRef.current.onSpeechStart(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && status === 'speaking') {
        if (vadConfig.autoBargeIn) {
          wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
        }
      }
    });
  }, [vadConfig, status]);

  // Real-time Token Calculation Effect for Context Window
  useEffect(() => {
    const dialogueTurns = transcripts.filter((t) => t.role !== 'system');
    const dialogueChars = dialogueTurns.reduce((acc, t) => acc + (t.text ? t.text.length : 0), 0);
    const sysChars = (config.systemInstruction || '').length;
    const canvasChars = canvasData ? (canvasData.content || '').length : 0;

    // ~3.8 chars per token
    const estimatedTokens = Math.max(1, Math.round((dialogueChars + sysChars + canvasChars) / 3.8));

    setMemoryState((prev) => ({
      ...prev,
      totalEstimatedTokens: estimatedTokens,
      activeTurnsCount: dialogueTurns.length,
    }));
  }, [transcripts, config.systemInstruction, canvasData]);

  // Compress Context Function
  const handleCompressContext = useCallback(async () => {
    setIsCompressingMemory(true);
    try {
      const dialogueTurns = transcripts.filter((t) => t.role !== 'system');
      if (dialogueTurns.length < 2) {
        setIsCompressingMemory(false);
        return;
      }

      const userTopics = dialogueTurns
        .filter((t) => t.role === 'user')
        .map((t) => t.text.slice(0, 60))
        .join('; ');

      const summaryText = `[Session Memory Pruned at ${new Date().toLocaleTimeString()}]: Condensed ${dialogueTurns.length} turns into memory buffer. Key topics discussed: "${userTopics || 'General session guidance'}". Active tools used: ${toolLogs.length}.`;

      setMemoryState((prev) => ({
        ...prev,
        compressedSummary: prev.compressedSummary
          ? `${prev.compressedSummary}\n${summaryText}`
          : summaryText,
        summaryLastUpdated: Date.now(),
        pruneCount: prev.pruneCount + 1,
      }));

      // Keep latest 6 turns in active transcript memory stack
      if (dialogueTurns.length > 6) {
        const systemItem = transcripts.find((t) => t.role === 'system');
        const recentTurns = dialogueTurns.slice(-6);
        setTranscripts(systemItem ? [systemItem, ...recentTurns] : recentTurns);
      }

      // Save compressed session snapshot to Firestore if user logged in
      if (user) {
        await addDoc(collection(db, 'saved_sessions'), {
          userId: user.uid,
          title: `Compressed Memory (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
          summary: summaryText,
          transcriptCount: dialogueTurns.length,
          transcriptsSummary: dialogueTurns.map((t) => `${t.role.toUpperCase()}: ${t.text.slice(0, 80)}`),
          canvasState: {
            title: canvasData?.title || 'Live Canvas Workspace',
            language: 'markdown',
            code: canvasData?.content || '',
            notes: 'Auto-pruned conversation context window.',
          },
          timestamp: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Memory compression error:', err);
    } finally {
      setIsCompressingMemory(false);
    }
  }, [transcripts, toolLogs.length, canvasData, user]);

  const handleClearMemory = useCallback(() => {
    setTranscripts([]);
    setMemoryState({
      totalEstimatedTokens: 0,
      activeTurnsCount: 0,
      compressedSummary: '',
      pruneCount: 0,
    });
  }, []);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtrlRef = useRef<AudioController>(new AudioController());
  const videoCtrlRef = useRef<VideoController>(new VideoController());
  const reconnectAttemptRef = useRef<number>(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnectRef = useRef<boolean>(false);

  // Firestore Transcripts Listener for Authenticated User
  useEffect(() => {
    if (!user || !auth.currentUser || auth.currentUser.uid !== user.uid) return;
    const q = query(collection(db, 'transcripts'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: TranscriptItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            role: data.role,
            text: data.text,
            timestamp: data.timestamp,
          });
        });
        loaded.sort((a, b) => a.timestamp - b.timestamp);
        setTranscripts(loaded);
      },
      (error) => {
        console.warn('Firestore transcripts error:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Firestore User Config Sync
  useEffect(() => {
    if (!user || !auth.currentUser || auth.currentUser.uid !== user.uid) return;
    const syncUserConfig = async () => {
      try {
        const userConfigDoc = doc(db, 'user_configs', user.uid);
        const snap = await getDoc(userConfigDoc);
        if (snap.exists()) {
          const data = snap.data();
          setConfig((prev) => ({
            ...prev,
            voiceName: data.voiceName || prev.voiceName,
            systemInstruction: data.systemInstruction || prev.systemInstruction,
          }));
        } else {
          await setDoc(userConfigDoc, {
            voiceName: config.voiceName,
            systemInstruction: config.systemInstruction,
            videoFps: config.videoFps,
            userId: user.uid,
            updatedAt: Date.now(),
          });
        }
      } catch (err) {
        console.warn('Firestore user_configs error:', err);
      }
    };
    syncUserConfig();
  }, [user]);

  // Save Transcript to Firestore helper
  const saveTranscriptToFirestore = useCallback(
    async (item: TranscriptItem) => {
      if (!user || !auth.currentUser || auth.currentUser.uid !== user.uid) return;
      try {
        await addDoc(collection(db, 'transcripts'), {
          role: item.role,
          text: item.text,
          timestamp: item.timestamp,
          userId: user.uid,
        });
      } catch (err) {
        console.warn('Firestore saveTranscript error:', err);
      }
    },
    [user]
  );

  // Clear Transcripts helper
  const handleClearTranscripts = useCallback(async () => {
    setTranscripts([]);
    if (!user || !auth.currentUser || auth.currentUser.uid !== user.uid) return;
    try {
      const q = query(collection(db, 'transcripts'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore clearTranscripts error:', err);
    }
  }, [user]);

  // Save Tool Log to Firestore helper
  const saveToolLogToFirestore = useCallback(
    async (log: ToolCallLog) => {
      if (!user || !auth.currentUser || auth.currentUser.uid !== user.uid) return;
      try {
        await addDoc(collection(db, 'tool_logs'), {
          name: log.name,
          args: JSON.stringify(log.args || {}),
          result: log.result || '',
          status: log.status,
          timestamp: log.timestamp,
          userId: user.uid,
        });
      } catch (err) {
        console.warn('Firestore saveToolLog error:', err);
      }
    },
    [user]
  );

  // Connect to Beatrice OSS WebSocket server with Exponential Backoff Strategy
  const connectWebSocket = useCallback(() => {
    // Clear any active reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    isManualDisconnectRef.current = false;
    setStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      console.log('Connected to Beatrice Live WebSocket bridge.');
      // Successful connection: reset backoff counter
      reconnectAttemptRef.current = 0;
      setStatus('connected');

      // Start Microphone input capture
      try {
        await audioCtrlRef.current.startInput((base64Pcm16) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'audio', audio: base64Pcm16 }));
          }
        });
      } catch (err) {
        console.error('Microphone start error:', err);
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsServerMessage = JSON.parse(event.data);

        switch (msg.type) {
          case 'status':
            setStatus(msg.status);
            break;

          case 'audio':
            audioCtrlRef.current.playChunk(msg.audio);
            setStatus('speaking');
            break;

          case 'interrupted':
            audioCtrlRef.current.stopPlayback();
            setStatus('listening');
            break;

          case 'turnComplete':
            setStatus('listening');
            break;

          case 'transcript': {
            const newItem: TranscriptItem = {
              id: 'tr_' + Math.random().toString(36).substring(2, 9),
              role: msg.role,
              text: msg.text,
              timestamp: Date.now(),
            };
            setTranscripts((prev) => [...prev, newItem]);
            saveTranscriptToFirestore(newItem);
            break;
          }

          case 'toolCall':
            setToolLogs((prev) => [
              ...prev,
              {
                id: msg.id,
                name: msg.name,
                args: msg.args,
                status: 'executing',
                timestamp: Date.now(),
              },
            ]);
            break;

          case 'toolResult':
            setToolLogs((prev) =>
              prev.map((log) =>
                log.id === msg.id
                  ? { ...log, result: msg.result, status: 'completed' }
                  : log
              )
            );
            break;

          case 'sandboxOutput':
            setSandboxRuns((prev) => [msg.run, ...prev]);
            break;

          case 'cliOutput':
            setCliRuns((prev) => [msg.run, ...prev]);
            break;

          case 'agentUpdate':
            setAgentTasks((prev) => {
              const idx = prev.findIndex((a) => a.id === msg.agent.id);
              if (idx > -1) {
                const updated = [...prev];
                updated[idx] = msg.agent;
                return updated;
              }
              return [msg.agent, ...prev];
            });
            break;

          case 'canvasUpdate':
            setCanvasData(msg.canvas);
            break;

          case 'error':
            console.error('Beatrice Server error:', msg.message);
            setTranscripts((prev) => [
              ...prev,
              {
                id: 'err_' + Date.now(),
                role: 'system',
                text: 'Error: ' + msg.message,
                timestamp: Date.now(),
              },
            ]);
            setStatus('error');
            break;
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    ws.onerror = (event) => {
      console.warn('WebSocket connection status update:', event);
      setStatus('error');
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed.');
      setStatus('disconnected');

      // Exponential backoff automatic reconnect if unexpected disconnect
      const MAX_RECONNECT_ATTEMPTS = 10;
      const INITIAL_RECONNECT_DELAY_MS = 1000;
      const MAX_RECONNECT_DELAY_MS = 30000;

      if (!isManualDisconnectRef.current) {
        if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptRef.current += 1;
          const attempt = reconnectAttemptRef.current;
          // Exponential backoff formula: min(MAX, INITIAL * 2^(attempt-1)) + jitter
          const baseDelay = INITIAL_RECONNECT_DELAY_MS * Math.pow(2, attempt - 1);
          const cappedDelay = Math.min(MAX_RECONNECT_DELAY_MS, baseDelay);
          const jitter = Math.floor(Math.random() * 500);
          const delay = cappedDelay + jitter;

          console.log(`[Backoff] Scheduling reconnect attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS} in ${(delay / 1000).toFixed(1)}s...`);

          setTranscripts((prev) => {
            const noticeText = `Connection lost. Automatically reconnecting in ${(delay / 1000).toFixed(1)}s (Attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS})...`;
            const last = prev[prev.length - 1];
            if (last && last.role === 'system' && last.text.startsWith('Connection lost.')) {
              return prev.slice(0, -1).concat({
                id: 'reconnect_' + Date.now(),
                role: 'system',
                text: noticeText,
                timestamp: Date.now(),
              });
            }
            return [
              ...prev,
              {
                id: 'reconnect_' + Date.now(),
                role: 'system',
                text: noticeText,
                timestamp: Date.now(),
              },
            ];
          });

          reconnectTimerRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          console.warn(`[Backoff] Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached.`);
          setTranscripts((prev) => [
            ...prev,
            {
              id: 'reconnect_failed_' + Date.now(),
              role: 'system',
              text: 'Reconnection attempts exhausted. Click "Reconnect Beatrice" below to manually reconnect.',
              timestamp: Date.now(),
            },
          ]);
        }
      }
    };
  }, [saveTranscriptToFirestore]);

  // Poll audio volume levels for Orb visualizer animation
  useEffect(() => {
    const timer = setInterval(() => {
      const levels = audioCtrlRef.current.getLevels();
      setInputVol(levels.input);
      setOutputVol(levels.output);
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connectWebSocket();
    return () => {
      isManualDisconnectRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      audioCtrlRef.current.stopAll();
      videoCtrlRef.current.stop();
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWebSocket]);

  const handleManualReconnect = useCallback(() => {
    isManualDisconnectRef.current = false;
    reconnectAttemptRef.current = 0;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // ignore
      }
    }
    connectWebSocket();
  }, [connectWebSocket]);

  // Video Streaming Handlers
  const handleStartCamera = async (videoElem: HTMLVideoElement) => {
    try {
      await videoCtrlRef.current.startCamera(
        videoElem,
        (base64Jpeg) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'video', video: base64Jpeg }));
          }
        },
        config.videoFps
      );
      setStreamType('camera');
    } catch (err) {
      console.error('Camera start error:', err);
    }
  };

  const handleStartScreen = async (videoElem: HTMLVideoElement) => {
    try {
      await videoCtrlRef.current.startScreenShare(
        videoElem,
        (base64Jpeg) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'video', video: base64Jpeg }));
          }
        },
        config.videoFps
      );
      setStreamType('screen');
    } catch (err) {
      console.error('Screen share error:', err);
    }
  };

  const handleStopVideo = () => {
    videoCtrlRef.current.stop();
    setStreamType('off');
  };

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioCtrlRef.current.setMute(newMuted);
    
    // Tactile feedback for mute toggle
    if (newMuted) {
      triggerHaptic(10); // Light tap for turning off
    } else {
      triggerHaptic([15, 30, 15]); // Distinct double tap for turning on
    }
  };

  const handleInterrupt = () => {
    triggerHaptic([20, 20]);
    audioCtrlRef.current.stopPlayback();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
    setStatus('listening');
  };

  const handleSendTextMessage = (text: string, attachment?: AttachmentInfo) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const userItem: TranscriptItem = {
        id: 'user_txt_' + Date.now(),
        role: 'user',
        text,
        timestamp: Date.now(),
        attachments: attachment ? [attachment] : undefined,
      };
      setTranscripts((prev) => [...prev, userItem]);
      saveTranscriptToFirestore(userItem);
      wsRef.current.send(JSON.stringify({ type: 'text', text, attachment }));
    }
  };

  const handleRunSandbox = async (code: string, language: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'runSandbox', code, language }));
    } else {
      // Fallback via HTTP REST endpoint when WS is offline
      try {
        const res = await fetch('/api/tools/execute-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language }),
        });
        const data = await res.json();
        setSandboxRuns((prev) => [
          {
            id: 'sb_' + Date.now(),
            code,
            language,
            output: data.output || data.error || 'Execution completed',
            error: data.error,
            status: data.error ? 'failed' : 'success',
            executionTimeMs: data.executionTimeMs || 0,
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      } catch (err: any) {
        console.error('REST sandbox execution error:', err);
      }
    }
  };

  const handleRunCli = async (command: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'runCli', command }));
    } else {
      // Fallback via HTTP REST endpoint when WS is offline
      try {
        const res = await fetch('/api/tools/cli', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command }),
        });
        const data = await res.json();
        setCliRuns((prev) => [
          {
            id: 'cli_' + Date.now(),
            command,
            output: data.output || data.error || 'Command finished',
            exitCode: data.exitCode ?? (data.error ? 1 : 0),
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      } catch (err: any) {
        console.error('REST CLI execution error:', err);
      }
    }
  };

  const handleDeployAgent = async (agentName: string, task: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'deployAgent', agentName, task }));
    } else {
      try {
        const res = await fetch('/api/tools/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentName, task }),
        });
        const data = await res.json();
        setAgentTasks((prev) => [
          {
            id: data.agentId || 'ag_' + Date.now(),
            agentName,
            task,
            status: 'completed',
            progress: 100,
            logs: ['Task completed via REST trigger.'],
            result: data.result,
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      } catch (err) {
        console.error('REST agent deploy error:', err);
      }
    }
  };

  const handleGetSystemInfo = async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'getSystemInfo' }));
    } else {
      try {
        const res = await fetch('/api/tools/system-info');
        const data = await res.json();
        const callId = 'manual_sys_' + Date.now();
        const log: ToolCallLog = {
          id: callId,
          name: 'getSystemInfo',
          args: {},
          result: data,
          status: 'completed',
          timestamp: Date.now(),
        };
        setToolLogs((prev) => [log, ...prev]);
        saveToolLogToFirestore(log);
      } catch (err) {
        console.error('REST system info error:', err);
      }
    }
  };

  const handleUpdateCanvas = async (canvasType: 'diagram' | 'markdown' | 'chart' | 'code_snippet', title: string, content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'updateCanvas', canvasType, title, content }));
    } else {
      try {
        await fetch('/api/tools/canvas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ canvasType, title, content }),
        });
        setCanvasData({ type: canvasType, title, content, updatedAt: Date.now() });
      } catch (err) {
        console.error('REST canvas update error:', err);
      }
    }
  };

  const handleGetWeather = async (location: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'getWeather', location }));
    } else {
      try {
        const res = await fetch('/api/tools/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location }),
        });
        const data = await res.json();
        const callId = 'manual_weather_' + Date.now();
        const log: ToolCallLog = {
          id: callId,
          name: 'getWeather',
          args: { location },
          result: data,
          status: 'completed',
          timestamp: Date.now(),
        };
        setToolLogs((prev) => [log, ...prev]);
        saveToolLogToFirestore(log);
      } catch (err) {
        console.error('REST weather error:', err);
      }
    }
  };

  const handleWebSearch = async (query: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'webSearch', query }));
    } else {
      try {
        const res = await fetch('/api/tools/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        const callId = 'manual_search_' + Date.now();
        const log: ToolCallLog = {
          id: callId,
          name: 'webSearch',
          args: { query },
          result: data,
          status: 'completed',
          timestamp: Date.now(),
        };
        setToolLogs((prev) => [log, ...prev]);
        saveToolLogToFirestore(log);
      } catch (err) {
        console.error('REST search error:', err);
      }
    }
  };

  const handleUpdateConfig = (newCfg: Partial<BeatriceConfig>) => {
    setConfig((prev) => ({ ...prev, ...newCfg }));
  };

  return (
    <div className="w-screen h-screen bg-[#050505] text-white flex justify-center items-center overflow-hidden font-sans selection:bg-[#4facfe]/30 select-none">
      {/* App Container Frame */}
      <div className="w-full max-w-[430px] h-full sm:h-[90vh] sm:rounded-[44px] sm:border-[6px] sm:border-[#1c1c1e] bg-black flex flex-col justify-between relative sm:shadow-[0_0_60px_rgba(0,0,0,0.8),inset_0_0_0_2px_#2c2c2e] overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute top-[20%] left-[10%] right-[10%] bottom-[20%] bg-[radial-gradient(circle,rgba(168,102,53,0.15)_0%,transparent_70%)] z-0 pointer-events-none" />

        {/* Glassmorphism Header */}
        <header className="px-6 pt-6 pb-4 sm:pt-[max(24px,env(safe-area-inset-top))] flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent sticky top-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic(10);
                setIsSettingsOpen(true);
              }}
              className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-90 active:bg-white/15 cursor-pointer"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          <div className="text-center flex flex-col gap-1">
            <h1 className="text-[1.15rem] font-bold tracking-[0.2px] text-white">
              Beatrice
            </h1>
            <p className="text-[0.65rem] font-semibold tracking-[0.15em] text-[#8e8e93] uppercase">
              EBURON AI
            </p>
          </div>

          {user ? (
            <img
              src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
              alt={user.displayName || 'User Profile'}
              onClick={() => {
                triggerHaptic(10);
                setIsProfileOpen(true);
              }}
              className="w-11 h-11 rounded-full object-cover border-2 border-white/10 cursor-pointer transition-transform duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-90"
              draggable={false}
              title="View User Profile"
            />
          ) : (
            <button
              onClick={() => {
                triggerHaptic(10);
                setIsProfileOpen(true);
              }}
              className="w-11 h-11 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 flex items-center justify-center text-[#8e8e93] transition-all active:scale-90 cursor-pointer"
              aria-label="User Profile"
              title="View User Profile"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          )}
        </header>

        {/* Main AI Orb Visualization */}
        <main className="flex-1 flex flex-col justify-center items-center relative z-10 overflow-hidden px-4">
          <MobileOrb
            status={status}
            inputVolume={inputVol}
            outputVolume={outputVol}
            onInterrupt={handleInterrupt}
          />

          {status === 'disconnected' || status === 'error' ? (
            <button
              onClick={handleManualReconnect}
              className="absolute bottom-6 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#00f2fe]/20 transition-all active:scale-95 z-20 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Reconnect Beatrice
            </button>
          ) : null}
        </main>

        {/* Bottom Native Footer Controls */}
        <footer className="px-6 pb-12 pt-0 bg-gradient-to-t from-black 20% to-transparent flex items-end justify-between z-20 relative">
          {/* Chat Button */}
          <button
            onClick={() => {
              triggerHaptic(10);
              setActiveDrawer(activeDrawer === 'chat' ? 'none' : 'chat');
            }}
            className={`w-16 flex flex-col items-center gap-2 text-[#8e8e93] hover:text-white transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-90 cursor-pointer bg-transparent border-none ${
              activeDrawer === 'chat' ? 'text-white' : ''
            }`}
          >
            <MessageSquare className="w-7 h-7" strokeWidth={2} />
            <span className="text-[0.7rem] font-semibold tracking-[0.2px]">Chat</span>
          </button>

          {/* Interactive Mic Dock */}
          <div className="flex items-center gap-6 relative -top-4">
            {/* Left Equalizer */}
            <div className="flex items-center gap-1 h-6">
              {[0, 0.2, 0.4].map((delay, i) => (
                <div 
                  key={`l-${i}`} 
                  className={`w-1 rounded-full transition-all duration-300 ${!isMuted && status !== 'disconnected' ? 'bg-[#4facfe]' : 'bg-[#8e8e93]'} ${(!isMuted && (status === 'speaking' || status === 'listening' || inputVol > 0.05 || outputVol > 0.05)) ? 'animate-[eq-bounce_0.6s_infinite_ease-in-out_alternate]' : 'h-1'}`} 
                  style={{ animationDelay: `${delay}s` }} 
                />
              ))}
            </div>

            {/* Main FAB */}
            <button
              onClick={handleToggleMute}
              className={`w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#00f2fe] to-[#4facfe] flex items-center justify-center text-white shadow-[0_16px_32px_-8px_rgba(79,172,254,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] active:scale-[0.92] relative border-none cursor-pointer ${
                !isMuted && status !== 'disconnected' ? 'animate-[breathe-btn_2s_infinite_alternate]' : ''
              } ${isMuted ? 'grayscale opacity-75' : ''}`}
              aria-label="Toggle Voice Assistant"
            >
              {!isMuted && status !== 'disconnected' && (
                <div className="absolute inset-[-2px] rounded-full bg-inherit blur-[12px] opacity-80 animate-[pulse-ring_1.5s_infinite] -z-10" />
              )}
              {isMuted ? <MicOff className="w-[34px] h-[34px]" strokeWidth={2.5} /> : <Mic className="w-[34px] h-[34px]" strokeWidth={2.5} />}
            </button>

            {/* Right Equalizer */}
            <div className="flex items-center gap-1 h-6">
              {[0.1, 0.3, 0.2].map((delay, i) => (
                <div 
                  key={`r-${i}`} 
                  className={`w-1 rounded-full transition-all duration-300 ${!isMuted && status !== 'disconnected' ? 'bg-[#4facfe]' : 'bg-[#8e8e93]'} ${(!isMuted && (status === 'speaking' || status === 'listening' || inputVol > 0.05 || outputVol > 0.05)) ? 'animate-[eq-bounce_0.6s_infinite_ease-in-out_alternate]' : 'h-1'}`} 
                  style={{ animationDelay: `${delay}s` }} 
                />
              ))}
            </div>
          </div>

          <div className="flex gap-0">
            <button
              onClick={() => {
                triggerHaptic(10);
                setActiveDrawer(activeDrawer === 'video' ? 'none' : 'video');
              }}
              className={`w-14 flex flex-col items-center gap-2 text-[#8e8e93] hover:text-white transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-90 cursor-pointer bg-transparent border-none ${
                activeDrawer === 'video' ? 'text-white' : ''
              }`}
            >
              <Video className="w-6 h-6" strokeWidth={2} />
              <span className="text-[0.6rem] font-semibold tracking-[0.2px]">Video</span>
            </button>
          </div>
        </footer>

        {/* Native iOS Home Indicator */}
        <div className="home-indicator" />

        {/* Sliding Mobile Drawer Overlay */}
        {activeDrawer !== 'none' && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[30px] flex flex-col transition-all animate-in fade-in duration-300">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8e8e93]">
                {activeDrawer === 'chat'
                  ? 'Realtime Chat Transcript'
                  : activeDrawer === 'video'
                  ? 'Live Video Stream'
                  : 'Beatrice Function Tools'}
              </span>
              <button
                onClick={() => setActiveDrawer('none')}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-3">
              {activeDrawer === 'chat' && (
                <TranscriptsView
                  transcripts={transcripts}
                  onSendTextMessage={handleSendTextMessage}
                  onClearTranscripts={handleClearTranscripts}
                  isConnected={status !== 'disconnected' && status !== 'error'}
                />
              )}

              {activeDrawer === 'video' && (
                <VideoFeed
                  onStartCamera={handleStartCamera}
                  onStartScreen={handleStartScreen}
                  onStopVideo={handleStopVideo}
                  streamType={streamType}
                  fps={config.videoFps}
                />
              )}

              {activeDrawer === 'tools' && (
                <ToolsWorkbench
                  toolLogs={toolLogs}
                  sandboxRuns={sandboxRuns}
                  cliRuns={cliRuns}
                  agentTasks={agentTasks}
                  canvasData={canvasData}
                  onRunSandbox={handleRunSandbox}
                  onRunCli={handleRunCli}
                  onDeployAgent={handleDeployAgent}
                  onGetSystemInfo={handleGetSystemInfo}
                  onUpdateCanvas={handleUpdateCanvas}
                  onGetWeather={handleGetWeather}
                  onWebSearch={handleWebSearch}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleUpdateConfig}
        vadConfig={vadConfig}
        vadStatus={vadStatus}
        onSaveVadConfig={handleUpdateVadConfig}
        onOpenProfile={() => {
          setIsSettingsOpen(false);
          setIsProfileOpen(true);
        }}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        status={status}
        config={config}
        transcriptsCount={transcripts.length}
      />

      {/* Conversation Memory & Context Window Inspector Modal */}
      <MemoryInspectorModal
        isOpen={isMemoryInspectorOpen}
        onClose={() => setIsMemoryInspectorOpen(false)}
        transcripts={transcripts}
        memoryState={memoryState}
        config={contextConfig}
        onUpdateConfig={(newCfg) => setContextConfig((prev) => ({ ...prev, ...newCfg }))}
        onCompressContext={handleCompressContext}
        onClearMemory={handleClearMemory}
        isCompressing={isCompressingMemory}
      />
    </div>
  );
}

