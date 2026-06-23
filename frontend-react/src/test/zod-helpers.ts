import { z } from "zod";

// Helper para extraer errores de validación de Zod
export function getZodErrors(schema: z.ZodTypeAny, data: unknown) {
  const result = schema.safeParse(data);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.message);
}
