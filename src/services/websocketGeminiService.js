const { GoogleGenAI, MediaResolution, Modality } = require('@google/genai');

/**
 * WebSocket Gemini Service for real-time voice communication
 */
class WebSocketGeminiService {
  constructor(apiKey) {
    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * Create a live session with Gemini for voice communication
   * @param {string} systemPrompt - System instructions for the assistant
   * @param {Object} callbacks - Event callbacks for the session
   * @param {Object} config - Voice and model configuration
   * @returns {Promise<Session>} Gemini live session
   */
  async createSession(systemPrompt, callbacks, config = {}) {
    const {
      model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-native-audio-dialog',
      temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '1'),
      triggerTokens = parseInt(process.env.GEMINI_TRIGGER_TOKENS || '25600'),
      targetTokens = parseInt(process.env.GEMINI_TARGET_TOKENS || '12800'),
      voiceName = process.env.GEMINI_VOICE_NAME || 'Orus'
    } = config;

    return await this.client.live.connect({
      model,
      config: {
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        temperature,
        contextWindowCompression: {
          triggerTokens,
          slidingWindow: {
            targetTokens
          }
        },
        systemInstruction: systemPrompt,
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName } 
          }
        },
      },
      callbacks: {
        onopen: () => {
          console.log('Gemini session opened: ' + new Date().toISOString());
          callbacks.onopen?.();
        },
        onmessage: (message) => {
          try {
            if (message.serverContent?.interrupted) {
              console.log('[INTERRUPTED] Gemini interrupted: ' + new Date().toISOString());
            }
            if (message.serverContent?.modelTurn?.parts?.length) {
              console.log('Gemini message chunk received: ' + message.serverContent?.modelTurn?.parts?.length);
            }
            if (!message.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
              console.log('Gemini message: ' + JSON.stringify(message));
            }
          } catch (e) {
            console.error('Error parsing Gemini message:', e);
          }

          callbacks.onmessage?.(message);
        },
        onerror: (e) => {
          console.error('Gemini error:', e.message, new Date().toISOString());
          callbacks.onerror?.(e);
        },
        onclose: (e) => {
          console.log('Gemini session closed', e.reason, new Date().toISOString());
          callbacks.onclose?.(e);
        },
      },
    });
  }

  /**
   * Send audio input to the session
   * @param {Session} session - Active Gemini session
   * @param {Buffer} audioBuffer - Audio data buffer
   */
  sendAudioInput(session, audioBuffer) {
    const media = {
      data: audioBuffer.toString('base64'),
      mimeType: 'audio/pcm;rate=16000',
    };
    session?.sendRealtimeInput({ media });
  }

  /**
   * Send text input to the session
   * @param {Session} session - Active Gemini session
   * @param {string} text - Text message to send
   */
  sendTextInput(session, text) {
    session?.sendRealtimeInput({ text });
  }

  /**
   * Close the session
   * @param {Session} session - Session to close
   */
  closeSession(session) {
    if (session) {
      session.close();
    }
  }
}

module.exports = WebSocketGeminiService;