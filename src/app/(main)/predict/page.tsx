import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PredictionForm } from './prediction-form';
import { BotMessageSquare } from 'lucide-react';

export default function PredictPage() {
  return (
    <div className="container mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Financial Predictions
        </h1>
        <p className="text-muted-foreground mt-2">
          Use our AI to get predictions on financial instruments and market conditions.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="flex-shrink-0">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <BotMessageSquare className="h-6 w-6" />
                </div>
            </div>
            <div className="flex-1">
                <CardTitle>Ask the AI</CardTitle>
                <CardDescription>
                Describe a financial instrument or market condition below. Our AI will analyze your prompt and provide a prediction based on real-world data.
                </CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <PredictionForm />
        </CardContent>
      </Card>
    </div>
  );
}
