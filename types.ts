export interface SpiritAnimalData {
  animal: string;
  reason: string;
  visual_prompt: string;
}

export interface GenerationResult extends SpiritAnimalData {
  imageUrl: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}