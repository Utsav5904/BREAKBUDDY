import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

export interface WellnessTipRequest {
  category?: 'eyes' | 'stretch' | 'breathing' | 'posture' | 'general';
  focusMinutes?: number;
  context?: string;
}

export interface WellnessTipResponse {
  title: string;
  tip: string;
  category: string;
  durationSeconds: number;
  benefit: string;
}

/**
 * Service for interacting with Google Gemini AI to generate
 * personalized wellness tips and break exercises.
 */
class GeminiService {
  private client: GoogleGenAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      console.log('[gemini] Gemini AI service initialized');
    } else {
      console.warn('[gemini] No API key — AI wellness tips unavailable');
    }
  }

  /**
   * Check if the Gemini AI service is available.
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Generate a personalized wellness tip using Gemini AI.
   */
  async generateWellnessTip(request: WellnessTipRequest): Promise<WellnessTipResponse> {
    if (!this.client) {
      throw new Error('Gemini AI service is not configured');
    }

    const category = request.category || 'general';
    const focusMinutes = request.focusMinutes || 0;
    const userContext = request.context ? request.context.slice(0, 200) : '';

    const prompt = this.buildPrompt(category, focusMinutes, userContext);

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          temperature: 0.8,
          maxOutputTokens: 400,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim();
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(text);
      return this.validateResponse(parsed, category);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('[gemini] Failed to parse AI response as JSON');
        throw new Error('AI response was not valid JSON');
      }
      throw error;
    }
  }

  /**
   * Build a structured prompt for Gemini to generate a wellness tip.
   */
  private buildPrompt(category: string, focusMinutes: number, userContext: string): string {
    const categoryDescriptions: Record<string, string> = {
      eyes: 'eye strain relief and digital eye fatigue recovery',
      stretch: 'desk stretches for neck, shoulders, wrists, and back',
      breathing: 'calming breathwork and respiratory exercises',
      posture: 'posture correction and ergonomic micro-adjustments',
      general: 'general wellness, mindfulness, or any of the above categories',
    };

    const categoryDesc = categoryDescriptions[category] || categoryDescriptions.general;

    let contextLine = '';
    if (focusMinutes > 0) {
      contextLine += `The user has been focusing at their screen for approximately ${focusMinutes} minutes. `;
    }
    if (userContext) {
      contextLine += `Additional context: "${userContext}". `;
    }

    return `You are a wellness expert specializing in screen break exercises and occupational health for knowledge workers.

Generate ONE practical, evidence-based wellness tip or micro-exercise focused on: ${categoryDesc}.

${contextLine}

Respond ONLY with a valid JSON object in this exact format (no markdown, no explanation):
{
  "title": "Short descriptive title (max 8 words)",
  "tip": "Clear, step-by-step instruction for the exercise. Be specific about body positions, timing, and technique. 2-4 sentences.",
  "category": "${category}",
  "durationSeconds": <number between 15 and 120>,
  "benefit": "One sentence explaining the physiological or psychological benefit."
}`;
  }

  /**
   * Validate and normalize the parsed AI response.
   */
  private validateResponse(parsed: Record<string, unknown>, fallbackCategory: string): WellnessTipResponse {
    return {
      title: typeof parsed.title === 'string' ? parsed.title.slice(0, 100) : 'Wellness Tip',
      tip: typeof parsed.tip === 'string' ? parsed.tip.slice(0, 500) : 'Take a moment to rest your eyes and stretch.',
      category: typeof parsed.category === 'string' ? parsed.category : fallbackCategory,
      durationSeconds: typeof parsed.durationSeconds === 'number'
        ? Math.min(120, Math.max(15, Math.round(parsed.durationSeconds)))
        : 30,
      benefit: typeof parsed.benefit === 'string' ? parsed.benefit.slice(0, 200) : 'Supports overall wellbeing.',
    };
  }
}

// Singleton instance
export const geminiService = new GeminiService();
