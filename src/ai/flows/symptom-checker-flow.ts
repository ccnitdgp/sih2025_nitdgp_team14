'use server';
/**
 * @fileOverview An AI-powered symptom checker that suggests a medical specialist.
 *
 * - getSpecialistSuggestion - A function that handles the specialist suggestion process.
 * - SymptomCheckerInput - The input type for the getSpecialistSuggestion function.
 * - SymptomCheckerOutput - The return type for the getSpecialistSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SymptomCheckerInputSchema = z.object({
  symptomDescription: z.string().describe('A description of the user\'s health problem or symptoms.'),
});
export type SymptomCheckerInput = z.infer<typeof SymptomCheckerInputSchema>;

const SymptomCheckerOutputSchema = z.object({
  specialistSuggestion: z
    .string()
    .describe('The type of medical specialist suggested for the described symptoms (e.g., Cardiologist, Dermatologist).'),
});
export type SymptomCheckerOutput = z.infer<typeof SymptomCheckerOutputSchema>;

export async function getSpecialistSuggestion(input: SymptomCheckerInput): Promise<SymptomCheckerOutput> {
  return symptomCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomCheckerPrompt',
  input: { schema: SymptomCheckerInputSchema },
  output: { schema: SymptomCheckerOutputSchema },
  prompt: `You are a helpful medical assistant. Based on the following symptoms, suggest the most appropriate type of medical specialist to consult.

Symptoms: {{{symptomDescription}}}

Suggest only the specialist type. For example: "Cardiologist", "Dermatologist", "General Physician".`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ]
  }
});

const symptomCheckerFlow = ai.defineFlow(
  {
    name: 'symptomCheckerFlow',
    inputSchema: SymptomCheckerInputSchema,
    outputSchema: SymptomCheckerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
