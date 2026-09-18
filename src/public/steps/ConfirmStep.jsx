import { useState } from 'react'
import styled from 'styled-components'
import { FaArrowLeft } from 'react-icons/fa6'
import { APPOINTMENT_STATUS, createAppointment, getAppointmentsByDate } from '../../appointments'
import {
  Alert,
  BarSpacer,
  BottomBar,
  BottomBarInner,
  BottomPrimary,
  SecondaryButton,
  Spinner,
} from '../../components/ui'
import { formatDateLong, formatTime12h, isSlotInPast, overlaps } from '../../utils/dates'
import { formatDuration } from '../../utils/format'

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

const Summary = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.25rem;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
`

const RowLabel = styled.span`
  color: var(--color-text-muted);
  font-size: 0.875rem;
`

const RowValue = styled.span`
  font-weight: 600;
  color: var(--color-text);
  text-align: right;
`

const Notice = styled.div`
  margin-bottom: 1rem;
`

function ConfirmStep({ service, client, slot, onBack, onConfirmed }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    setSaving(true)
    setError('')

    try {
      if (isSlotInPast(slot.date, slot.startTime)) {
        setError('Este horario ya pasó. Elegí un horario futuro.')
        setSaving(false)
        return
      }

      const existing = await getAppointmentsByDate(slot.date)
      const conflict = existing.some(
        (appt) =>
          appt.status !== APPOINTMENT_STATUS.CANCELLED &&
          overlaps(slot.startTime, slot.endTime, appt.startTime, appt.endTime),
      )

      if (conflict) {
        setError('Ese horario ya no está disponible. Elegí otro.')
        setSaving(false)
        return
      }

      const appointment = await createAppointment({
        clientId: client.id,
        serviceId: service.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })

      onConfirmed(appointment)
    } catch (err) {
      console.error(err)
      setError('No se pudo agendar la cita. Intentalo de nuevo.')
      setSaving(false)
    }
  }

  return (
    <div>
      <BackLink type="button" onClick={onBack}>
        <FaArrowLeft size={13} />
        Volver
      </BackLink>
      <Title>Confirmá tu cita</Title>
      <Subtitle>Revisá los datos antes de agendar.</Subtitle>

      {error && (
        <Notice>
          <Alert tone="error">{error}</Alert>
        </Notice>
      )}

      <Summary>
        <Row>
          <RowLabel>Servicio</RowLabel>
          <RowValue>{service.name}</RowValue>
        </Row>
        <Row>
          <RowLabel>Duración</RowLabel>
          <RowValue>{formatDuration(service.duration)}</RowValue>
        </Row>
        <Row>
          <RowLabel>Fecha</RowLabel>
          <RowValue>{formatDateLong(slot.date)}</RowValue>
        </Row>
        <Row>
          <RowLabel>Hora</RowLabel>
          <RowValue>
            {formatTime12h(slot.startTime)} - {formatTime12h(slot.endTime)}
          </RowValue>
        </Row>
        <Row>
          <RowLabel>Cliente</RowLabel>
          <RowValue>{client.name}</RowValue>
        </Row>
      </Summary>

      <BarSpacer />
      <BottomBar>
        <BottomBarInner>
          <SecondaryButton type="button" onClick={onBack} disabled={saving}>
            Cambiar
          </SecondaryButton>
          <BottomPrimary type="button" onClick={handleConfirm} disabled={saving}>
            {saving ? (
              <>
                <Spinner $light />
                Agendando...
              </>
            ) : (
              'Confirmar cita'
            )}
          </BottomPrimary>
        </BottomBarInner>
      </BottomBar>
    </div>
  )
}

export default ConfirmStep
