'use server';
/**
 * @fileOverview An AI flow that generates public health disease trend data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DiseaseTrendInputSchema = z.object({
  region: z.string().describe('The geographical region for the trend report, e.g., "India".'),
  timeframe: z.string().describe('The time period for the trend data, e.g., "last 30 days".'),
});
export type DiseaseTrendInput = z.infer<typeof DiseaseTrendInputSchema>;

const DiseaseInfoSchema = z.object({
  disease: z.string().describe('The name of the disease.'),
  trend: z.enum(['increasing', 'decreasing', 'stable']).describe('The current trend of reported cases.'),
  caseCount: z.number().describe('A realistic, approximate number of recently reported cases.'),
  summary: z.string().describe('A one-sentence summary of the current situation for this disease.'),
});

const DiseaseTrendOutputSchema = z.object({
  trends: z.array(DiseaseInfoSchema).describe('An array of disease trend information.'),
  overallSummary: z.string().describe('A brief, two-sentence overall summary of the public health situation for the given region.'),
});
export type DiseaseTrendOutput = z.infer<typeof DiseaseTrendOutputSchema>;


export async function getDiseaseTrends(input: DiseaseTrendInput): Promise<DiseaseTrendOutput> {
  return diseaseTrendsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'diseaseTrendsPrompt',
  input: { schema: DiseaseTrendInputSchema },
  output: { schema: DiseaseTrendOutputSchema },
  prompt: `You are a public health data analyst. Based on current, real-world public health knowledge, generate a realistic summary of disease trends for the specified region and timeframe.

Focus on 3-4 common, seasonally-relevant diseases. Provide a trend, an approximate case count, and a short summary for each. Also, provide a brief overall summary.

Do not use any real-time, live data, but generate a plausible, informative snapshot based on your general knowledge of epidemiology. For example, mention influenza in winter or dengue during monsoon season.

Region: {{{region}}}
Timeframe: {{{timeframe}}}
`,
});

const diseaseTrendsFlow = ai.defineFlow(
  {
    name: 'diseaseTrendsFlow',
    inputSchema: DiseaseTrendInputSchema,
    outputSchema: DiseaseTrendOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
