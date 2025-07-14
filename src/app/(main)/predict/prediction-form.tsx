'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getPrediction, type PredictionState } from './actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles } from 'lucide-react';

const initialState: PredictionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        'Get Prediction'
      )}
    </Button>
  );
}

export function PredictionForm() {
  const [state, formAction] = useFormState(getPrediction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Textarea
          name="prompt"
          placeholder="e.g., 'What is the outlook for US Treasury bonds for the rest of the year?'"
          rows={4}
          required
        />
        {state.errors?.prompt && (
          <p className="text-sm font-medium text-destructive">
            {state.errors.prompt.join(', ')}
          </p>
        )}
      </div>
      <SubmitButton />

      {state.message && !state.prediction && (
        <Alert variant={state.errors ? 'destructive' : 'default'} className="mt-4">
          <AlertTitle>
            {state.errors ? 'Error' : 'Notice'}
          </AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.prediction && (
        <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold flex items-center mb-2">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI Prediction
            </h3>
            <div className="p-4 bg-secondary rounded-lg">
                <p className="text-secondary-foreground whitespace-pre-wrap">
                    {state.prediction}
                </p>
            </div>
        </div>
      )}
    </form>
  );
}
