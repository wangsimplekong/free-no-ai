import { z } from 'zod';

export const SubscribeDTO = z.object({
  plan_id: z.string().uuid(),
  duration: z.number().int().positive(),
  auto_renew: z.boolean()
});

export type SubscribeDTO = z.infer<typeof SubscribeDTO>;

export interface SubscribeResponseDTO {
  order_id: string;
  amount: number;
  pay_url: string;
}