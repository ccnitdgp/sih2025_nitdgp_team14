'use server';
/**
 * @fileOverview A health information assistant that answers user questions in their preferred language.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HealthAssistantInputSchema = z.object({
  question: z.string().describe("The user's health-related question."),
  language: z.string().describe('The language in which the user wants the answer.'),
});
export type HealthAssistantInput = z.infer<typeof HealthAssistantInputSchema>;

const HealthAssistantOutputSchema = z.object({
  answer: z.string().describe("The assistant's answer to the user's question."),
});
export type HealthAssistantOutput = z.infer<typeof HealthAssistantOutputSchema>;

const prompt = ai.definePrompt({
  name: 'healthAssistantPrompt',
  // we *can* omit model here and just use the default from genkit.ts
  input: { schema: HealthAssistantInputSchema },
  output: { schema: HealthAssistantOutputSchema },
  prompt: `You are a helpful and empathetic health information assistant. Your goal is to provide clear, accurate, and easy-to-understand information about health conditions, prescriptions, and general wellness.

You are not a doctor and cannot provide medical advice, diagnoses, or treatment plans. Always include a disclaimer at the end of your response: "This information is for educational purposes only. Please consult a qualified healthcare professional for medical advice."

Answer the following question in {{{language}}}.

Question: {{{question}}}
`,
});

const healthAssistantFlow = ai.defineFlow(
  {
    name: 'healthAssistantFlow',
    inputSchema: HealthAssistantInputSchema,
    outputSchema: HealthAssistantOutputSchema,
  },
  async (input): Promise<HealthAssistantOutput> => {
    const { output } = await prompt(input);

    if (!output || typeof output.answer !== 'string') {
      return {
        answer:
          'Sorry, I could not generate an answer right now. Please try again later. This information is for educational purposes only. Please consult a qualified healthcare professional for medical advice.',
      };
    }

    return output;
  },
);

export async function getHealthInformation(
  input: HealthAssistantInput,
): Promise<HealthAssistantOutput> {
  return healthAssistantFlow(input);
}
