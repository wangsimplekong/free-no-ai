import { z } from 'zod';
import { QuotaType } from '../../types/member.types';

export const QuotaConsumeDTO = z.object({
  quota_type: z.nativeEnum(QuotaType),
  amount: z.number().int().positive()
});

export type QuotaConsumeDTO = z.infer<typeof QuotaConsumeDTO>;

export interface QuotaStatusDTO {
  total: number;
  used: number;
  remaining: number;
  expire_time: string;
}

export interface QuotaResponseDTO {
  detection: QuotaStatusDTO;
  rewrite: QuotaStatusDTO;
}

export interface QuotaConsumeResponseDTO {
  success: boolean;
  remaining: number;
}