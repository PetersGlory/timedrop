// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview A flow for generating financial instrument predictions based on user prompts, incorporating real-world information.
 *
 * - financialInstrumentPrediction - A function that handles the financial instrument prediction process.
 * - FinancialInstrumentPredictionInput - The input type for the financialInstrumentPrediction function.
 * - FinancialInstrumentPredictionOutput - The return type for the financialInstrumentPrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialInstrumentPredictionInputSchema = z.object({
  prompt: z.string().describe('A prompt describing a financial instrument or market condition.'),
});
export type FinancialInstrumentPredictionInput = z.infer<typeof FinancialInstrumentPredictionInputSchema>;

const FinancialInstrumentPredictionOutputSchema = z.object({
  prediction: z.string().describe('A prediction incorporating real-world information based on the prompt.'),
});
export type FinancialInstrumentPredictionOutput = z.infer<typeof FinancialInstrumentPredictionOutputSchema>;

export async function financialInstrumentPrediction(input: FinancialInstrumentPredictionInput): Promise<FinancialInstrumentPredictionOutput> {
  return financialInstrumentPredictionFlow(input);
}

const financialInstrumentPredictionPrompt = ai.definePrompt({
  name: 'financialInstrumentPredictionPrompt',
  input: {schema: FinancialInstrumentPredictionInputSchema},
  output: {schema: FinancialInstrumentPredictionOutputSchema},
  prompt: `You are a financial expert providing predictions based on user prompts and real-world information.

  Given the following prompt, provide a prediction incorporating relevant real-world information:

  Prompt: {{{prompt}}}
  `,
});

const financialInstrumentPredictionFlow = ai.defineFlow(
  {
    name: 'financialInstrumentPredictionFlow',
    inputSchema: FinancialInstrumentPredictionInputSchema,
    outputSchema: FinancialInstrumentPredictionOutputSchema,
  },
  async input => {
    const {output} = await financialInstrumentPredictionPrompt(input);
    return output!;
  }
);
