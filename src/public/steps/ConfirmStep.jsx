import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FaArrowLeft, FaCalendarDay, FaClock } from 'react-icons/fa6'
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
import { formatDateLong, formatTime12h, isSlotInPast, overlaps, addMinutesToTime } from '../../utils/dates'
import { formatDuration, formatPrice } from '../../utils/format'
import { getSelectionTotals, addonQuantity, addonLinePrice, addonLineDuration } from '../../utils/appointmentServices'

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

const Section = styled.section`
  margin-bottom: 1.75rem;
`

const SectionLabel = styled.p`
  margin: 0 0 0.625rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-gold-ink);
`

const ApptCard = styled.div`
  background: var(--color-primary-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.125rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const ApptLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text);
`

const ApptIcon = styled.span`
  display: inline-flex;
  align-items: center;
  color: var(--color-primary);
  flex-shrink: 0;
`

const ClientBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--color-border-strong);
`

const FieldLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-text-muted);
`

const ClientName = styled.span`
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.3;
  color: var(--color-text);
  overflow-wrap: anywhere;
`

const ListCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0.25rem 1.125rem 0.5rem;
`

const ListRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 0;
`

const ServiceInfo = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`

const ServiceName = styled.span`
  font-weight: 700;
  color: var(--color-text);
  overflow-wrap: anywhere;
`

const ServiceDuration = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-subtle);
`

const PriceColumn = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.05rem;
`

const ServiceOldPrice = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-subtle);
  text-decoration: line-through;
  white-space: nowrap;
`

const ServiceNewPrice = styled.span`
  font-weight: ${({ $discounted }) => ($discounted ? 700 : 600)};
  color: ${({ $discounted }) =>
    $discounted ? 'var(--color-primary-strong)' : 'var(--color-text)'};
  white-space: nowrap;
`

const AddonInfo = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`

const AddonName = styled.span`
  font-weight: 500;
  color: var(--color-text-muted);
  min-width: 0;
`

const AddonDuration = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-subtle);
`

const AddonQty = styled.span`
  margin-left: 0.2rem;
  color: var(--color-primary);
  font-weight: 800;
  white-space: nowrap;
`

const DurationFooter = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text-muted);
`

const Notice = styled.div`
  margin-bottom: 1rem;
`

const Picker = styled.div`
  margin-bottom: 1.75rem;
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

const PayCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0.5rem 1.125rem 0.75rem;
`

const PayRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
`

const PayLabel = styled.span`
  font-size: 0.9rem;
  color: var(--color-text-muted);
`

const PayValue = styled.span`
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
`

const DiscountInfo = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`

const DiscountCaption = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-subtle);
`

const DiscountValue = styled.span`
  font-weight: 700;
  color: var(--color-success);
  white-space: nowrap;
`

const TotalDivider = styled.div`
  height: 1px;
  background: var(--color-border-strong);
  margin: 0.5rem 0;
`

const TotalRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.25rem 0 0.5rem;
`

const TotalLabel = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
`

const TotalValue = styled.span`
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--color-text);
  white-space: nowrap;
`

