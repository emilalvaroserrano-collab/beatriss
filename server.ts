import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { WebSocket, WebSocketServer } from 'ws';
import {
  handleDeployAgentTask,
  handleExecuteCodeSandbox,
  handleGetSystemInfo,
  handleGetWeather,
  handleRunCliCommand,
  handleUpdateCanvasVisual,
  handleWebSearch,
} from './server/tools.js';
import {
  handleCreateGoogleMeet,
  handleListGmailMessages,
  handleSendGmailMessage,
  handleListCalendarEvents,
  handleCreateCalendarEvent,
  handleListDriveFiles,
  handleCreateGoogleDoc,
  handleCreateGoogleSheet,
  handleCreateGoogleSlide,
  handleCreateGoogleForm,
  handleListGoogleForms,
  handleListGoogleTasks,
  handleCreateGoogleTask,
  handleListGoogleContacts,
} from './server/googleWorkspace.js';

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('⚠️ GEMINI_API_KEY is not configured or using placeholder value.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getFunctionDeclarations() {
  return [
    {
      functionDeclarations: [
        {
          name: 'executeCodeSandbox',
          description:
            'Executes code in an isolated JavaScript/Python/TypeScript sandbox. Use this when asked to write, test, debug, or evaluate code, formulas, algorithms, or visual HTML components.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING, description: 'The source code string to execute' },
              language: { type: Type.STRING, description: 'Language: javascript, typescript, python, html' },
              description: { type: Type.STRING, description: 'Short summary of the task' },
            },
            required: ['code', 'language'],
          },
        },
        {
          name: 'runCliCommand',
          description:
            'Executes shell/CLI terminal commands (e.g. ls, git status, node -v, python3 -c, curl, grep, npm test).',
          parameters: {
            type: Type.OBJECT,
            properties: {
              command: { type: Type.STRING, description: 'The CLI shell command line to run' },
              cwd: { type: Type.STRING, description: 'Optional relative directory path' },
            },
            required: ['command'],
          },
        },
        {
          name: 'deployAgentTask',
          description:
            'Spawns an autonomous sub-agent (e.g., Code Reviewer, Vision Inspector, Data Analyst, Web Research Agent) to execute complex multi-step reasoning tasks.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              agentName: { type: Type.STRING, description: 'Name or role of sub-agent' },
              task: { type: Type.STRING, description: 'Detailed instruction prompt' },
            },
            required: ['agentName', 'task'],
          },
        },
        {
          name: 'getSystemInfo',
          description:
            'Gets system environment information, node version, memory stats, uptime, and active process metrics.',
          parameters: {
            type: Type.OBJECT,
            properties: {},
          },
        },
        {
          name: 'updateCanvasVisual',
          description:
            'Renders or updates interactive visual content on the Beatrice canvas screen (diagrams, markdown reports, interactive charts, code cards).',
          parameters: {
            type: Type.OBJECT,
            properties: {
              canvasType: { type: Type.STRING, description: 'One of: diagram, markdown, chart, code_snippet' },
              title: { type: Type.STRING, description: 'Card title' },
              content: { type: Type.STRING, description: 'Mermaid graph, markdown text, json data, or code' },
            },
            required: ['canvasType', 'title', 'content'],
          },
        },
        {
          name: 'getWeather',
          description: 'Gets current weather and forecast for any location.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.STRING, description: 'City name or region' },
            },
            required: ['location'],
          },
        },
        {
          name: 'webSearch',
          description: 'Performs live web search for documentation, news, facts, or technical references.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING, description: 'Search term' },
            },
            required: ['query'],
          },
        },
        {
          name: 'createGoogleMeet',
          description: 'Creates a Google Meet video conference link / meeting space with summary and scheduled start time.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: 'Meeting title or topic' },
              startTime: { type: Type.STRING, description: 'ISO date time or relative time' },
              description: { type: Type.STRING, description: 'Meeting agenda or details' },
            },
            required: ['summary'],
          },
        },
        {
          name: 'listGmailMessages',
          description: 'Lists or searches emails in Gmail inbox.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING, description: 'Search filter or query string' },
            },
          },
        },
        {
          name: 'sendGmailMessage',
          description: 'Sends an email via Gmail.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              to: { type: Type.STRING, description: 'Recipient email address' },
              subject: { type: Type.STRING, description: 'Email subject line' },
              body: { type: Type.STRING, description: 'Email content body' },
            },
            required: ['to', 'subject', 'body'],
          },
        },
        {
          name: 'listCalendarEvents',
          description: 'Lists upcoming Google Calendar events and schedules.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              timeMin: { type: Type.STRING, description: 'Start time filter ISO string' },
            },
          },
        },
        {
          name: 'createCalendarEvent',
          description: 'Schedules a new event on Google Calendar with optional Google Meet link.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: 'Event title' },
              startTime: { type: Type.STRING, description: 'Event start time' },
              durationMinutes: { type: Type.NUMBER, description: 'Duration in minutes' },
              addGoogleMeet: { type: Type.BOOLEAN, description: 'Whether to attach a Google Meet link' },
            },
            required: ['summary', 'startTime'],
          },
        },
        {
          name: 'listDriveFiles',
          description: 'Lists or searches files in Google Drive (Google Docs, Google Sheets, Google Slides, etc.).',
          parameters: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING, description: 'File name search query' },
            },
          },
        },
        {
          name: 'createGoogleDoc',
          description: 'Creates a new Google Doc document.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Document title' },
              content: { type: Type.STRING, description: 'Initial text content' },
            },
            required: ['title', 'content'],
          },
        },
        {
          name: 'createGoogleSheet',
          description: 'Creates a new Google Sheet spreadsheet.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Spreadsheet title' },
              headers: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Column header titles' },
            },
            required: ['title'],
          },
        },
        {
          name: 'createGoogleSlide',
          description: 'Creates a new Google Slide presentation.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Presentation title' },
              slideTitles: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Titles for initial slides' },
            },
            required: ['title'],
          },
        },
        {
          name: 'createGoogleForm',
          description: 'Creates a new Google Form.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Form title' },
              description: { type: Type.STRING, description: 'Form description' },
            },
            required: ['title'],
          },
        },
        {
          name: 'listGoogleForms',
          description: 'Lists Google Forms.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING, description: 'Optional search query' },
            },
          },
        },
        {
          name: 'listGoogleTasks',
          description: 'Lists Google Tasks.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              tasklist: { type: Type.STRING, description: 'Optional tasklist ID' },
            },
          },
        },
        {
          name: 'createGoogleTask',
          description: 'Creates a new Google Task.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Task title' },
              notes: { type: Type.STRING, description: 'Task notes' },
              due: { type: Type.STRING, description: 'Due date ISO string' },
            },
            required: ['title'],
          },
        },
        {
          name: 'listGoogleContacts',
          description: 'Lists or searches Google Contacts.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING, description: 'Search query for contacts' },
            },
          },
        },
      ],
    },
  ];
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      if (url.pathname === '/live' || url.pathname === '/live/') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch (err) {
      console.error('Error handling upgrade:', err);
    }
  });

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'Beatrice OSS',
      liveModel: 'gemini-3.1-flash-live-preview',
      apiKeyConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    });
  });

  app.post('/api/tools/execute-code', async (req, res) => {
    try {
      const { code, language, description } = req.body;
      const ai = getGeminiClient();
      const result = await handleExecuteCodeSandbox({ code, language, description }, {
        ai: ai || undefined,
        broadcast: () => {},
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tools/cli', async (req, res) => {
    try {
      const { command, cwd } = req.body;
      const result = await handleRunCliCommand({ command, cwd }, { broadcast: () => {} });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tools/agent', async (req, res) => {
    try {
      const { agentName, task } = req.body;
      const ai = getGeminiClient();
      const result = await handleDeployAgentTask(
        { agentName: agentName || 'Assistant Agent', task },
        { ai: ai || undefined, broadcast: () => {} }
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/workspace/gmail/messages', async (req, res) => {
    try {
      const query = (req.query.q as string) || 'in:inbox';
      const result = await handleListGmailMessages({ query }, { broadcast: () => {} });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/workspace/contacts', async (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      const result = await handleListGoogleContacts({ query }, { broadcast: () => {} });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/workspace/gmail/send', async (req, res) => {
    try {
      const { to, subject, body } = req.body;
      const result = await handleSendGmailMessage({ to, subject, body }, { broadcast: () => {} });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/workspace/forms/create', async (req, res) => {
    try {
      const { title, description, questions } = req.body;
      const result = await handleCreateGoogleForm(
        { title, description, questions },
        { broadcast: () => {} }
      );
      res.json({
        success: true,
        form: {
          id: result.formId,
          title: result.title,
          description: result.description,
          webViewLink: result.webViewLink,
          questions: result.questions,
          responsesCount: 0,
          createdAt: result.timestamp,
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/workspace/forms/list', async (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      const result = await handleListGoogleForms({ query }, { broadcast: () => {} });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tools/canvas', async (req, res) => {
    try {
      const { canvasType, title, content } = req.body;
      const result = await handleUpdateCanvasVisual(
        { canvasType, title, content },
        { broadcast: () => {} }
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tools/weather', async (req, res) => {
    try {
      const { location } = req.body;
      const result = await handleGetWeather({ location });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tools/search', async (req, res) => {
    try {
      const { query } = req.body;
      const ai = getGeminiClient();
      const result = await handleWebSearch(
        { query },
        { ai: ai || undefined, broadcast: () => {} }
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // WebSocket Live Connection Handler
  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('Client connected to Beatrice OSS WebSocket live endpoint.');

    const ai = getGeminiClient();
    if (!ai) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message:
            'Eburon API Key is missing or invalid. Please configure your API key in the Settings > Secrets panel.',
        })
      );
      clientWs.send(JSON.stringify({ type: 'status', status: 'error' }));
      return;
    }

    let liveSession: any = null;
    let isConnected = false;

    const broadcastToClient = (msg: unknown) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(msg));
      }
    };

    clientWs.send(JSON.stringify({ type: 'status', status: 'connecting' }));

    const defaultVoice = 'Zephyr';
    let defaultInstruction = `You are Beatrice OSS, an advanced open-source AI voice & video assistant built with Eburon Live API.
You communicate naturally with human voice in real time, inspecting live video streams from the user's camera or screen.
You have native access to function calling tools:
1. executeCodeSandbox: Run JavaScript, Python, TypeScript, and HTML code.
2. runCliCommand: Execute terminal shell commands.
3. deployAgentTask: Spawn autonomous sub-agents for multi-step reasoning.
4. getSystemInfo: Inspect host system stats and latency.
5. updateCanvasVisual: Render diagrams, markdown, or charts on the user's visual canvas.
6. getWeather & webSearch: Lookup weather and real-time web info.

When asked to run code, run shell commands, or perform analysis on what you see in the video feed, use your function calling tools proactively and describe your actions concisely in voice!`;

    try {
      const promptPath = path.join(process.cwd(), 'system_prompt.md');
      if (fs.existsSync(promptPath)) {
        defaultInstruction += '\n\n' + fs.readFileSync(promptPath, 'utf8');
      }
    } catch (err) {
      console.error('Failed to load extended system prompt:', err);
    }

    try {
      liveSession = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: defaultVoice } },
          },
          systemInstruction: defaultInstruction,
          tools: getFunctionDeclarations(),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onmessage: async (message: LiveServerMessage) => {
            // 1. Audio parts
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  broadcastToClient({ type: 'audio', audio: part.inlineData.data });
                  broadcastToClient({ type: 'status', status: 'speaking' });
                }
                if (part.text) {
                  broadcastToClient({
                    type: 'transcript',
                    role: 'model',
                    text: part.text,
                    isPartial: true,
                  });
                }
              }
            }

            // 2. Transcriptions
            if (message.serverContent?.outputTranscription?.text) {
              broadcastToClient({
                type: 'transcript',
                role: 'model',
                text: message.serverContent.outputTranscription.text,
              });
            }
            if (message.serverContent?.inputTranscription?.text) {
              broadcastToClient({
                type: 'transcript',
                role: 'user',
                text: message.serverContent.inputTranscription.text,
              });
            }

            // 3. Interrupted
            if (message.serverContent?.interrupted) {
              broadcastToClient({ type: 'interrupted' });
              broadcastToClient({ type: 'status', status: 'listening' });
            }

            // 4. Turn Complete
            if (message.serverContent?.turnComplete) {
              broadcastToClient({ type: 'turnComplete' });
              broadcastToClient({ type: 'status', status: 'listening' });
            }

            // 5. Tool Calls / Function Calls
            if (message.toolCall?.functionCalls) {
              for (const call of message.toolCall.functionCalls) {
                const callId = call.id;
                const name = call.name;
                const args = (call.args || {}) as Record<string, unknown>;

                broadcastToClient({
                  type: 'toolCall',
                  id: callId,
                  name,
                  args,
                });

                let toolResult: unknown = null;
                const toolCtx = { ai, broadcast: broadcastToClient };

                try {
                  if (name === 'executeCodeSandbox') {
                    toolResult = await handleExecuteCodeSandbox(
                      args as { code: string; language: string; description?: string },
                      toolCtx
                    );
                  } else if (name === 'runCliCommand') {
                    toolResult = await handleRunCliCommand(
                      args as { command: string; cwd?: string },
                      toolCtx
                    );
                  } else if (name === 'deployAgentTask') {
                    toolResult = await handleDeployAgentTask(
                      args as { agentName: string; task: string },
                      toolCtx
                    );
                  } else if (name === 'getSystemInfo') {
                    toolResult = await handleGetSystemInfo(toolCtx);
                  } else if (name === 'updateCanvasVisual') {
                    toolResult = await handleUpdateCanvasVisual(
                      args as {
                        canvasType: 'diagram' | 'markdown' | 'chart' | 'code_snippet';
                        title: string;
                        content: string;
                      },
                      toolCtx
                    );
                  } else if (name === 'getWeather') {
                    toolResult = await handleGetWeather(args as { location: string });
                  } else if (name === 'webSearch') {
                    toolResult = await handleWebSearch(args as { query: string }, toolCtx);
                  } else if (name === 'createGoogleMeet') {
                    toolResult = await handleCreateGoogleMeet(args as any, toolCtx);
                  } else if (name === 'listGmailMessages') {
                    toolResult = await handleListGmailMessages(args as any, toolCtx);
                  } else if (name === 'sendGmailMessage') {
                    toolResult = await handleSendGmailMessage(args as any, toolCtx);
                  } else if (name === 'listCalendarEvents') {
                    toolResult = await handleListCalendarEvents(args as any, toolCtx);
                  } else if (name === 'createCalendarEvent') {
                    toolResult = await handleCreateCalendarEvent(args as any, toolCtx);
                  } else if (name === 'listDriveFiles') {
                    toolResult = await handleListDriveFiles(args as any, toolCtx);
                  } else if (name === 'createGoogleDoc') {
                    toolResult = await handleCreateGoogleDoc(args as any, toolCtx);
                  } else if (name === 'createGoogleSheet') {
                    toolResult = await handleCreateGoogleSheet(args as any, toolCtx);
                  } else if (name === 'createGoogleSlide') {
                    toolResult = await handleCreateGoogleSlide(args as any, toolCtx);
                  } else if (name === 'createGoogleForm') {
                    toolResult = await handleCreateGoogleForm(args as any, toolCtx);
                  } else if (name === 'listGoogleForms') {
                    toolResult = await handleListGoogleForms(args as any, toolCtx);
                  } else if (name === 'listGoogleTasks') {
                    toolResult = await handleListGoogleTasks(args as any, toolCtx);
                  } else if (name === 'createGoogleTask') {
                    toolResult = await handleCreateGoogleTask(args as any, toolCtx);
                  } else if (name === 'listGoogleContacts') {
                    toolResult = await handleListGoogleContacts(args as any, toolCtx);
                  } else {
                    toolResult = { error: `Unknown tool name: ${name}` };
                  }
                } catch (err: any) {
                  toolResult = { error: err.message || 'Tool execution failed' };
                }

                broadcastToClient({
                  type: 'toolResult',
                  id: callId,
                  name,
                  result: toolResult,
                });

                // Send tool response back to Eburon Live API
                try {
                  const safeResponse = (typeof toolResult === 'object' && toolResult !== null && !Array.isArray(toolResult)) 
                    ? toolResult 
                    : { output: toolResult };
                    
                  await liveSession.sendToolResponse({
                    functionResponses: [
                      {
                        name: name,
                        response: safeResponse as Record<string, unknown>,
                        id: callId,
                      },
                    ],
                  });
                } catch (sendErr: any) {
                  console.error('Error sending tool response to Eburon Live:', sendErr);
                }
              }
            }
          },
          onerror: (err: any) => {
            console.error('Eburon Live session error:', err);
            broadcastToClient({ type: 'error', message: err.message || 'Live session error' });
          },
          onclose: () => {
            console.log('Eburon Live session closed');
            broadcastToClient({ type: 'status', status: 'disconnected' });
          },
        },
      });

      isConnected = true;
      broadcastToClient({ type: 'status', status: 'connected' });
      broadcastToClient({
        type: 'transcript',
        role: 'system',
        text: 'Beatrice OSS initialized. Listening to mic and live video feed.',
      });
    } catch (err: any) {
      console.error('Failed to establish Eburon Live connection:', err);
      broadcastToClient({
        type: 'error',
        message: err.message || 'Failed to connect to Eburon Live API.',
      });
      broadcastToClient({ type: 'status', status: 'error' });
      return;
    }

    // Handle incoming WebSocket messages from the browser client
    clientWs.on('message', async (data: Buffer | string) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'audio' && msg.audio && liveSession && isConnected) {
          liveSession.sendRealtimeInput({
            audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (msg.type === 'video' && msg.video && liveSession && isConnected) {
          liveSession.sendRealtimeInput({
            video: { data: msg.video, mimeType: 'image/jpeg' },
          });
        } else if (msg.type === 'text' && liveSession && isConnected) {
          if (msg.attachment) {
            const att = msg.attachment;
            if (att.mimeType?.startsWith('image/') && att.base64) {
              // Send image as multimodal frame to Eburon Gemini Live API
              liveSession.sendRealtimeInput({
                video: { data: att.base64, mimeType: att.mimeType || 'image/jpeg' },
              });
            }
            if (att.text) {
              const textWithFile = `[Attached Document: ${att.name}]\n\`\`\`\n${att.text}\n\`\`\`\n\n${msg.text || ''}`;
              liveSession.sendRealtimeInput({ text: textWithFile });
            } else if (msg.text) {
              liveSession.sendRealtimeInput({ text: msg.text });
            }
          } else if (msg.text) {
            liveSession.sendRealtimeInput({ text: msg.text });
          }
        } else if (msg.type === 'attachment' && liveSession && isConnected) {
          if (msg.mimeType?.startsWith('image/') && msg.data) {
            liveSession.sendRealtimeInput({
              video: { data: msg.data, mimeType: msg.mimeType },
            });
          }
          if (msg.text) {
            liveSession.sendRealtimeInput({ text: `[Attached File: ${msg.fileName || 'document'}]\n${msg.text}` });
          }
        } else if (msg.type === 'runSandbox') {
          const callId = 'manual_sb_' + Date.now();
          broadcastToClient({ type: 'toolCall', id: callId, name: 'executeCodeSandbox', args: { code: msg.code, language: msg.language } });
          const res = await handleExecuteCodeSandbox(
            { code: msg.code, language: msg.language || 'javascript' },
            { ai, broadcast: broadcastToClient }
          );
          broadcastToClient({ type: 'toolResult', id: callId, name: 'executeCodeSandbox', result: res });
          broadcastToClient({ type: 'sandboxResult', result: res });
        } else if (msg.type === 'runCli') {
          const callId = 'manual_cli_' + Date.now();
          broadcastToClient({ type: 'toolCall', id: callId, name: 'runCliCommand', args: { command: msg.command } });
          const res = await handleRunCliCommand({ command: msg.command }, { broadcast: broadcastToClient });
          broadcastToClient({ type: 'toolResult', id: callId, name: 'runCliCommand', result: res });
          broadcastToClient({ type: 'cliResult', result: res });
        } else if (msg.type === 'deployAgent') {
          const callId = 'manual_agent_' + Date.now();
          broadcastToClient({ type: 'toolCall', id: callId, name: 'deployAgentTask', args: { agentName: msg.agentName, task: msg.task } });
          const res = await handleDeployAgentTask(
            { agentName: msg.agentName || 'Sub-Agent', task: msg.task },
            { ai, broadcast: broadcastToClient }
          );
          broadcastToClient({ type: 'toolResult', id: callId, name: 'deployAgentTask', result: res });
        } else if (msg.type === 'getSystemInfo') {
          const callId = 'manual_sys_' + Date.now();
          broadcastToClient({ type: 'toolCall', id: callId, name: 'getSystemInfo', args: {} });
          const res = await handleGetSystemInfo({ ai, broadcast: broadcastToClient });
          broadcastToClient({ type: 'toolResult', id: callId, name: 'getSystemInfo', result: res });
        } else if (msg.type === 'updateCanvas') {
          const callId = 'manual_canvas_' + Date.now();
          broadcastToClient({ type: 'toolCall', id: callId, name: 'updateCanvasVisual', args: { canvasType: msg.canvasType, title: msg.title, content: msg.content } });
          const res = await handleUpdateCanvasVisual(
            { canvasType: msg.canvasType, title: msg.title, content: msg.content },
            { ai, broadcast: broadcastToClient }
          );
          broadcastToClient({ type: 'toolResult', id: callId, name: 'updateCanvasVisual', result: res });
        } else if (msg.type === 'getWeather') {
          const callId = 'manual_weather_' + Date.now();
          broadcastToClient({ type: 'toolCall', id: callId, name: 'getWeather', args: { location: msg.location } });
          const res = await handleGetWeather({ location: msg.location });
          broadcastToClient({ type: 'toolResult', id: callId, name: 'getWeather', result: res });
        } else if (msg.type === 'webSearch') {
          const callId = 'manual_search_' + Date.now();
          broadcastToClient({ type: 'toolCall', id: callId, name: 'webSearch', args: { query: msg.query } });
          const res = await handleWebSearch({ query: msg.query }, { ai, broadcast: broadcastToClient });
          broadcastToClient({ type: 'toolResult', id: callId, name: 'webSearch', result: res });
        }
      } catch (err: any) {
        console.error('Error processing client WS message:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('Client WebSocket closed.');
      if (liveSession) {
        try {
          liveSession.close();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Beatrice OSS server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
