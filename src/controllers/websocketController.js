const WebSocket = require('ws');
const assistantApiService = require('../services/assistantApiService');
const WebSocketGeminiService = require('../services/websocketGeminiService');
const apiKeyService = require('../services/apiKeyService');
const fs = require('fs');
const path = require('path');

/**
 * WebSocket Controller for handling voice communication
 */
class WebSocketController {
  constructor() {
    this.geminiService = new WebSocketGeminiService(process.env.GEMINI_API_KEY);
    this.ensureRecordingsDirectory();
  }

  /**
   * Ensure recordings directory exists
   */
  ensureRecordingsDirectory() {
    const recordingsDir = path.join(__dirname, '..', '..', process.env.RECORDINGS_DIRECTORY || 'recordings');
    if (!fs.existsSync(recordingsDir)) {
      fs.mkdirSync(recordingsDir, { recursive: true });
    }
  }

  /**
   * Handle new WebSocket connection
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} request - HTTP request object
   */
  async handleConnection(ws, request) {
    console.log('Voice client connected');

    const { assistantUuid, apiKey } = this.extractConnectionParams(request);
    
    if (!assistantUuid) {
      console.error('No assistant UUID provided');
      ws.close(1008, 'Assistant UUID is required');
      return;
    }

    if (!apiKey) {
      console.error('No API key provided');
      ws.close(1008, 'API key is required');
      return;
    }

    console.log(`Assistant UUID: ${assistantUuid}`);

    let session = null;
    let assistant = null;
    let greetingSent = false;

    try {
      // Validate API key and get assistant details
      assistant = await this.validateAndGetAssistant(assistantUuid, apiKey);
      if (!assistant) {
        ws.close(1011, 'Assistant not found or access denied');
        return;
      }

      console.log(`Assistant details loaded: ${assistant.name}`);
    } catch (error) {
      console.error('Failed to validate assistant access:', error);
      ws.close(1011, 'Failed to validate assistant access');
      return;
    }

    try {
      session = await this.createGeminiSession(ws, assistant, greetingSent);
    } catch (error) {
      console.error('Failed to connect to Gemini:', error);
      ws.close(1011, 'Failed to establish Gemini session');
      return;
    }

    this.setupWebSocketEventHandlers(ws, session, assistant);
  }

  /**
   * Extract connection parameters from request
   * @param {Object} request - HTTP request object
   * @returns {Object} Connection parameters
   */
  extractConnectionParams(request) {
    const url = new URL(request.url || '', `http://localhost:${process.env.PORT || 3003}`);
    return {
      assistantUuid: url.searchParams.get('assistantUuid'),
      apiKey: url.searchParams.get('apiKey')
    };
  }

  /**
   * Validate API key and get assistant details
   * @param {string} assistantUuid - Assistant UUID
   * @param {string} apiKey - API key
   * @returns {Promise<Object>} Assistant details
   */
  async validateAndGetAssistant(assistantUuid, apiKey) {
    try {
      // Validate the API key first
      const apiKeyData = await apiKeyService.validateApiKey(apiKey);
      if (!apiKeyData) {
        throw new Error('Invalid API key');
      }

      // Get assistant using the validated API key permissions
      return await assistantApiService.getAssistantByUUID(assistantUuid, apiKeyData);
    } catch (error) {
      console.error('Error validating assistant access:', error);
      throw error;
    }
  }

  /**
   * Create Gemini session for voice communication
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} assistant - Assistant details
   * @param {boolean} greetingSent - Whether greeting was sent
   * @returns {Promise<Session>} Gemini session
   */
  async createGeminiSession(ws, assistant, greetingSent) {
    console.log('Creating Gemini session for voice communication', assistant.details);
    
    const session = await this.geminiService.createSession(
      assistant.details.systemPrompt,
      {
        onopen: () => {
          ws.send(JSON.stringify({ type: 'status', data: 'Voice session opened' }));
        },
        onmessage: (message) => {
          ws.send(JSON.stringify({ type: 'gemini', data: message }));
        },
        onerror: (e) => {
          ws.send(JSON.stringify({ type: 'error', data: e.message }));
        },
        onclose: (e) => {
          ws.send(JSON.stringify({ type: 'status', data: `Voice session closed: ${e.reason}` }));
        },
      },
      {
        model: assistant.details.model,
        temperature: assistant.details.temperature,
        voiceName: assistant.details.selectedVoice
      }
    );

    // Send first message if assistant should speak first
    if (assistant.details.interactionMode === 'agent_speak_first' && !greetingSent) {
      console.log('Sending initial greeting to user');
      this.geminiService.sendTextInput(session, assistant.details.firstMessage);
    }

    return session;
  }

  /**
   * Setup WebSocket event handlers
   * @param {WebSocket} ws - WebSocket connection
   * @param {Session} session - Gemini session
   * @param {Object} assistant - Assistant details
   */
  setupWebSocketEventHandlers(ws, session, assistant) {
    ws.on('message', async (message) => {
      if (session) {
        // Handle audio data from client
        this.geminiService.sendAudioInput(session, message);
      }
    });

    ws.on('close', () => {
      console.log('Voice client disconnected');
      if (session) {
        this.geminiService.closeSession(session);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (session) {
        this.geminiService.closeSession(session);
      }
    });
  }
}

module.exports = WebSocketController;