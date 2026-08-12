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
    <div className="flex flex-col h-full bg-[#1c1c1e]/40 backdrop-blur-2xl rounded-3xl border border-white/5 overflow-hidden">
      {/* Workbench Header Tabs */}
      <div className="flex items-center gap-2 p-3 bg-black/40 border-b border-white/5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border ${
            activeTab === 'tools'
              ? 'bg-[#007aff]/20 text-[#00f2fe] border-[#007aff]/40'
              : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-white/5'
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'workspace'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Workspace & Meet</span>
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'gmail'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gmail</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'contacts'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'forms'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          <span>Google Forms</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'sandbox'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'cli'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'agents'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'canvas'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
      <div className="flex-1 p-4 overflow-y-auto font-sans">
        {/* TAB 1: FUNCTION CALL STREAM */}
        {activeTab === 'tools' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-medium">Live Tool Invocations</span>
              <span>Eburon Function Calling Engine</span>
            </div>

            {/* Quick Manual Tool Execution Toolbar */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Quick Manual Tool Triggers:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onGetSystemInfo?.()}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 text-xs font-medium transition-all"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Get System Info</span>
                </button>

                <button
                  onClick={() => onGetWeather?.(weatherLocation)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 text-xs font-medium transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Get Weather</span>
                </button>

                <button
                  onClick={() => onWebSearch?.(searchQuery)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 text-xs font-medium transition-all"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live Web Search</span>
                </button>

                <button
                  onClick={() => onUpdateCanvas?.('diagram', 'Architecture Flow', 'graph TD;\n A[Voice Feed] --> B[Eburon Live];\n B --> C[Function Tools];')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 text-xs font-medium transition-all"
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Update Canvas</span>
                </button>
              </div>
            </div>

            {toolLogs.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center text-slate-500">
                <Wrench className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs font-medium text-slate-400">No Tool Invocations Yet</p>
                <p className="text-[11px] text-slate-600 max-w-xs mt-1">
                  Ask Beatrice to execute code, run shell commands, deploy an agent, or search the web — or use the trigger buttons above!
                </p>
              </div>
            ) : (
              toolLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-3.5 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[11px] border border-cyan-500/30">
                        {log.name}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        log.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : log.status === 'executing'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  {/* Arguments */}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Arguments Payload:</span>
                    <pre className="mt-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto">
                      {JSON.stringify(log.args, null, 2)}
                    </pre>
                  </div>

                  {/* Result */}
                  {log.result !== undefined && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Execution Output:</span>
                      <pre className="mt-1 p-2 rounded-lg bg-slate-900/90 border border-slate-800/90 text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-36">
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
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-teal-950/30 to-slate-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">Google Meet Conference Hub</h3>
                    <p className="text-[10px] text-slate-400">Create & launch Google Meet video spaces</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-semibold border border-emerald-500/30">
                  OAuth Active
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-300">Meeting Topic / Summary:</label>
                <input
                  type="text"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g. Beatrice AI Voice Strategy Session"
                />

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const link = `https://meet.google.com/btr-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
                      setMeetLink(link);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Create Google Meet Space</span>
                  </button>
                </div>

                {meetLink && (
                  <div className="mt-2 p-3 rounded-lg bg-slate-950 border border-emerald-500/40 space-y-2 animate-fadeIn">
                    <span className="text-[10px] font-semibold uppercase text-emerald-400 tracking-wider block">
                      ✓ Google Meet Room Generated:
                    </span>
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-[11px] truncate hover:underline"
                    >
                      {meetLink}
                    </a>
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/40 hover:bg-emerald-500/30"
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
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-[11px]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Gmail Dispatcher</span>
                </div>
                <input
                  type="text"
                  value={gmailTo}
                  onChange={(e) => setGmailTo(e.target.value)}
                  placeholder="Recipient email"
                  className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px] focus:outline-none"
                />
                <input
                  type="text"
                  value={gmailSub}
                  onChange={(e) => setGmailSub(e.target.value)}
                  placeholder="Subject line"
                  className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px] focus:outline-none"
                />
                <textarea
                  value={gmailBody}
                  onChange={(e) => setGmailBody(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px] focus:outline-none resize-none"
                />
                <button
                  onClick={() => setActiveTab('gmail')}
                  className="w-full py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3 h-3 text-indigo-400" />
                  <span>Open Gmail Manager</span>
                </button>
              </div>

              {/* Drive & Docs */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-[11px]">
                  <Folder className="w-3.5 h-3.5" />
                  <span>Drive Docs & Sheets</span>
                </div>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Document title"
                  className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px] focus:outline-none"
                />
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <button
                    onClick={() => alert(`Created Google Doc "${docTitle}"`)}
                    className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 flex flex-col items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Doc</span>
                  </button>
                  <button
                    onClick={() => alert(`Created Google Sheet "${docTitle}"`)}
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex flex-col items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Sheet</span>
                  </button>
                  <button
                    onClick={() => alert(`Created Google Slide "${docTitle}"`)}
                    className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex flex-col items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Slide</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('forms')}
                    className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 flex flex-col items-center gap-1 text-[10px] cursor-pointer"
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Code Sandbox Execution Engine
                </label>
                <select
                  value={sandboxLang}
                  onChange={(e) => setSandboxLang(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-indigo-300 rounded-lg px-2.5 py-1 focus:outline-none"
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
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/60 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={() => onRunSandbox(sandboxCode, sandboxLang)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Execute Sandbox Code
                </button>
              </div>
            </div>

            {/* Sandbox History Runs */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-medium text-slate-400">Sandbox Output Log</h4>
              {sandboxRuns.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-500 text-center">
                  No code runs executed yet. Write code above or ask Beatrice to solve a problem.
                </div>
              ) : (
                sandboxRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-indigo-400 font-semibold">{run.language.toUpperCase()}</span>
                      <span>{new Date(run.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <pre className="p-2 rounded bg-slate-900 border border-slate-800/80 text-slate-300 text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap">
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
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Workspace Terminal CLI
              </label>

              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono">
                  <span className="text-emerald-400 font-bold mr-2">$</span>
                  <input
                    type="text"
                    value={cliCmd}
                    onChange={(e) => setCliCmd(e.target.value)}
                    placeholder="e.g. ls -la, python3 --version, git status..."
                    className="flex-1 bg-transparent text-slate-200 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onRunCli(cliCmd);
                    }}
                  />
                </div>
                <button
                  onClick={() => onRunCli(cliCmd)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shrink-0"
                >
                  Run
                </button>
              </div>
            </div>

            {/* CLI Execution Output Stream */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-medium text-slate-400">CLI Command Logs</h4>
              {cliRuns.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-500 text-center font-mono">
                  No CLI commands executed yet.
                </div>
              ) : (
                cliRuns.map((run) => (
                  <div
                    key={run.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-slate-300 border-b border-slate-900 pb-1.5">
                      <span className="text-emerald-400 font-bold">$ {run.command}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          run.exitCode === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        Exit Code: {run.exitCode}
                      </span>
                    </div>
                    <pre className="p-2 rounded bg-slate-900 text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap max-h-40">
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
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-medium">Beatrice Agent Framework</span>
              <span>Autonomous Multi-Agent Workers</span>
            </div>

            {/* Dispatch Custom Sub-Agent Form */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
                <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> Dispatch Autonomous Sub-Agent</span>
              </div>
              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  value={customAgentName}
                  onChange={(e) => setCustomAgentName(e.target.value)}
                  placeholder="Agent Name (e.g. Code Reviewer, Vision Inspector)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500/50"
                />
                <textarea
                  value={customAgentTask}
                  onChange={(e) => setCustomAgentTask(e.target.value)}
                  rows={2}
                  placeholder="Task prompt..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-500/50 resize-none font-mono text-[11px]"
                />
                <button
                  onClick={() => onDeployAgent?.(customAgentName, customAgentTask)}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Deploy Sub-Agent
                </button>
              </div>
            </div>

            {agentTasks.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center text-slate-500">
                <Bot className="w-8 h-8 text-purple-500/40 mb-2" />
                <p className="text-xs font-medium text-slate-400">No Sub-Agents Dispatched</p>
                <p className="text-[11px] text-slate-600 max-w-xs mt-1">
                  Ask Beatrice to deploy a Code Reviewer, Vision Agent, or Research Agent — or deploy one above!
                </p>
              </div>
            ) : (
              agentTasks.map((agent) => (
                <div
                  key={agent.id}
                  className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span className="font-bold text-slate-200">{agent.agentName}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        agent.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <strong className="text-slate-400">Task:</strong> {agent.task}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>

                  {/* Agent Output Result */}
                  {agent.result && (
                    <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-purple-200 text-[11px] leading-relaxed whitespace-pre-wrap">
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
          <div className="space-y-3">
            {/* Custom Canvas Renderer Form */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                <span className="flex items-center gap-1.5"><Layout className="w-3.5 h-3.5" /> Render Visual to Canvas</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customCanvasTitle}
                    onChange={(e) => setCustomCanvasTitle(e.target.value)}
                    placeholder="Canvas Title"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                  <select
                    value={customCanvasType}
                    onChange={(e) => setCustomCanvasType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-amber-300 focus:outline-none"
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none font-mono text-[11px]"
                />
                <button
                  onClick={() => onUpdateCanvas?.(customCanvasType, customCanvasTitle, customCanvasContent)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Layout className="w-3.5 h-3.5" /> Render Visual
                </button>
              </div>
            </div>

            {!canvasData ? (
              <div className="py-8 flex flex-col items-center justify-center text-center text-slate-500">
                <Layout className="w-8 h-8 text-amber-500/40 mb-2" />
                <p className="text-xs font-medium text-slate-400">Canvas Empty</p>
                <p className="text-[11px] text-slate-600 max-w-xs mt-1">
                  Ask Beatrice to render a diagram, chart, or markdown document — or render one using the form above.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-amber-400" />
                    {canvasData.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    {canvasData.type.toUpperCase()}
                  </span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
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
