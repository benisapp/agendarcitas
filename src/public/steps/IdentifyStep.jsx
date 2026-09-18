import { useState } from 'react'
import styled from 'styled-components'
import { FaArrowLeft } from 'react-icons/fa6'
import { createClient, getClientByPhone, normalizePhone } from '../../clients'
import { getSavedPhone, savePhone } from '../../utils/storage'
import {
  Alert,
  BarSpacer,
  BottomBar,
  BottomBarInner,
  BottomPrimary,
  ErrorText,
  Field,
  Input,
  Label,
  Spinner,
} from '../../components/ui'

const Title = styled.h1`
  font-size: 1.35rem;
  margin: 0 0 0.25rem;
  color: var(--color-text);
`

const Subtitle = styled.p`
  margin: 0 0 1.25rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
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

const InfoCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.25rem;
`

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
`

const InfoLabel = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-muted);
`

const InfoValue = styled.span`
  font-weight: 600;
  color: var(--color-text);
`

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function IdentifyStep({ onBack, onClientReady }) {
  const [phone, setPhone] = useState(getSavedPhone)
  const [mode, setMode] = useState('lookup')
  const [existing, setExisting] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const resetToLookup = () => {
    setMode('lookup')
    setExisting(null)
    setName('')
    setEmail('')
    setError('')
    setFieldErrors({})
  }

  const validatePhone = (value) => {
    const normalized = normalizePhone(value)
    if (!normalized) return 'El celular es obligatorio.'
    if (normalized.length !== 10) return 'Ingresá un celular válido.'
    return ''
  }

  const handleLookup = async (event) => {
    event.preventDefault()
    const phoneError = validatePhone(phone)
    if (phoneError) {
      setError(phoneError)
      return
    }

    const phoneValue = normalizePhone(phone)
    savePhone(phoneValue)
    setError('')
    setBusy(true)
    try {
      const client = await getClientByPhone(phoneValue)
      if (client) {
        setExisting(client)
        setMode('found')
      } else {
        setPhone(phoneValue)
        setMode('new')
      }
    } catch (err) {
      console.error(err)
      setError('No se pudo buscar el celular. Intentalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!name.trim()) nextErrors.name = 'El nombre es obligatorio.'

    const phoneError = validatePhone(phone)
    if (phoneError) nextErrors.phone = phoneError

    if (email.trim() && !EMAIL_RE.test(email.trim())) {
      nextErrors.email = 'Ingresá un correo electrónico válido.'
    }

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setBusy(true)
    setError('')
    try {
      savePhone(normalizePhone(phone))
      const client = await createClient({
        name: name.trim(),
        phone: normalizePhone(phone),
        email: email.trim() || null,
      })
      onClientReady(client)
    } catch (err) {
      console.error(err)
      setError('No se pudo crear el cliente. Intentalo de nuevo.')
      setBusy(false)
    }
  }

  if (mode === 'found') {
    return (
      <div>
        <BackLink type="button" onClick={resetToLookup}>
          <FaArrowLeft size={13} />
          Cambiar celular
        </BackLink>
        <Title>¡Hola, {existing.name}!</Title>
        <Subtitle>Encontramos el registro. Confirmá los datos.</Subtitle>

        <InfoCard>
          <InfoRow>
            <InfoLabel>Celular</InfoLabel>
            <InfoValue>{existing.phone}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Nombre</InfoLabel>
            <InfoValue>{existing.name}</InfoValue>
          </InfoRow>
          {existing.email && (
            <InfoRow>
              <InfoLabel>Correo electrónico</InfoLabel>
              <InfoValue>{existing.email}</InfoValue>
            </InfoRow>
          )}
        </InfoCard>

        <BarSpacer />
        <BottomBar>
          <BottomBarInner>
            <BottomPrimary type="button" onClick={() => onClientReady(existing)}>
              Continuar
            </BottomPrimary>
          </BottomBarInner>
        </BottomBar>
      </div>
    )
  }

  if (mode === 'new') {
    return (
      <div>
        <BackLink type="button" onClick={resetToLookup}>
          <FaArrowLeft size={13} />
          Volver
        </BackLink>
        <Title>Nuevo cliente</Title>
        <Subtitle>No encontramos ese celular. Completá los datos.</Subtitle>

        {error && (
          <Notice>
            <Alert tone="error">{error}</Alert>
          </Notice>
        )}

        <form id="identify-new-form" onSubmit={handleCreate}>
          <Field>
            <Label htmlFor="client-name">Nombre completo</Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. María Pérez"
              $invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && <ErrorText>{fieldErrors.name}</ErrorText>}
          </Field>
          <Field>
            <Label htmlFor="client-phone">Número de celular</Label>
            <Input
              id="client-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 3001234567"
              inputMode="tel"
              $invalid={!!fieldErrors.phone}
            />
            {fieldErrors.phone && <ErrorText>{fieldErrors.phone}</ErrorText>}
          </Field>
          <Field>
            <Label htmlFor="client-email">Correo electrónico</Label>
            <Input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej. maria@email.com"
              inputMode="email"
              $invalid={!!fieldErrors.email}
            />
            {fieldErrors.email && <ErrorText>{fieldErrors.email}</ErrorText>}
          </Field>
        </form>

        <BarSpacer />
        <BottomBar>
          <BottomBarInner>
            <BottomPrimary
              type="submit"
              form="identify-new-form"
              disabled={busy}
            >
              {busy ? (
                <>
                  <Spinner $light />
                  Guardando...
                </>
              ) : (
                'Crear y continuar'
              )}
            </BottomPrimary>
          </BottomBarInner>
        </BottomBar>
      </div>
    )
  }

  return (
    <div>
      <BackLink type="button" onClick={onBack}>
        <FaArrowLeft size={13} />
        Volver
      </BackLink>
      <Title>¿Para quién es la cita?</Title>
      <Subtitle>Ingresá el celular del cliente.</Subtitle>

      {error && (
        <Notice>
          <Alert tone="error">{error}</Alert>
        </Notice>
      )}

      <form id="identify-lookup-form" onSubmit={handleLookup}>
        <Field>
          <Label htmlFor="client-phone-lookup">Número de celular</Label>
          <Input
            id="client-phone-lookup"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej. 3001234567"
            inputMode="tel"
            autoFocus
          />
        </Field>
      </form>

      <BarSpacer />
      <BottomBar>
        <BottomBarInner>
          <BottomPrimary
            type="submit"
            form="identify-lookup-form"
            disabled={busy}
          >
            {busy ? (
              <>
                <Spinner $light />
                Buscando...
              </>
            ) : (
              'Continuar'
            )}
          </BottomPrimary>
        </BottomBarInner>
      </BottomBar>
    </div>
  )
}

export default IdentifyStep
