const fs = require('fs');
const path = require('path');

/**
 * Parse the voice.json file which contains concatenated JSON responses
 * Each response is a JSON array, but they're not properly separated
 */
function parseVoiceJsonFile() {
  try {
    const voiceJsonPath = path.join(__dirname, '../../assistant-admin-panel-frontend/public/voice.json');
    
    if (!fs.existsSync(voiceJsonPath)) {
      console.error('voice.json file not found at:', voiceJsonPath);
      return [];
    }
    
    console.log('Reading voice.json file...');
    const fileContent = fs.readFileSync(voiceJsonPath, 'utf-8');
    
    // The file contains concatenated JSON arrays like: ][{...}][{...}]
    // We need to split them and parse each array
    
    let voices = [];
    
    // Split by ']' and '[' to get individual JSON arrays
    let currentArray = '';
    let bracketDepth = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < fileContent.length; i++) {
      const char = fileContent[i];
      
      if (escapeNext) {
        currentArray += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        currentArray += char;
        escapeNext = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        currentArray += char;
        continue;
      }
      
      if (inString) {
        currentArray += char;
        continue;
      }
      
      if (char === '[') {
        bracketDepth++;
        currentArray += char;
      } else if (char === ']') {
        bracketDepth--;
        currentArray += char;
        
        // If we've closed all brackets, we have a complete array
        if (bracketDepth === 0) {
          try {
            const parsedArray = JSON.parse(currentArray.trim());
            if (Array.isArray(parsedArray)) {
              voices = voices.concat(parsedArray);
              console.log(`Parsed array with ${parsedArray.length} voices`);
            }
          } catch (parseError) {
            console.warn('Failed to parse array:', currentArray.substring(0, 100) + '...');
          }
          currentArray = '';
        }
      } else {
        currentArray += char;
      }
    }
    
    console.log(`Total voices parsed: ${voices.length}`);
    
    // Remove duplicates based on ID
    const uniqueVoices = [];
    const seenIds = new Set();
    
    for (const voice of voices) {
      if (voice && voice.id && !seenIds.has(voice.id)) {
        seenIds.add(voice.id);
        uniqueVoices.push(voice);
      }
    }
    
    console.log(`Unique voices after deduplication: ${uniqueVoices.length}`);
    
    return uniqueVoices;
    
  } catch (error) {
    console.error('Error parsing voice.json:', error);
    return [];
  }
}

module.exports = { parseVoiceJsonFile };
