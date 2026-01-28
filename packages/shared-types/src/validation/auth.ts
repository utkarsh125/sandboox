import z from "zod";


//Email schema
const emailSchema = z.email();

const passwordSchema = z.string().min(8);

const nameSchema = z.string().min(2).max(128);

//signup schema
export const signupSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
})

export type SignUpInput = z.infer<typeof signupSchema>;

//sign in schema
export const signInSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required')
})


export type SignInInput = z.infer<typeof signInSchema>;

//todo: add ep for password reset
//password reset request 
export const passwordResetRequestSchema = z.object({
    email: emailSchema,
})

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

//password reset
export const passwordResetSchema = z.object({
    token: z.string(),
    password: passwordSchema,
})

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
