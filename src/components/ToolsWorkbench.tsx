import React, { useState } from 'react';
import { GoogleFormsTool } from './GoogleFormsTool';
import { GmailTool } from './GmailTool';
import { ContactsTool } from './ContactsTool';
import {
  AgentTask,
  CanvasContent,
  CliCommandRun,
  CodeSandboxRun,
  ToolCallLog,
} from '../types';
import {
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  FileText,
  Folder,
  Globe,
  Layout,
  Mail,
  Play,
  Presentation,
  RotateCw,
  Table,
  Terminal,
  Users,
  Video,
  Wrench,
} from 'lucide-react';

interface ToolsWorkbenchProps {
  toolLogs: ToolCallLog[];
  sandboxRuns: CodeSandboxRun[];
  cliRuns: CliCommandRun[];
  agentTasks: AgentTask[];
  canvasData: CanvasContent | null;
  onRunSandbox: (code: string, language: string) => void;
  onRunCli: (command: string) => void;
  onDeployAgent?: (agentName: string, task: string) => void;
  onGetSystemInfo?: () => void;
  onUpdateCanvas?: (canvasType: 'diagram' | 'markdown' | 'chart' | 'code_snippet', title: string, content: string) => void;
  onGetWeather?: (location: string) => void;
  onWebSearch?: (query: string) => void;
}

