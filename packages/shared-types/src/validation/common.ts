import { z } from "zod";


//common validators
//CUID validator (prisma default id format)
export const cuidSchema = z.string()

//UUID validator
export const uuidSchema = z.string()

//pagination params
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
})

export type PaginationInput = z.infer<typeof paginationSchema>;

//date range filter
export const dateRangeSchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
}).refine(
    (data) => {
        if (!data.startDate || !data.endDate) return true;
        return data.startDate <= data.endDate;
    },
    {
        message: "Start date must be before the end date"
    }
);

export type DateRangeInput = z.infer<typeof dateRangeSchema>;

//sort order
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

