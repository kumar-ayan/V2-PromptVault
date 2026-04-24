import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { unifiedChatCompletion, GEMINI_MODELS } from './openaiClient';

const ImprovedPromptSchema = z.object({
  improved_prompt: z.string().describe('The completely rewritten, optimized prompt text.'),
  analysis: z.array(z.string()).describe('A strict list of bullet points explaining exactly what changes were made and why.')
});

export class ImprovementService {
  /**
   * Applies the "Master Prompt Engineer" logic to completely rewrite and optimize a given prompt.
   * This logic strongly relies on Gemini 1.5 Pro to execute complex reasoning.
   */
  static async improvePrompt(content: string) {
    const systemInstruction = `
      You are the Master Prompt Engineer. 
      Your task is to analyze the user's drafted prompt and completely rewrite it following industry-leading best practices.
      
      A great prompt should:
      1. Clearly state the objective or role.
      2. Set strict constraints (negative boundaries).
      3. Define the desired output format explicitly.
      4. Break complex instructions into granular steps.
      
      Review the user's current draft below. Then, provide an updated highly-effective version.

      Current Draft:
      ---
      ${content}
      ---
      
      You must respond in JSON strictly matching this schema:
      {
        "improved_prompt": "The completely rewritten, optimized prompt text.",
        "analysis": ["Added explicit constraints regarding length", "Defined a clear JSON output format"]
      }
    `;

    try {
      const response = await unifiedChatCompletion(
        {
          model: GEMINI_MODELS[0], // Always tries the best available Gemini model first, falls back automatically
          messages: [{ role: 'user', content: systemInstruction }],
          response_format: { type: 'json_object' }
        },
        { timeout: 30000 }
      );

      const responseText = response.choices[0]?.message?.content?.trim() || '{}';
      const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
      
      const result = ImprovedPromptSchema.parse(JSON.parse(cleaned));
      result.improved_prompt = DOMPurify.sanitize(result.improved_prompt);
      return result;
    } catch (error) {
      console.error('ImprovementService failed to optimize prompt:', error);
      throw new Error('Failed to run Master Prompt Engineer improvement flow.');
    }
  }
}
