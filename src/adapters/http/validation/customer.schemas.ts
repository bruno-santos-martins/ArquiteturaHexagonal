import { z } from 'zod';

const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const CreateCustomerBodySchema = z
  .object({
    name: z.string().trim().min(2, 'Name must have at least 2 characters'),
    age: z.coerce.number().int('Age must be an integer').min(0, 'Age must be >= 0'),
    cpf: z
      .string()
      .transform((value) => digitsOnly(value))
      .refine((value) => /^\d{11}$/.test(value), 'CPF must have 11 digits')
  })
  .strict();

export type CreateCustomerBodyDto = z.infer<typeof CreateCustomerBodySchema>;

export const CustomerParamsSchema = z
  .object({
    id: z.string().uuid('Invalid id')
  })
  .strict();

export type CustomerParamsDto = z.infer<typeof CustomerParamsSchema>;
