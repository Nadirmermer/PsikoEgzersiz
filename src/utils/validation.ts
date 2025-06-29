/**
 * UUID format validation utility functions
 */

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Validates if a string is a valid UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  return UUID_REGEX.test(uuid)
}

/**
 * Validates professional ID format and provides user feedback
 */
export const validateProfessionalId = (id: string): { isValid: boolean; message?: string } => {
  if (!id.trim()) {
    return { isValid: false, message: 'Uzman ID boş olamaz' }
  }

  if (!isValidUUID(id.trim())) {
    return { isValid: false, message: 'Lütfen geçerli bir uzman ID formatı girin' }
  }

  return { isValid: true }
}

/**
 * Checks if a professional ID exists in the database
 */
export const checkProfessionalExists = async (professionalId: string): Promise<{ exists: boolean; message?: string }> => {
  try {
    const { supabase } = await import('../lib/supabase')
    
    if (!supabase) {
      return { exists: false, message: 'Veritabanı bağlantısı mevcut değil' }
    }

    const { data, error } = await supabase
      .from('professionals')
      .select('id')
      .eq('id', professionalId)
      .limit(1)

    if (error) {
      console.error('Professional check error:', error)
      return { exists: false, message: 'Uzman kontrolü sırasında hata oluştu' }
    }

    if (!data || data.length === 0) {
      return { exists: false, message: 'Girilen uzman ID\'si bulunamadı. Lütfen kontrol edin.' }
    }

    return { exists: true }
  } catch (error) {
    console.error('Professional existence check error:', error)
    return { exists: false, message: 'Uzman kontrolü sırasında hata oluştu' }
  }
}

/**
 * Authentication validation utilities
 */

// Email regex pattern (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim())
}

/**
 * Password strength levels
 */
export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordStrength {
  level: PasswordStrengthLevel
  score: number // 0-4
  feedback: string[]
  isValid: boolean
}

/**
 * Validates password strength and provides feedback
 */
export const validatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = []
  let score = 0
  
  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('En az 8 karakter olmalı')
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('En az bir küçük harf içermeli')
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('En az bir büyük harf içermeli')
  }
  
  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('En az bir rakam içermeli')
  }
  
  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1
  } else {
    feedback.push('En az bir özel karakter içermeli (!@#$%^&* vb.)')
  }
  
  // Determine level based on score
  let level: PasswordStrengthLevel
  if (score <= 1) {
    level = 'weak'
  } else if (score === 2) {
    level = 'fair'
  } else if (score === 3) {
    level = 'good'
  } else {
    level = 'strong'
  }
  
  return {
    level,
    score: Math.max(0, score - 1), // Normalize to 0-4
    feedback,
    isValid: score >= 4 && password.length >= 8
  }
}

/**
 * Display name validation
 */
export const validateDisplayName = (name: string): { isValid: boolean; message?: string } => {
  const trimmed = name.trim()
  
  if (!trimmed) {
    return { isValid: false, message: 'Görünen ad boş olamaz' }
  }
  
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Görünen ad en az 2 karakter olmalı' }
  }
  
  if (trimmed.length > 50) {
    return { isValid: false, message: 'Görünen ad 50 karakterden uzun olamaz' }
  }
  
  // Check for invalid characters (allow letters, numbers, spaces, and common punctuation)
  if (!/^[a-zA-ZçğıöşüÇĞIİÖŞÜ0-9\s\.\-_]+$/.test(trimmed)) {
    return { isValid: false, message: 'Görünen ad sadece harf, rakam ve temel noktalama işaretleri içerebilir' }
  }
  
  return { isValid: true }
}

/**
 * Email validation with detailed feedback
 */
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  const trimmed = email.trim()
  
  if (!trimmed) {
    return { isValid: false, message: 'E-posta adresi boş olamaz' }
  }
  
  if (!isValidEmail(trimmed)) {
    return { isValid: false, message: 'Geçerli bir e-posta adresi girin' }
  }
  
  return { isValid: true }
}

/**
 * Password confirmation validation
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): { isValid: boolean; message?: string } => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Şifre tekrarını girin' }
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Şifreler eşleşmiyor' }
  }
  
  return { isValid: true }
}
