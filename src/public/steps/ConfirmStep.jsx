import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FaArrowLeft, FaCheck } from 'react-icons/fa6'
import { APPOINTMENT_STATUS, createAppointment, getAppointmentsByDate } from '../../appointments'
import {
  fetchDiscounts,
  applyDiscountToTotal,
  getApplicableDiscounts,
  getDefaultDiscount,
} from '../../discounts'
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
import { formatDuration, formatPrice } from '../../utils/format'

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

const ServicesHeader = styled.p`
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-gold-ink);
`

const ServicesBlock = styled.div`
  background: var(--color-primary-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.25rem 1rem;
  margin-bottom: 0.625rem;
`

const ServiceRow = styled.div`
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

const ServiceName = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-text);
`

const ServiceCheck = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-on-primary);
  flex-shrink: 0;
`

const TotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 0;
  border-top: 2px solid var(--color-border-strong);
  margin-top: 0.625rem;
`

const Notice = styled.div`
  margin-bottom: 1rem;
`

const Picker = styled.div`
  margin-bottom: 1.25rem;
`

const PickerTitle = styled.p`
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-gold-ink);
`

const PickerOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const PickerOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1.5px solid
    ${({ $selected }) =>
      $selected ? 'var(--color-primary)' : 'var(--color-border-strong)'};
  background: ${({ $selected }) =>
    $selected ? 'var(--color-primary-soft)' : 'var(--color-surface)'};
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: var(--color-primary);
  }
`

const PickerPercent = styled.span`
  color: var(--color-success);
  font-weight: 800;
  white-space: nowrap;
`

const DiscountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 0;
  font-weight: 600;
  color: var(--color-success);
`

const TotalRowValue = styled(RowValue)`
  color: var(--color-text);
  font-weight: 800;
`

function ConfirmStep({ services, client, slot, onBack, onConfirmed }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [discounts, setDiscounts] = useState([])
  const [selectedDiscountId, setSelectedDiscountId] = useState(null)

  useEffect(() => {
    let mounted = true
    fetchDiscounts()
      .then((list) => {
        if (mounted) setDiscounts(list)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const totalDuration = services.reduce((sum, s) => sum + (s.duration || 0), 0)
  const subtotal = services.every((s) => s.price != null)
    ? services.reduce((sum, s) => sum + s.price, 0)
    : null

  const applicableDiscounts = getApplicableDiscounts(
    slot.date,
    services.map((s) => s.id),
    discounts,
    client,
  )
  const selectedDiscount =
    applicableDiscounts.find((d) => d.id === selectedDiscountId) ||
    getDefaultDiscount(applicableDiscounts)
  const { discountAmount, total } = applyDiscountToTotal(
    subtotal ?? 0,
    selectedDiscount,
  )

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
        serviceIds: services.map((s) => s.id),
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        discountId: selectedDiscount?.id || null,
        discountTitle: selectedDiscount?.title || null,
        discountPercent: selectedDiscount?.percent ?? null,
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

      {applicableDiscounts.length > 1 && (
        <Picker>
          <PickerTitle>Elegí tu descuento</PickerTitle>
          <PickerOptions>
            {applicableDiscounts.map((discount) => (
              <PickerOption
                key={discount.id}
                type="button"
                $selected={selectedDiscount?.id === discount.id}
                onClick={() => setSelectedDiscountId(discount.id)}
              >
                <span>{discount.title}</span>
                <PickerPercent>{discount.percent}% OFF</PickerPercent>
              </PickerOption>
            ))}
          </PickerOptions>
        </Picker>
      )}

      <Summary>
        <ServicesHeader>Servicios</ServicesHeader>
        <ServicesBlock>
          {services.map((service) => (
            <ServiceRow key={service.id}>
              <ServiceName>
                <ServiceCheck>
                  <FaCheck size={10} />
                </ServiceCheck>
                {service.name}
              </ServiceName>
              <RowValue>{formatDuration(service.duration)}</RowValue>
            </ServiceRow>
          ))}
        </ServicesBlock>
        <TotalRow>
          <RowLabel>Duración total</RowLabel>
          <RowValue>{formatDuration(totalDuration)}</RowValue>
        </TotalRow>
        {subtotal != null && (
          <Row>
            <RowLabel>Subtotal</RowLabel>
            <RowValue>{formatPrice(subtotal)}</RowValue>
          </Row>
        )}
        {selectedDiscount && (
          <DiscountRow>
            <RowLabel>
              Descuento {selectedDiscount.title} ({selectedDiscount.percent}%)
            </RowLabel>
            <RowValue>-{formatPrice(discountAmount)}</RowValue>
          </DiscountRow>
        )}
        {subtotal != null && (
          <TotalRow>
            <RowLabel>Total</RowLabel>
            <TotalRowValue>{formatPrice(total)}</TotalRowValue>
          </TotalRow>
        )}
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