function ConfirmStep({ services, addons, client, slot, onBack, onConfirmed }) {
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

  const addonList = Array.isArray(addons) ? addons.filter(Boolean) : []
  const totals = getSelectionTotals(services, addonList)
  const subtotal = totals.price
  const servicesPrice = totals.servicesPrice
  const addonsPrice = totals.addonsPrice
  const estimatedDuration = totals.duration
  const reservedDuration = slot.duration ?? totals.duration
  const endTime = addMinutesToTime(slot.startTime, reservedDuration)

  const applicableDiscounts = getApplicableDiscounts(
    slot.date,
    services.map((s) => s.id),
    discounts,
    client,
  )
  const selectedDiscount =
    applicableDiscounts.find((d) => d.id === selectedDiscountId) ||
    getDefaultDiscount(applicableDiscounts)
  const discountPercent = selectedDiscount?.percent ?? 0
  // El descuento aplica solo sobre el valor de los servicios, nunca sobre los
  // adicionales.
  const { discountAmount } = applyDiscountToTotal(
    servicesPrice ?? 0,
    selectedDiscount,
  )
  const total = subtotal != null ? subtotal - discountAmount : null

  const servicePrice = (service) => {
    if (service.price == null) return null
    if (!selectedDiscount) return service.price
    return Math.round((service.price * (100 - discountPercent)) / 100)
  }

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
          overlaps(slot.startTime, endTime, appt.startTime, appt.endTime),
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
        endTime,
        addons: addonList,
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

      <Section>
        <SectionLabel>Tu cita</SectionLabel>
        <ApptCard>
          <ApptLine>
            <ApptIcon>
              <FaCalendarDay size={15} />
            </ApptIcon>
            <span>{formatDateLong(slot.date)}</span>
          </ApptLine>
          <ApptLine>
            <ApptIcon>
              <FaClock size={15} />
            </ApptIcon>
            <span>
              {formatTime12h(slot.startTime)} - {formatTime12h(endTime)}
            </span>
          </ApptLine>
          <ClientBlock>
            <FieldLabel>Cliente</FieldLabel>
            <ClientName>{client.name}</ClientName>
          </ClientBlock>
        </ApptCard>
      </Section>

      <Section>
        <SectionLabel>Servicios</SectionLabel>
        <ListCard>
          {services.map((service) => {
            const price = servicePrice(service)
            const hasDiscount =
              selectedDiscount && price != null && price !== service.price
            return (
              <ListRow key={service.id}>
                <ServiceInfo>
                  <ServiceName>{service.name}</ServiceName>
                  <ServiceDuration>
                    {formatDuration(service.duration)}
                  </ServiceDuration>
                </ServiceInfo>
                {price != null && (
                  <PriceColumn>
                    {hasDiscount && (
                      <ServiceOldPrice>
                        {formatPrice(service.price)}
                      </ServiceOldPrice>
                    )}
                    <ServiceNewPrice $discounted={hasDiscount}>
                      {formatPrice(price)}
                    </ServiceNewPrice>
                  </PriceColumn>
                )}
              </ListRow>
            )
          })}
          <DurationFooter>
            <span>Tiempo estimado</span>
            <span>{formatDuration(estimatedDuration)}</span>
          </DurationFooter>
        </ListCard>
      </Section>

      {addonList.length > 0 && (
        <Section>
          <SectionLabel>Adicionales</SectionLabel>
          <ListCard>
            {addonList.map((addon) => {
              const quantity = addonQuantity(addon)
              const duration = addonLineDuration(addon)
              return (
                <ListRow key={`${addon.serviceId}-${addon.id}`}>
                  <AddonInfo>
                    <AddonName>
                      {addon.name}
                      {quantity > 1 && <AddonQty>×{quantity}</AddonQty>}
                    </AddonName>
                    {duration > 0 && (
                      <AddonDuration>{formatDuration(duration)}</AddonDuration>
                    )}
                  </AddonInfo>
                  <PayValue>{formatPrice(addonLinePrice(addon))}</PayValue>
                </ListRow>
              )
            })}
          </ListCard>
        </Section>
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

      <Section>
        <SectionLabel>Resumen de pago</SectionLabel>
        <PayCard>
          {servicesPrice != null && (
            <PayRow>
              <PayLabel>Servicios</PayLabel>
              <PayValue>{formatPrice(servicesPrice)}</PayValue>
            </PayRow>
          )}
          {addonsPrice > 0 && (
            <PayRow>
              <PayLabel>Adicionales</PayLabel>
              <PayValue>{formatPrice(addonsPrice)}</PayValue>
            </PayRow>
          )}
          {selectedDiscount && (
            <PayRow>
              <DiscountInfo>
                <PayLabel>Descuento al servicio</PayLabel>
                <DiscountCaption>
                  {selectedDiscount.title} ({selectedDiscount.percent}%)
                </DiscountCaption>
              </DiscountInfo>
              <DiscountValue>-{formatPrice(discountAmount)}</DiscountValue>
            </PayRow>
          )}
          {servicesPrice != null && (
            <>
              <TotalDivider />
              <TotalRow>
                <TotalLabel>Total</TotalLabel>
                <TotalValue>{formatPrice(total)}</TotalValue>
              </TotalRow>
            </>
          )}
        </PayCard>
      </Section>

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
