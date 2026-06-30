export interface PredictionResult {
  readonly prediction_id: string;
  readonly analysis_id: string;
  readonly probability: number;
  readonly confidence: number;
  readonly predicted_class: number;
  readonly model_version: string;
  readonly inference_time: number;
  readonly created_at: string;
}

export interface PredictionValidation {
  readonly isValid: boolean;
  readonly message?: string;
}
