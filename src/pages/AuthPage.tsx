import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scissors } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Label } from '../components/ui'
import { useAuthStore } from '../store'
import { ApiError } from '../lib/api.client'

// ── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

const registerSchema = z.object({
  name:     z.string().min(3, 'Nome deve ter ao menos 3 caracteres')
              .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, 'Nome inválido')
              .refine((v) => v.trim().split(/\s+/).length >= 2, 'Informe nome e sobrenome'),
  phone:    z.string().min(10, 'Telefone inválido'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

type LoginValues    = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

// ── Component ─────────────────────────────────────────────────────────────────

interface AuthPageProps {
  onSuccess?: () => void
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [serverError, setServerError] = useState<string | null>(null)
  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const handleSuccess = () => {
    if (onSuccess) { onSuccess(); return }
    const role = useAuthStore.getState().user?.role
    navigate(role === 'admin' ? '/admin' : '/', { replace: true })
  }

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: 'onTouched' })
  const registerForm = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), mode: 'onTouched' })

  const handleLogin = loginForm.handleSubmit(async (values) => {
    setServerError(null)
    try {
      await login(values.email, values.password)
      handleSuccess()
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Erro ao entrar. Tente novamente.')
    }
  })

  const handleRegister = registerForm.handleSubmit(async (values) => {
    setServerError(null)
    try {
      await register(values.name, values.phone, values.email, values.password)
      handleSuccess()
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Erro ao cadastrar. Tente novamente.')
    }
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
    let masked = digits
    if (digits.length > 10)      masked = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
    else if (digits.length > 6)  masked = `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
    else if (digits.length > 2)  masked = `(${digits.slice(0,2)}) ${digits.slice(2)}`
    else if (digits.length > 0)  masked = `(${digits}`
    registerForm.setValue('phone', masked, { shouldValidate: registerForm.formState.touchedFields.phone })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6"
      >
        {/* Logo */}
        <div className="text-center space-y-1">
          <div className="flex justify-center">
            <Scissors className="h-8 w-8 text-pink-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Salão da Leila</h1>
          <p className="text-sm text-gray-500">
            {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1 gap-1">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setServerError(null) }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === m ? 'bg-pink-500 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <Field label="E-mail" error={loginForm.formState.errors.email?.message}>
                <Input type="email" placeholder="seu@email.com" {...loginForm.register('email')} />
              </Field>
              <Field label="Senha" error={loginForm.formState.errors.password?.message}>
                <Input type="password" placeholder="••••••" {...loginForm.register('password')} />
              </Field>
              {serverError && <p className="text-xs text-red-500 text-center">{serverError}</p>}
              <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                {loginForm.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <Field label="Nome completo" error={registerForm.formState.errors.name?.message}>
                <Input placeholder="Nome e sobrenome" {...registerForm.register('name')} />
              </Field>
              <Field label="Telefone / WhatsApp" error={registerForm.formState.errors.phone?.message}>
                <Input
                  placeholder="(11) 99999-9999"
                  inputMode="tel"
                  {...registerForm.register('phone')}
                  onChange={handlePhoneChange}
                />
              </Field>
              <Field label="E-mail" error={registerForm.formState.errors.email?.message}>
                <Input type="email" placeholder="seu@email.com" {...registerForm.register('email')} />
              </Field>
              <Field label="Senha" error={registerForm.formState.errors.password?.message}>
                <Input type="password" placeholder="Mínimo 6 caracteres" {...registerForm.register('password')} />
              </Field>
              {serverError && <p className="text-xs text-red-500 text-center">{serverError}</p>}
              <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
                {registerForm.formState.isSubmitting ? 'Cadastrando...' : 'Criar conta'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
