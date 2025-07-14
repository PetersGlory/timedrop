'use server';

import { z } from 'zod';
import { financialInstrumentPrediction } from '@/ai/flows/financial-instrument-prediction';

const PredictionSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }),
});

export type PredictionState = {
  message?: string | null;
  prediction?: string | null;
  errors?: {
    prompt?: string[];
  };
};

export async function getPrediction(
  prevState: PredictionState,
  formData: FormData,
): Promise<PredictionState> {
  const validatedFields = PredictionSchema.safeParse({
    prompt: formData.get('prompt'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid prompt. Please correct the errors.',
    };
  }
  
  const { prompt } = validatedFields.data;

  try {
    const result = await financialInstrumentPrediction({ prompt });
    return { message: 'Prediction successful.', prediction: result.prediction };
  } catch (error) {
    console.error('Prediction failed:', error);
    return { message: 'Failed to generate prediction. Please try again later.' };
  }
}
