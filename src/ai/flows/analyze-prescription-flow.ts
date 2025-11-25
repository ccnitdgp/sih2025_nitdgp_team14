'use server';
/**
 * @fileOverview An AI-powered prescription analyzer.
 *
 * - analyzePrescription - A function that handles the prescription analysis process.
 * - AnalyzePrescriptionInput - The input type for the analyzePrescription function.
 * - AnalyzePrescriptionOutput - The return type for the analyzePrescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzePrescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a medical prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePrescriptionInput = z.infer<typeof AnalyzePrescriptionInputSchema>;

const MedicationInfoSchema = z.object({
  medicationName: z.string().describe('The name of the medication.'),
  howToTake: z
    .string()
    .describe('Simple, clear instructions on how and when to take the medication (e.g., "One tablet twice a day after meals").'),
  purpose: z
    .string()
    .describe('A brief, easy-to-understand explanation of why the medication is being taken (e.g., "To control blood pressure").'),
});

const AnalyzePrescriptionOutputSchema = z.object({
  medications: z.array(MedicationInfoSchema).describe('An array of all medications found on the prescription.'),
});
export type AnalyzePrescriptionOutput = z.infer<typeof AnalyzePrescriptionOutputSchema>;

export async function analyzePrescription(input: AnalyzePrescriptionInput): Promise<AnalyzePrescriptionOutput> {
  return analyzePrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePrescriptionPrompt',
  input: { schema: AnalyzePrescriptionInputSchema },
  output: { schema: AnalyzePrescriptionOutputSchema },
  prompt: `You are an expert pharmacist's assistant. Your task is to analyze the provided image of a medical prescription and extract the key information for the patient.

Analyze the prescription image provided. For each medication you identify, provide the following details in a clear, simple, and easy-to-understand format:
1.  **Medication Name**: The name of the drug.
2.  **How to Take**: Explain the dosage and frequency (e.g., "One tablet twice a day after meals for 5 days").
3.  **Purpose**: Briefly explain the reason for taking the medication in simple terms (e.g., "To treat a bacterial infection" or "To lower cholesterol").

It is crucial to present this information clearly. Do not add any extra commentary, greetings, or disclaimers in your output. Just return the structured data.

Prescription Photo: {{media url=photoDataUri}}
`,
});

const analyzePrescriptionFlow = ai.defineFlow(
  {
    name: 'analyzePrescriptionFlow',
    inputSchema: AnalyzePrescriptionInputSchema,
    outputSchema: AnalyzePrescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
