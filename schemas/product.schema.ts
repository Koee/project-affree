import { z } from 'zod';

export const ProductSchema = z.object({
    id: z.union([z.string(), z.number()]),
    name: z.string().min(1),
    price: z.number().nonnegative(),
    storeName: z.string().min(1).optional(),
    imageUrl: z.string().url().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
});

export const ProductListSchema = z.array(ProductSchema);

export type Product = z.infer<typeof ProductSchema>;