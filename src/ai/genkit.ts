// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai'; // 👈 IMPORTANT

// This is the instance you import everywhere: `import { ai } from '@/ai/genkit';`
export const ai = genkit({
  plugins: [
    // The plugin will also read GEMINI_API_KEY / GOOGLE_API_KEY automatically,
    // but passing it explicitly is fine.
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],

  // ✅ Use a real Gemini model id via the plugin helper
  // (no "google/" prefix, no "-latest" suffix here)
  model: googleAI.model('gemini-2.5-flash'),
  // If 2.5 isn’t enabled for your key, you can fall back to:
  // model: googleAI.model('gemini-1.5-flash'),
});