export const ToolsWorkbench: React.FC<ToolsWorkbenchProps> = ({
  toolLogs,
  sandboxRuns,
  cliRuns,
  agentTasks,
  canvasData,
  onRunSandbox,
  onRunCli,
  onDeployAgent,
  onGetSystemInfo,
  onUpdateCanvas,
  onGetWeather,
  onWebSearch,
}) => {
  const [activeTab, setActiveTab] = useState<
    'tools' | 'workspace' | 'gmail' | 'contacts' | 'forms' | 'sandbox' | 'cli' | 'agents' | 'canvas'
  >('tools');

  // Google Workspace form state
  const [meetTitle, setMeetTitle] = useState<string>('Eburon AI Strategy & Google Meet Sync');
  const [meetLink, setMeetLink] = useState<string>('');
  const [gmailTo, setGmailTo] = useState<string>('team@eburon.ai');
  const [gmailSub, setGmailSub] = useState<string>('Beatrice OSS System Update');
  const [gmailBody, setGmailBody] = useState<string>('Hello,\n\nBeatrice AI Voice Assistant has integrated Google Workspace & Meet services.\n\nBest regards,\nBeatrice AI');
  const [docTitle, setDocTitle] = useState<string>('Beatrice Google Workspace Notes');
  const [docContent, setDocContent] = useState<string>('Executive Summary:\nGoogle Meet and Workspace integration active with OAuth 2.0.');

  // Custom sandbox editor states
  const [sandboxCode, setSandboxCode] = useState<string>(
    `// Beatrice OSS Interactive Code Sandbox\nfunction calculateFibonacci(n) {\n  let a = 0, b = 1;\n  const seq = [a];\n  for (let i = 1; i < n; i++) {\n    seq.push(b);\n    let temp = a + b;\n    a = b;\n    b = temp;\n  }\n  return seq;\n}\n\nconsole.log("Fibonacci Sequence:", calculateFibonacci(10));`
  );
  const [sandboxLang, setSandboxLang] = useState<string>('javascript');

  // Custom CLI command state
  const [cliCmd, setCliCmd] = useState<string>('git status');

  // Agent Form State
  const [customAgentName, setCustomAgentName] = useState<string>('Code Auditor');
  const [customAgentTask, setCustomAgentTask] = useState<string>('Inspect backend endpoints and verify system health.');

  // Canvas Form State
  const [customCanvasTitle, setCustomCanvasTitle] = useState<string>('Beatrice OSS System Architecture');
  const [customCanvasType, setCustomCanvasType] = useState<'diagram' | 'markdown' | 'chart' | 'code_snippet'>('diagram');
  const [customCanvasContent, setCustomCanvasContent] = useState<string>('graph TD;\n A[User Voice/Video Feed] -->|WebSocket| B[Beatrice Express Server];\n B -->|Live Audio Stream| C[Eburon Live];\n B -->|Function Calls| D[Sandbox / Terminal / Tools];\n B -->|Sync Logs| E[Cloud Firestore];');

  // Search/Weather Quick States
  const [searchQuery, setSearchQuery] = useState<string>('Eburon Live API features');
  const [weatherLocation, setWeatherLocation] = useState<string>('San Francisco');

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c]/80 backdrop-blur-2xl rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
      {/* Workbench Header Tabs */}
      <div className="flex items-center gap-2 p-3 bg-black/60 border-b border-white/10 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
            activeTab === 'tools'
              ? 'bg-[#00f2fe]/15 text-[#00f2fe] border-[#00f2fe]/40 shadow-sm shadow-[#00f2fe]/20'
              : 'text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Function Calls</span>
          {toolLogs.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/30 text-[10px] text-cyan-200 font-bold">
              {toolLogs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
            activeTab === 'workspace'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Workspace & Meet</span>
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
            activeTab === 'gmail'
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              : 'text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gmail</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
            activeTab === 'contacts'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
            activeTab === 'forms'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          <span>Google Forms</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
            activeTab === 'sandbox'
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              : 'text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code Sandbox</span>
          {sandboxRuns.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-[10px] text-indigo-200 font-bold">
              {sandboxRuns.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cli')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
            activeTab === 'cli'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Terminal CLI</span>
          {cliRuns.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-[10px] text-emerald-200 font-bold">
              {cliRuns.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
            activeTab === 'agents'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Sub-Agents</span>
          {agentTasks.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-[10px] text-purple-200 font-bold">
              {agentTasks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
            activeTab === 'canvas'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'text-zinc-400 hover:text-white border-transparent hover:bg-white/5'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Canvas View</span>
          {canvasData && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 p-5 overflow-y-auto font-sans scrollbar-hide">
        {/* TAB 1: FUNCTION CALL STREAM */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/10">
              <span className="font-semibold text-white">Live Tool Invocations</span>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">EBURON FUNCTION CALLING ENGINE</span>
            </div>

            {/* Quick Manual Tool Execution Toolbar */}
            <div className="p-4 rounded-2xl bg-[#121215] border border-white/10 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block font-mono">
                Quick Manual Tool Triggers:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onGetSystemInfo?.()}
                  className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-2 text-xs font-medium transition-all cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#00f2fe]" />
                  <span>Get System Info</span>
                </button>

                <button
                  onClick={() => onGetWeather?.(weatherLocation)}
                  className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-2 text-xs font-medium transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Get Weather</span>
                </button>

                <button
                  onClick={() => onWebSearch?.(searchQuery)}
                  className="px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-2 text-xs font-medium transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live Web Search</span>
                </button>

                <button
                  onClick={() => onUpdateCanvas?.('diagram', 'Architecture Flow', 'graph TD;\n A[Voice Feed] --> B[Eburon Live];\n B --> C[Function Tools];')}
                  className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-2 text-xs font-medium transition-all cursor-pointer"
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Update Canvas</span>
                </button>
              </div>
            </div>

            {toolLogs.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-zinc-500">
                <Wrench className="w-8 h-8 text-zinc-600 mb-2" />
                <p className="text-xs font-semibold text-zinc-300">No Tool Invocations Yet</p>
                <p className="text-[11px] text-zinc-500 max-w-xs mt-1 leading-relaxed">
                  Ask Beatrice to execute code, run shell commands, deploy an agent, or search the web — or use the trigger buttons above!
                </p>
              </div>
            ) : (
              toolLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#121215] rounded-2xl border border-white/10 p-4 text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00f2fe]/10 text-[#00f2fe] font-mono font-bold text-[11px] border border-[#00f2fe]/30">
                        {log.name}
                      </span>
                      <span className="text-zinc-500 text-[10px] font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        log.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : log.status === 'executing'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  {/* Arguments */}
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold font-mono tracking-wider">Arguments Payload:</span>
                    <pre className="mt-1 p-3 rounded-xl bg-black border border-white/10 text-[11px] text-zinc-300 font-mono overflow-x-auto">
                      {JSON.stringify(log.args, null, 2)}
                    </pre>
                  </div>

                  {/* Result */}
                  {log.result !== undefined && (
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold font-mono tracking-wider">Execution Output:</span>
                      <pre className="mt-1 p-3 rounded-xl bg-black/90 border border-white/10 text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-36">
                        {typeof log.result === 'object' ? JSON.stringify(log.result, null, 2) : String(log.result)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: GOOGLE WORKSPACE & MEET */}
        {activeTab === 'workspace' && (
          <div className="space-y-4 text-xs">
            {/* Google Meet Primary Card */}
            <div className="p-5 rounded-2xl bg-[#121215] border border-white/10 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Google Meet Conference Hub</h3>
                    <p className="text-[10px] text-zinc-400">Create & launch Google Meet video spaces</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-semibold border border-emerald-500/30">
                  OAuth Active
                </span>
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-medium text-zinc-300">Meeting Topic / Summary:</label>
                <input
                  type="text"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-[#00f2fe]/60"
                  placeholder="e.g. Beatrice AI Voice Strategy Session"
                />

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const link = `https://meet.google.com/btr-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
                      setMeetLink(link);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer text-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Create Google Meet Space</span>
                  </button>
                </div>

                {meetLink && (
                  <div className="mt-2 p-3.5 rounded-2xl bg-black border border-emerald-500/40 space-y-2.5 animate-fade-in">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider font-mono block">
                      ✓ Google Meet Room Generated:
                    </span>
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2.5 rounded-xl bg-[#121215] border border-white/10 text-cyan-300 font-mono text-[11px] truncate hover:underline"
                    >
                      {meetLink}
                    </a>
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Join Google Meet Call Now</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Gmail & Drive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Gmail Dispatcher */}
              <div className="p-4 rounded-2xl bg-[#121215] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-[11px]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Gmail Dispatcher</span>
                </div>
                <input
                  type="text"
                  value={gmailTo}
                  onChange={(e) => setGmailTo(e.target.value)}
                  placeholder="Recipient email"
                  className="w-full px-3 py-1.5 rounded-xl bg-black border border-white/10 text-white text-[11px] focus:outline-none"
                />
                <input
                  type="text"
                  value={gmailSub}
                  onChange={(e) => setGmailSub(e.target.value)}
                  placeholder="Subject line"
                  className="w-full px-3 py-1.5 rounded-xl bg-black border border-white/10 text-white text-[11px] focus:outline-none"
                />
                <textarea
                  value={gmailBody}
                  onChange={(e) => setGmailBody(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-xl bg-black border border-white/10 text-white text-[11px] focus:outline-none resize-none"
                />
                <button
                  onClick={() => setActiveTab('gmail')}
                  className="w-full py-2 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Open Gmail Manager</span>
                </button>
              </div>

              {/* Drive & Docs */}
              <div className="p-4 rounded-2xl bg-[#121215] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-[11px]">
                  <Folder className="w-3.5 h-3.5" />
                  <span>Drive Docs & Sheets</span>
                </div>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Document title"
                  className="w-full px-3 py-1.5 rounded-xl bg-black border border-white/10 text-white text-[11px] focus:outline-none"
                />
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <button
                    onClick={() => alert(`Created Google Doc "${docTitle}"`)}
                    className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 flex flex-col items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Doc</span>
                  </button>
                  <button
                    onClick={() => alert(`Created Google Sheet "${docTitle}"`)}
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex flex-col items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Sheet</span>
                  </button>
                  <button
                    onClick={() => alert(`Created Google Slide "${docTitle}"`)}
                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex flex-col items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Slide</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('forms')}
                    className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 flex flex-col items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    <span>Form</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: GMAIL */}
        {activeTab === 'gmail' && (
          <div className="p-1">
            <GmailTool />
          </div>
        )}

        {/* TAB: CONTACTS */}
        {activeTab === 'contacts' && (
          <div className="p-1">
            <ContactsTool />
          </div>
        )}

        {/* TAB: GOOGLE FORMS */}
        {activeTab === 'forms' && (
          <div className="p-1">
            <GoogleFormsTool />
          </div>
        )}

        {/* TAB 2: CODE SANDBOX */}
        {activeTab === 'sandbox' && (
          <div className="space-y-4">
            {/* Editor Input Controls */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#00f2fe]" />
                  Code Sandbox Execution Engine
                </label>
                <select
                  value={sandboxLang}
                  onChange={(e) => setSandboxLang(e.target.value)}
                  className="bg-black border border-white/10 text-xs text-cyan-300 rounded-xl px-3 py-1 focus:outline-none"
                >
                  <option value="javascript">JavaScript (Node VM)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python 3</option>
                  <option value="html">HTML Widget</option>
                </select>
              </div>

              <textarea
                value={sandboxCode}
                onChange={(e) => setSandboxCode(e.target.value)}
                rows={6}
                className="w-full bg-black border border-white/10 focus:border-[#00f2fe]/60 rounded-2xl p-4 font-mono text-xs text-zinc-200 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex justify-end">
                <button
                  onClick={() => onRunSandbox(sandboxCode, sandboxLang)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Execute Sandbox Code
                </button>
              </div>
            </div>

            {/* Sandbox History Runs */}
            <div className="space-y-2.5 pt-3 border-t border-white/10">
              <h4 className="text-xs font-semibold text-zinc-400">Sandbox Output Log</h4>
              {sandboxRuns.length === 0 ? (
                <div className="p-5 rounded-2xl bg-[#121215] border border-white/10 text-xs text-zinc-500 text-center">
                  No code runs executed yet. Write code above or ask Beatrice to solve a problem.
                </div>
              ) : (
                sandboxRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-4 bg-[#121215] rounded-2xl border border-white/10 font-mono text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="text-[#00f2fe] font-semibold">{run.language.toUpperCase()}</span>
                      <span className="text-zinc-500">{new Date(run.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <pre className="p-3 rounded-xl bg-black border border-white/10 text-zinc-200 text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap">
                      {run.output}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TERMINAL CLI */}
        {activeTab === 'cli' && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Workspace Terminal CLI
              </label>

              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-black border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-mono">
                  <span className="text-emerald-400 font-bold mr-2">$</span>
                  <input
                    type="text"
                    value={cliCmd}
                    onChange={(e) => setCliCmd(e.target.value)}
                    placeholder="e.g. ls -la, python3 --version, git status..."
                    className="flex-1 bg-transparent text-white focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onRunCli(cliCmd);
                    }}
                  />
                </div>
                <button
                  onClick={() => onRunCli(cliCmd)}
                  className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shrink-0 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Run
                </button>
              </div>
            </div>

            {/* CLI Execution Output Stream */}
            <div className="space-y-2.5 pt-3 border-t border-white/10">
              <h4 className="text-xs font-semibold text-zinc-400">CLI Command Logs</h4>
              {cliRuns.length === 0 ? (
                <div className="p-5 rounded-2xl bg-[#121215] border border-white/10 text-xs text-zinc-500 text-center font-mono">
                  No CLI commands executed yet.
                </div>
              ) : (
                cliRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-4 bg-[#121215] rounded-2xl border border-white/10 font-mono text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-zinc-300 border-b border-white/10 pb-2">
                      <span className="text-emerald-400 font-bold">$ {run.command}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          run.exitCode === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        Exit Code: {run.exitCode}
                      </span>
                    </div>
                    <pre className="p-3 rounded-xl bg-black border border-white/10 text-zinc-200 text-[11px] overflow-x-auto whitespace-pre-wrap max-h-40">
                      {run.output}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SUB-AGENTS */}
        {activeTab === 'agents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/10">
              <span className="font-semibold text-white">Beatrice Agent Framework</span>
              <span className="font-mono text-[10px] text-purple-400 uppercase tracking-widest">AUTONOMOUS MULTI-AGENT WORKERS</span>
            </div>

            {/* Dispatch Custom Sub-Agent Form */}
            <div className="p-4 bg-[#121215] rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
                <span className="flex items-center gap-1.5"><Bot className="w-4 h-4 text-purple-400" /> Dispatch Autonomous Sub-Agent</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <input
                  type="text"
                  value={customAgentName}
                  onChange={(e) => setCustomAgentName(e.target.value)}
                  placeholder="Agent Name (e.g. Code Reviewer, Vision Inspector)"
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500/50"
                />
                <textarea
                  value={customAgentTask}
                  onChange={(e) => setCustomAgentTask(e.target.value)}
                  rows={2}
                  placeholder="Task prompt..."
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 resize-none font-mono text-[11px]"
                />
                <button
                  onClick={() => onDeployAgent?.(customAgentName, customAgentTask)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Deploy Sub-Agent
                </button>
              </div>
            </div>

            {agentTasks.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-zinc-500">
                <Bot className="w-8 h-8 text-purple-500/40 mb-2" />
                <p className="text-xs font-semibold text-zinc-300">No Sub-Agents Dispatched</p>
                <p className="text-[11px] text-zinc-500 max-w-xs mt-1 leading-relaxed">
                  Ask Beatrice to deploy a Code Reviewer, Vision Agent, or Research Agent — or deploy one above!
                </p>
              </div>
            ) : (
              agentTasks.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 bg-[#121215] rounded-2xl border border-white/10 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span className="font-bold text-white">{agent.agentName}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        agent.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-zinc-300 text-[11px] bg-black p-3 rounded-xl border border-white/10 font-sans">
                    <strong className="text-zinc-400">Task:</strong> {agent.task}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-black h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>

                  {/* Agent Output Result */}
                  {agent.result && (
                    <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-200 text-[11px] leading-relaxed whitespace-pre-wrap">
                      <div className="font-semibold text-purple-300 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        Agent Findings:
                      </div>
                      {agent.result}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: CANVAS VIEW */}
        {activeTab === 'canvas' && (
          <div className="space-y-4">
            {/* Custom Canvas Renderer Form */}
            <div className="p-4 bg-[#121215] rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                <span className="flex items-center gap-1.5"><Layout className="w-4 h-4 text-amber-400" /> Render Visual to Canvas</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customCanvasTitle}
                    onChange={(e) => setCustomCanvasTitle(e.target.value)}
                    placeholder="Canvas Title"
                    className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <select
                    value={customCanvasType}
                    onChange={(e) => setCustomCanvasType(e.target.value as any)}
                    className="bg-black border border-white/10 rounded-xl px-3 py-2 text-amber-300 focus:outline-none"
                  >
                    <option value="diagram">Diagram (Mermaid)</option>
                    <option value="markdown">Markdown Document</option>
                    <option value="chart">Chart Data</option>
                    <option value="code_snippet">Code Snippet</option>
                  </select>
                </div>
                <textarea
                  value={customCanvasContent}
                  onChange={(e) => setCustomCanvasContent(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 resize-none font-mono text-[11px]"
                />
                <button
                  onClick={() => onUpdateCanvas?.(customCanvasType, customCanvasTitle, customCanvasContent)}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-600/20"
                >
                  <Layout className="w-3.5 h-3.5" /> Render Visual
                </button>
              </div>
            </div>

            {!canvasData ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-zinc-500">
                <Layout className="w-8 h-8 text-amber-500/40 mb-2" />
                <p className="text-xs font-semibold text-zinc-300">Canvas Empty</p>
                <p className="text-[11px] text-zinc-500 max-w-xs mt-1 leading-relaxed">
                  Ask Beatrice to render a diagram, chart, or markdown document — or render one using the form above.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-[#121215] rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-amber-400" />
                    {canvasData.title}
                  </h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                    {canvasData.type.toUpperCase()}
                  </span>
                </div>

                <div className="bg-black p-4 rounded-xl border border-white/10 text-xs text-zinc-200 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {canvasData.content}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
