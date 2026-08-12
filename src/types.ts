export type VoiceName = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

export type SessionStatus = 'disconnected' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error';

export interface AudioVisualizerData {
  inputVolume: number;
  outputVolume: number;
  inputFrequencies: Uint8Array;
  outputFrequencies: Uint8Array;
}

export interface AttachmentInfo {
  name: string;
  type: 'image' | 'file';
  mimeType: string;
  dataUrl?: string;
  base64?: string;
  text?: string;
}

export interface TranscriptItem {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  isPartial?: boolean;
  attachments?: AttachmentInfo[];
}

export interface ToolCallLog {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'executing' | 'completed' | 'error';
  timestamp: number;
  durationMs?: number;
}

export interface CodeSandboxRun {
  id: string;
  language: string;
  code: string;
  output: string;
  error?: string;
  timestamp: number;
}

export interface CliCommandRun {
  id: string;
  command: string;
  cwd?: string;
  output: string;
  exitCode: number;
  timestamp: number;
}

export interface AgentTask {
  id: string;
  agentName: string;
  task: string;
  status: 'idle' | 'thinking' | 'executing' | 'completed' | 'failed';
  progress: number; // 0-100
  logs: string[];
  result?: string;
  timestamp: number;
}

export interface CanvasContent {
  type: 'diagram' | 'markdown' | 'chart' | 'code_snippet';
  title: string;
  content: string; // Markdown text, mermaid graph, JSON data, or code
  updatedAt: number;
}

export interface BeatriceConfig {
  voiceName: VoiceName;
  systemInstruction: string;
  enableVideo: boolean;
  videoFps: number;
  enableSandboxTool: boolean;
  enableCliTool: boolean;
  enableAgentTool: boolean;
  enableWebSearchTool: boolean;
  enableWeatherTool: boolean;
  enableCanvasTool: boolean;
}

export type WsClientMessage =
  | { type: 'audio'; audio: string } // Base64 16kHz PCM Little Endian
  | { type: 'video'; video: string } // Base64 JPEG frame
  | { type: 'text'; text: string; attachment?: AttachmentInfo }
  | { type: 'attachment'; data: string; mimeType: string; fileName?: string; text?: string }
  | { type: 'interrupt' }
  | { type: 'config'; config: Partial<BeatriceConfig> }
  | { type: 'toolResponse'; id: string; name: string; response: unknown }
  | { type: 'runSandbox'; code: string; language: string }
  | { type: 'runCli'; command: string };

export type WsServerMessage =
  | { type: 'status'; status: SessionStatus; message?: string }
  | { type: 'audio'; audio: string } // Base64 24kHz PCM Little Endian
  | { type: 'interrupted' }
  | { type: 'turnComplete' }
  | { type: 'transcript'; role: 'user' | 'model'; text: string; isPartial?: boolean }
  | { type: 'toolCall'; id: string; name: string; args: Record<string, unknown> }
  | { type: 'toolResult'; id: string; name: string; result: unknown }
  | { type: 'sandboxOutput'; run: CodeSandboxRun }
  | { type: 'cliOutput'; run: CliCommandRun }
  | { type: 'agentUpdate'; agent: AgentTask }
  | { type: 'canvasUpdate'; canvas: CanvasContent }
  | { type: 'error'; message: string };

export interface ContextWindowConfig {
  maxContextTokens: number; // e.g. 128000
  autoPruneThreshold: number; // e.g. 0.8 (80%)
  compressionMode: 'auto_summarize' | 'sliding_window' | 'manual';
  memoryRetentionTurns: number; // e.g. 20
}

export interface ConversationMemoryState {
  totalEstimatedTokens: number;
  activeTurnsCount: number;
  compressedSummary: string;
  summaryLastUpdated?: number;
  pruneCount: number;
}
