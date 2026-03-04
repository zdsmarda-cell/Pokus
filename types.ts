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

export enum StopStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface DeliveryStop {
  id: string;
  address: string;
  note?: string;
  status: StopStatus;
}

export interface AccessLog {
  id: string;
  timestamp: number;
  cardId: string;
  userName: string | null;
  granted: boolean;
}

export type AppMode = 'TOTEM' | 'LOGISTICS' | 'SECURITY';