import { useState } from 'react'
import styled from 'styled-components'
import { FaArrowLeft, FaArrowRight, FaScissors } from 'react-icons/fa6'
import { Button, ErrorText, Field, Input, Label, Spinner } from '../components/ui'
import { createClient, getClientByPhone, normalizePhone } from '../clients'
import { isPhoneRemembered, getSavedPhone, savePhone } from '../utils/storage'

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 2rem 1.5rem;
  text-align: center;
  margin-top: 2rem;
`

const Logo = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-lg);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  margin-bottom: 1rem;
`

const Title = styled.h1`
  font-size: 1.35rem;
  margin: 0 0 0.25rem;
  color: var(--color-text);
`

const Subtitle = styled.p`
  margin: 0 0 1.5rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
`

const Form = styled.form`
  text-align: left;
`

const RememberRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  user-select: none;
`

const Switch = styled.span`
  position: relative;
  width: 2.5rem;
  height: 1.4rem;
  border-radius: var(--radius-full);
  background: ${({ $on }) => ($on ? 'var(--color-primary)' : 'var(--color-border-strong)')};
  transition: background 0.15s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 0.15rem;
    left: ${({ $on }) => ($on ? '1.25rem' : '0.15rem')};
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    transition: left 0.15s ease;
  }
`

const FieldHint = styled.p`
  margin: 0.375rem 0 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
`

const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1rem;

  &:hover {
    color: var(--color-text);
  }
`

const Notice = styled.div`
  margin-bottom: 1rem;
`

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function todayString() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function validateBirthday(value) {
  if (!value) return 'La fecha de cumpleaños es obligatoria.'
  const [y, m, d] = value.split('-').map(Number)
  const birth = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (Number.isNaN(birth.getTime())) return 'Ingresá una fecha válida.'
  if (birth > today) return 'La fecha de cumpleaños no puede ser en el futuro.'
  return ''
}

function LoginGate({ onEnter }) {
  const [phone, setPhone] = useState(getSavedPhone)
  const [remember, setRemember] = useState(isPhoneRemembered)
  const [phase, setPhase] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [birthday, setBirthday] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleLogin = async (event) => {
    event.preventDefault()
    const normalized = normalizePhone(phone)
    if (!normalized) {
      setError('Ingresá tu número de celular.')
      return
    }
    if (normalized.length !== 10) {
      setError('Ingresá un celular válido.')
      return
    }

    setError('')
    setBusy(true)
    try {
      const client = await getClientByPhone(normalized)
      if (client) {
        savePhone(normalized, remember)
        onEnter(client)
      } else {
        setPhone(normalized)
        setPhase('register')
        setBusy(false)
      }
    } catch (err) {
      console.error(err)
      setError('No se pudo verificar el celular. Intentalo de nuevo.')
      setBusy(false)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!name.trim()) nextErrors.name = 'El nombre es obligatorio.'

    if (email.trim() && !EMAIL_RE.test(email.trim())) {
      nextErrors.email = 'Ingresá un correo electrónico válido.'
    }

    const birthdayError = validateBirthday(birthday)
    if (birthdayError) nextErrors.birthday = birthdayError

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setBusy(true)
    setError('')
    try {
      const client = await createClient({
        name: name.trim(),
        phone,
        email: email.trim() || null,
        birthday,
      })
      savePhone(phone, remember)
      onEnter(client)
    } catch (err) {
      console.error(err)
      setError('No se pudo crear el registro. Intentalo de nuevo.')
      setBusy(false)
    }
  }

  if (phase === 'register') {
    return (
      <Card>
        <BackLink type="button" onClick={() => setPhase('login')}>
          <FaArrowLeft size={13} />
          Cambiar celular
        </BackLink>
        <Title>¡Bienvenido!</Title>
        <Subtitle>No encontramos tu registro. Completá tus datos.</Subtitle>

        {error && (
          <Notice>
            <span style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>
              {error}
            </span>
          </Notice>
        )}

        <Form id="login-register-form" onSubmit={handleRegister}>
          <Field>
            <Label htmlFor="reg-name">Nombre completo</Label>
            <Input
              id="reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. María Pérez"
              $invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && <ErrorText>{fieldErrors.name}</ErrorText>}
          </Field>
          <Field>
            <Label htmlFor="reg-birthday">Fecha de cumpleaños</Label>
            <Input
              id="reg-birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              max={todayString()}
              $invalid={!!fieldErrors.birthday}
            />
            <FieldHint>
              La usaremos para enviarte promociones en tu cumpleaños.
            </FieldHint>
            {fieldErrors.birthday && (
              <ErrorText>{fieldErrors.birthday}</ErrorText>
            )}
          </Field>
          <Field>
            <Label htmlFor="reg-email">Correo electrónico</Label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej. maria@email.com"
              inputMode="email"
              $invalid={!!fieldErrors.email}
            />
            {fieldErrors.email && <ErrorText>{fieldErrors.email}</ErrorText>}
          </Field>
        </Form>

        <Button
          type="submit"
          form="login-register-form"
          disabled={busy}
          style={{ width: '100%' }}
        >
          {busy ? (
            <>
              <Spinner $light />
              Registrando...
            </>
          ) : (
            <>
              Registrarme y entrar
              <FaArrowRight size={14} />
            </>
          )}
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      <Logo>
        <FaScissors size={26} />
      </Logo>
      <Title>¡Bienvenido!</Title>
      <Subtitle>Ingresá tu número de celular para continuar.</Subtitle>

      <Form id="login-gate-form" onSubmit={handleLogin}>
        <Field>
          <Label htmlFor="login-phone">Tu número de celular</Label>
          <Input
            id="login-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej. 3001234567"
            inputMode="tel"
            autoFocus
          />
        </Field>

        <RememberRow>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            style={{ display: 'none' }}
          />
          <Switch $on={remember} />
          Recuérdame
        </RememberRow>

        {error && <ErrorText>{error}</ErrorText>}
      </Form>

      <Button
        type="submit"
        form="login-gate-form"
        disabled={busy}
        style={{ width: '100%' }}
      >
        {busy ? (
          <>
            <Spinner $light />
            Verificando...
          </>
        ) : (
          <>
            Ingresar
            <FaArrowRight size={14} />
          </>
        )}
      </Button>
    </Card>
  )
}

export default LoginGate