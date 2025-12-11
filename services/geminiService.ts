import { 
  GoogleGenAI, 
  Type, 
  Schema,
  LiveClient,
  LiveServerMessage,
  Modality
} from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper for Base64 ---
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
  });
};

// --- Text Generation & Roadmaps ---

const ROADMAP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of top technical skills required based on the JD"
    },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          duration: { type: Type.STRING },
          description: { type: Type.STRING, description: "Short summary" },
          topics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of sub-topics" },
          content: { type: Type.STRING, description: "Detailed educational content (3-4 paragraphs) explaining the core concepts of this module so the student can learn immediately." },
          prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  }
};

const ROADMAP_PROMPT = `Analyze this job description. 
1. Extract the key technical skills required.
2. Create a step-by-step learning roadmap to master these skills.
3. For EACH module in the roadmap, generate DETAILED learning content (textbook style) so the user can actually learn the topic right now. Include key concepts, definitions, and examples in the content field.
`;

export const generateRoadmapFromJobDescription = async (file: File) => {
  const imagePart = await fileToGenerativePart(file);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        imagePart,
        { text: ROADMAP_PROMPT }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: ROADMAP_SCHEMA
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateRoadmapFromText = async (text: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: `${ROADMAP_PROMPT}\n\nJob Description:\n${text}` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: ROADMAP_SCHEMA
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateProfessionalGuidance = async (goal: string, region: string) => {
  // Using Search Grounding to find real professionals/companies
  // Note: responseSchema and responseMimeType are NOT supported with googleSearch tool.
  const prompt = `I want to connect with professionals to become a ${goal} in ${region}.
  
  Please Perform a Google Search to find:
  1. Top 5 companies hiring for ${goal} roles in ${region}.
  2. 5 real professional profiles (from LinkedIn or similar) that match this role in this region. 
  
  Return the result STRICTLY as a JSON object with the following format (no markdown, no code blocks):
  {
    "recommended_companies": ["Company A", "Company B"],
    "profiles": [
      {
        "name": "Name",
        "title": "Job Title",
        "company": "Company",
        "description": "Brief bio or skills",
        "linkedinUrl": "https://linkedin.com/in/..."
      }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      // responseMimeType: "application/json", // REMOVED as it conflicts with googleSearch
      // responseSchema: ... // REMOVED as it conflicts with googleSearch
    }
  });

  // Extract text and parse manually since schema mode is disabled
  const text = response.text || "{}";
  const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON from search result", e);
    return { recommended_companies: [], profiles: [] };
  }
};

export const findSemiconductorJobs = async (role: string, location: string, experience: string) => {
  const prompt = `Find active job openings for "${role}" in "${location}" requiring "${experience}".
  
  Search specifically on platforms like LinkedIn, Naukri, Glassdoor, Indeed, and company career pages.
  
  Return a list of at least 6 real, recent job listings found in the search results.
  
  Format the output STRICTLY as a JSON object (no markdown) with this structure:
  {
    "jobs": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "location": "City, Country",
        "platform": "Source (e.g., LinkedIn, Naukri, Company Site)",
        "snippet": "Brief 1-sentence summary of the role or requirements"
      }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "{}";
  const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse JSON from job search", e);
    return { jobs: [] };
  }
};

export const generateQuiz = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate 5 multiple choice questions about "${topic}" in semiconductor engineering.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER, description: "Index of correct option (0-3)" },
                explanation: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const chatWithMentor = async (message: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: message,
    config: {
      systemInstruction: `You are an expert Semiconductor AI Mentor dedicated to teaching beginners. 
      Your goal is to make complex chip manufacturing concepts easy to understand.
      
      Strict Formatting Rules:
      1. **Simplify**: Use simple analogies (e.g., "Lithography is like a stencil", "Transistors are like light switches").
      2. **Structure**: 
         - Start with a direct, one-sentence definition.
         - Use **Bullet Points (•)** for key concepts.
         - Use **Numbered Lists (1., 2.)** for processes or steps.
      3. **Visuals**: Use **Bold** syntax for key technical terms.
      4. **Length**: Keep paragraphs short (1-2 sentences). Break down walls of text.
      
      Example Response Format:
      **Lithography** is a process used to pattern circuits on a silicon wafer, similar to developing a photograph.
      
      **The Process:**
      1. **Coat**: Light-sensitive photoresist is applied.
      2. **Expose**: UV light shines through a mask (stencil).
      3. **Develop**: The pattern is revealed.
      
      **Why it matters:**
      • It determines how small and fast the transistors can be.
      • It is the most expensive step in fabrication.
      `,
    }
  });
  return response.text;
};

