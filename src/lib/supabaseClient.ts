
import { supabase } from './supabase'
import { ExerciseResult } from '../utils/localStorage'

export interface ClientStatisticData {
  professional_id: string
  client_identifier: string
  exercise_data: any
  is_client_mode_session: boolean
}

export const saveToSupabase = async (data: ClientStatisticData): Promise<boolean> => {
  if (!supabase) {
    console.error('saveToSupabase - Supabase not configured')
    return false
  }

  console.log('saveToSupabase - Attempting to save:', {
    professional_id: data.professional_id,
    client_identifier: data.client_identifier,
    is_client_mode_session: data.is_client_mode_session,
    exercise_data_type: typeof data.exercise_data,
    exercise_data_keys: data.exercise_data ? Object.keys(data.exercise_data) : 'null'
  })

  try {
    // Get current user info for debugging
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('saveToSupabase - Current user:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      userError 
    })

    const insertData = {
      professional_id: data.professional_id,
      client_identifier: data.client_identifier,
      exercise_data: data.exercise_data,
      is_client_mode_session: data.is_client_mode_session,
      session_date: new Date().toISOString()
    }

    console.log('saveToSupabase - Insert data prepared:', insertData)

    const { data: result, error } = await supabase
      .from('client_statistics')
      .insert([insertData])
      .select()

    if (error) {
      console.error('saveToSupabase - Supabase save error:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return false
    }

    console.log('saveToSupabase - Successfully saved to Supabase:', result)
    return true
  } catch (error) {
    console.error('saveToSupabase - Unexpected error:', error)
    return false
  }
}

export const uploadLocalDataToSupabase = async (
  professionalId: string, 
  clientIdentifier: string, 
  localData: ExerciseResult[]
): Promise<{ success: boolean; uploaded: number; failed: number }> => {
  if (!supabase) {
    console.log('uploadLocalDataToSupabase - Supabase not configured')
    return { success: false, uploaded: 0, failed: 0 }
  }

  console.log('uploadLocalDataToSupabase - Starting upload:', { 
    professionalId, 
    clientIdentifier, 
    localDataCount: localData.length 
  })

  let uploaded = 0
  let failed = 0

  for (const result of localData) {
    console.log('uploadLocalDataToSupabase - Processing result:', result)
    
    const success = await saveToSupabase({
      professional_id: professionalId,
      client_identifier: clientIdentifier,
      exercise_data: result.details || result,
      is_client_mode_session: false
    })

    if (success) {
      uploaded++
      console.log('uploadLocalDataToSupabase - Uploaded result successfully')
    } else {
      failed++
      console.log('uploadLocalDataToSupabase - Failed to upload result')
    }
  }

  console.log('uploadLocalDataToSupabase - Upload completed:', { uploaded, failed })
  return { success: failed === 0, uploaded, failed }
}

export const syncPendingData = async (): Promise<void> => {
  if (!supabase) {
    console.log('syncPendingData - Supabase not configured')
    return
  }

  const pendingDataStr = localStorage.getItem('pendingSyncData')
  if (!pendingDataStr) {
    console.log('syncPendingData - No pending data to sync')
    return
  }

  console.log('syncPendingData - Found pending data to sync')

  try {
    const pendingData = JSON.parse(pendingDataStr)
    const successfulSyncs: string[] = []

    console.log('syncPendingData - Pending data items:', Object.keys(pendingData).length)

    for (const [key, data] of Object.entries(pendingData)) {
      console.log('syncPendingData - Syncing pending item:', { key, data })
      const success = await saveToSupabase(data as ClientStatisticData)
      if (success) {
        successfulSyncs.push(key)
        console.log('syncPendingData - Successfully synced:', key)
      } else {
        console.log('syncPendingData - Failed to sync:', key)
      }
    }

    // Remove successfully synced data
    if (successfulSyncs.length > 0) {
      const remainingData = { ...pendingData }
      successfulSyncs.forEach(key => delete remainingData[key])
      
      if (Object.keys(remainingData).length === 0) {
        localStorage.removeItem('pendingSyncData')
        console.log('syncPendingData - All pending data synced, cleared storage')
      } else {
        localStorage.setItem('pendingSyncData', JSON.stringify(remainingData))
        console.log('syncPendingData - Some items remain pending:', Object.keys(remainingData).length)
      }
    }
  } catch (error) {
    console.error('syncPendingData - Error:', error)
  }
}

export const addToPendingSync = (data: ClientStatisticData): void => {
  console.log('addToPendingSync - Adding to pending sync:', data)
  
  try {
    const existingStr = localStorage.getItem('pendingSyncData')
    const existing = existingStr ? JSON.parse(existingStr) : {}
    
    const key = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    existing[key] = data
    
    localStorage.setItem('pendingSyncData', JSON.stringify(existing))
    console.log('addToPendingSync - Added to pending sync with key:', key)
  } catch (error) {
    console.error('addToPendingSync - Error:', error)
  }
}
