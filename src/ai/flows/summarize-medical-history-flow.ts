
'use server';
/**
 * @fileOverview An AI-powered medical history summarizer for doctors.
 *
 * - summarizeMedicalHistory - A function that condenses patient notes into a summary.
 * - SummarizeHistoryInput - The input type for the function.
 * - SummarizeHistoryOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeHistoryInputSchema = z.object({
  medicalNotes: z.string().describe("A string containing all of the patient's medical history notes, separated by newlines."),
});
export type SummarizeHistoryInput = z.infer<typeof SummarizeHistoryInputSchema>;

const SummarizeHistoryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise, well-structured summary of the patient\'s key medical history points, formatted for a doctor to quickly understand.'),
});
export type SummarizeHistoryOutput = z.infer<typeof SummarizeHistoryOutputSchema>;

export async function summarizeMedicalHistory(input: SummarizeHistoryInput): Promise<SummarizeHistoryOutput> {
  return summarizeMedicalHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMedicalHistoryPrompt',
  input: { schema: SummarizeHistoryInputSchema },
  output: { schema: SummarizeHistoryOutputSchema },
  prompt: `You are an expert medical assistant AI. Your task is to summarize a patient's medical history for a doctor.
The provided text contains a series of notes recorded over time.

Analyze the following medical notes and create a concise, easy-to-read summary.
Focus on key diagnoses, recurring issues, and significant medical events.
Structure the output logically (e.g., by condition or chronologically). Use bullet points for clarity.

Medical Notes:
{{{medicalNotes}}}
`,
});

const summarizeMedicalHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeMedicalHistoryFlow',
    inputSchema: SummarizeHistoryInputSchema,
    outputSchema: SummarizeHistoryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
