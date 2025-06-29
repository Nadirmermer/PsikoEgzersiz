import { z } from 'zod'
import { validatePasswordStrength, validateEmail, validateDisplayName } from '@/utils/validation'

/**
 * Base email validation schema
 */
const emailSchema = z
  .string()
  .min(1, 'E-posta adresi gereklidir')
  .refine((email) => validateEmail(email).isValid, {
    message: 'Geçerli bir e-posta adresi girin'
  })

/**
 * Password validation schema with strength checking
 */
const passwordSchema = z
  .string()
  .min(1, 'Şifre gereklidir')
  .refine((password) => validatePasswordStrength(password).isValid, {
    message: 'Şifre gereksinimlerini karşılamalıdır'
  })

/**
 * Display name validation schema
 */
const displayNameSchema = z
  .string()
  .min(1, 'Görünen ad gereklidir')
  .refine((name) => validateDisplayName(name).isValid, {
    message: validateDisplayName('').message || 'Geçersiz görünen ad'
  })

/**
 * Sign in form schema
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Şifre gereklidir')
})

/**
 * Sign up form schema with password confirmation
 */
export const signUpSchema = z.object({
  email: emailSchema,
  displayName: displayNameSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Şifre tekrarı gereklidir')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword']
})

/**
 * Type exports for use in components
 */
export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema> 