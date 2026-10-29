import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(128, "Senha muito longa"),
});

export const signUpSchema = loginSchema.extend({
  confirmPassword: z.string().optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(128, "Senha muito longa"),
  confirmPassword: z.string().min(6, "Confirme a senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

export const bookingFormSchema = z.object({
  clientName: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(80, "Nome muito longo"),
  phone: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 11;
  }, "Telefone deve ter 10 ou 11 dígitos"),
  petName: z.string().trim().min(1, "Nome do pet é obrigatório").max(40, "Nome muito longo"),
  breed: z.string().trim().max(40, "Raça muito longa").optional().or(z.literal("")),
  notes: z.string().trim().max(500, "Observação muito longa").optional().or(z.literal("")),
  needsTaxi: z.boolean(),
  consent: z.literal(true, { errorMap: () => ({ message: "Você precisa concordar com os termos" }) }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type BookingFormInput = z.infer<typeof bookingFormSchema>;

export function validateField<T extends z.ZodTypeAny>(
  schema: T,
  field: string,
  value: unknown,
): string | null {
  const result = schema.safeParse({ [field]: value });
  if (result.success) return null;
  const issue = result.error.issues.find((i) => i.path[0] === field);
  return issue?.message ?? null;
}

export function zodErrorsToRecord(error: z.ZodError): Record<string, string> {
  const record: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!record[key]) record[key] = issue.message;
  }
  return record;
}
