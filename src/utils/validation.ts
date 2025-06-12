
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
