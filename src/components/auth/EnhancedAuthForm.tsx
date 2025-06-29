import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { PasswordStrengthIndicator } from '@/components/ui/password-strength'

import { signInSchema, signUpSchema, SignInFormData, SignUpFormData } from '@/schemas/authSchemas'
import { useAuth } from '@/contexts/AuthContext'

interface EnhancedAuthFormProps {
  onSuccess?: () => void
  className?: string
}

const EnhancedAuthForm: React.FC<EnhancedAuthFormProps> = ({ 
  onSuccess,
  className
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { signIn, signUp } = useAuth()

  // Sign in form
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // Sign up form  
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      displayName: '',
      password: '',
      confirmPassword: ''
    }
  })

  const currentForm = isLoginMode ? signInForm : signUpForm
  const currentPassword = isLoginMode ? signInForm.watch('password') : signUpForm.watch('password')

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true)
    try {
      await signIn(data.email, data.password)
      signInForm.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Sign in error:', error)
      // Error handling is done in AuthContext
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true)
    try {
      await signUp(data.email, data.password, data.displayName)
      signUpForm.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Sign up error:', error)
      // Error handling is done in AuthContext
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeToggle = (loginMode: boolean) => {
    setIsLoginMode(loginMode)
    setShowPassword(false)
    setShowConfirmPassword(false)
    // Reset both forms when switching
    signInForm.reset()
    signUpForm.reset()
  }

  const onSubmit = isLoginMode ? handleSignIn : handleSignUp

  return (
    <div className={className}>
      {/* Mode Toggle */}
      <div className="flex rounded-lg border p-1 bg-muted mb-4">
        <Button
          type="button"
          variant={isLoginMode ? "default" : "ghost"}
          size="sm"
          onClick={() => handleModeToggle(true)}
          className="flex-1"
          disabled={isLoading}
        >
          Giriş Yap
        </Button>
        <Button
          type="button"
          variant={!isLoginMode ? "default" : "ghost"}
          size="sm"
          onClick={() => handleModeToggle(false)}
          className="flex-1"
          disabled={isLoading}
        >
          Kayıt Ol
        </Button>
      </div>

      <Form {...currentForm}>
        <form onSubmit={currentForm.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={currentForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-posta</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="uzman@ornek.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Display Name Field (Only for Sign Up) */}
          {!isLoginMode && (
            <FormField
              control={signUpForm.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Görünen Ad</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Dr. Ad Soyad"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Password Field */}
          <FormField
            control={currentForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şifre</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      autoComplete={isLoginMode ? "current-password" : "new-password"}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
                
                {/* Password Strength Indicator (Only for Sign Up) */}
                {!isLoginMode && field.value && (
                  <PasswordStrengthIndicator
                    password={field.value}
                    className="mt-2"
                  />
                )}
              </FormItem>
            )}
          />

          {/* Confirm Password Field (Only for Sign Up) */}
          {!isLoginMode && (
            <FormField
              control={signUpForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre Tekrarı</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={isLoading}
                        autoComplete="new-password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                İşleniyor...
              </>
            ) : (
              isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export { EnhancedAuthForm } 