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
  dosage: z
    .string()
    .describe('The dosage of the medication (e.g., "500mg", "1 tablet", "Local application").'),
  use: z
    .string()
    .describe('A brief, easy-to-understand explanation of what the medication is used for (e.g., "For face as a sunscreen", "For eyes").'),
  frequency: z
    .string()
    .describe('How often to take the medication (e.g., "Twice a day", "Thrice a day (9 AM, 12 PM, 3 PM)", "As directed").'),
  status: z
    .string()
    .describe('The current status of the medication (e.g., "Current", "Finished", "As needed"). Default to "Current" if not specified.'),
});

const AnalyzePrescriptionOutputSchema = z.object({
  doctor: z.string().describe("The name of the prescribing doctor. If not legible, return 'Unreadable'."),
  datePrescribed: z.string().describe("The date the prescription was written in DD-MM-YYYY format. If not legible, return 'Unreadable'."),
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

Analyze the prescription image provided. Extract the following information:
1.  **Doctor**: The name of the doctor who wrote the prescription. If you cannot read the name, output "Unreadable".
2.  **Date Prescribed**: The date the prescription was issued. Format it as DD-MM-YYYY. If you cannot read the date, output "Unreadable".
3.  **Medications**: For each medication you identify, provide the following details:
    - **Medication Name**: The name of the drug.
    - **Dosage**: The strength or amount of medication to be taken (e.g., "500mg", "Local application").
    - **Use**: A brief explanation of its purpose (e.g., "For eyes", "To control blood pressure").
    - **Frequency**: How often the medication should be taken (e.g., "Twice a day"). Include specific times if mentioned.
    - **Status**: The status of the medication. Default to "Current" if not specified.

It is crucial to present this information clearly and accurately. Do not add any extra commentary, greetings, or disclaimers in your output. Just return the structured data.

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