// --- Image Generation & Editing (Gemini 2.5 Flash Image / Nano Banana) ---

export const generateSemiconductorImage = async (prompt: string) => {
  // Using nano banana series for generation as requested (or imagen-3 for higher quality if preferred, but instructions say nano banana for editing).
  // Instructions: "Generate images using gemini-2.5-flash-image by default"
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const editSemiconductorImage = async (base64Image: string, prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png', // Assuming PNG for simplicity in this flow
            data: base64Image
          }
        },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

// --- Video Generation (Veo) ---

export const animateImageWithVeo = async (base64Image: string, prompt: string = "Animate this naturally") => {
  // Check API key selection for Veo (as per instructions)
  if (window.aistudio && window.aistudio.openSelectKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Re-instantiate needed if key changed globally, but assuming env var updates or context handles it.
          // For safety, we just proceed hoping the injection worked or user selected.
      }
  }

  // Create a new instance to pick up potential new key
  const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let operation = await veoAi.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: base64Image,
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p', // standard for fast preview
      aspectRatio: '16:9'
    }
  });

  // Polling
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await veoAi.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (videoUri) {
     // Fetch with API key appended
     const res = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
     const blob = await res.blob();
     return URL.createObjectURL(blob);
  }
  return null;
};

// --- Live API (Voice) ---

export class LiveMentorClient {
  private client: LiveClient | null = null;
  private audioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private isConnected = false;

  constructor(private onTranscription?: (text: string, isUser: boolean) => void) {}

  async connect() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Connect to Gemini Live
    this.client = ai.live;
    const sessionPromise = this.client.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: "You are a helpful semiconductor industry mentor. You answer questions about chips, fabrication, and career advice briefly.",
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => {
            console.log("Live Session Open");
            this.isConnected = true;
            this.setupAudioInput(stream, sessionPromise);
        },
        onmessage: async (message: LiveServerMessage) => {
            // Handle Audio
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
                 this.nextStartTime = Math.max(this.nextStartTime, outputAudioContext.currentTime);
                 const audioBuffer = await this.decodeAudioData(
                     this.base64ToBytes(audioData),
                     outputAudioContext,
                     24000,
                     1
                 );
                 const source = outputAudioContext.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(outputNode);
                 source.start(this.nextStartTime);
                 this.nextStartTime += audioBuffer.duration;
            }

            // Handle Transcription
            if (message.serverContent?.outputTranscription?.text) {
                this.onTranscription?.(message.serverContent.outputTranscription.text, false);
            }
            if (message.serverContent?.inputTranscription?.text) {
                this.onTranscription?.(message.serverContent.inputTranscription.text, true);
            }
        },
        onclose: () => {
            console.log("Live Session Closed");
            this.isConnected = false;
        },
        onerror: (e) => {
            console.error("Live Session Error", e);
        }
      }
    });
  }

  private setupAudioInput(stream: MediaStream, sessionPromise: Promise<any>) {
    if (!this.audioContext) return;
    
    this.inputSource = this.audioContext.createMediaStreamSource(stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createPcmBlob(inputData);
      
      sessionPromise.then(session => {
          session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.audioContext.destination); // Mute self? Logic requires connecting to dest to fire process
  }

  disconnect() {
      // Clean up contexts and sources
      this.inputSource?.disconnect();
      this.processor?.disconnect();
      this.audioContext?.close();
      // No explicit close on client in SDK provided example, relying on browser unload or just stopping interaction logic
      // Ideally session.close() if exposed, but for this demo we stop sending audio.
      this.isConnected = false;
  }

  private createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
      const l = data.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
      }
      const bytes = new Uint8Array(int16.buffer);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000',
      };
  }

  private base64ToBytes(base64: string): Uint8Array {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
      const dataInt16 = new Int16Array(data.buffer);
      const frameCount = dataInt16.length / numChannels;
      const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
      for(let channel = 0; channel < numChannels; channel++) {
          const channelData = buffer.getChannelData(channel);
          for(let i=0; i<frameCount; i++) {
              channelData[i] = dataInt16[i*numChannels + channel] / 32768.0;
          }
      }
      return buffer;
  }
}