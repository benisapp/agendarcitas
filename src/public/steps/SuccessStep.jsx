import { useState } from 'react'
import styled from 'styled-components'
import { FaCheck, FaCalendarCheck, FaFilePdf } from 'react-icons/fa6'
import { Button, SecondaryButton } from '../../components/ui'
import { formatDateLong, formatTime12h } from '../../utils/dates'
import { formatPrice } from '../../utils/format'
import TicketModal from '../TicketModal'
import ServiceList from '../ServiceList'

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 2rem 1.5rem;
  text-align: center;
`

const Mark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  background: var(--color-success-soft);
  color: var(--color-success);
  margin-bottom: 1rem;
`

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

const Summary = styled.div`
  text-align: left;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem 1.125rem;
  margin-bottom: 1.5rem;
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;

  &:last-child {
    border-bottom: none;
  }
`

const RowLabel = styled.span`
  color: var(--color-text-muted);
`

const RowValue = styled.span`
  font-weight: 600;
  color: var(--color-text);
  text-align: right;
`

const DiscountRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-success);
`

const ServicesWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
`

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

function SuccessStep({ services, client, slot, appointment, onBookAnother, onViewAppointments }) {
  const [showTicket, setShowTicket] = useState(false)

  const subtotal = services.every((s) => s.price != null)
    ? services.reduce((sum, s) => sum + s.price, 0)
    : null
  const discountPercent = appointment?.discountPercent ?? null
  const discountAmount =
    subtotal != null && discountPercent != null
      ? Math.round((subtotal * discountPercent) / 100)
      : 0
  const total = subtotal != null ? subtotal - discountAmount : null

  return (
    <Card>
      <Mark>
        <FaCheck size={24} />
      </Mark>
      <Title>¡Cita agendada correctamente!</Title>
      <Subtitle>Te esperamos, {client.name}.</Subtitle>

      <Summary>
        <ServicesWrap>
          <RowLabel>Servicios</RowLabel>
          <ServiceList services={services} />
        </ServicesWrap>
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
        {subtotal != null && (
          <Row>
            <RowLabel>Subtotal</RowLabel>
            <RowValue>{formatPrice(subtotal)}</RowValue>
          </Row>
        )}
        {discountAmount > 0 && (
          <DiscountRow>
            <RowLabel>
              Descuento
              {appointment.discountTitle ? ` ${appointment.discountTitle}` : ''} (
              {discountPercent}%)
            </RowLabel>
            <span>-{formatPrice(discountAmount)}</span>
          </DiscountRow>
        )}
        {total != null && (
          <Row>
            <RowLabel>Total</RowLabel>
            <RowValue>{formatPrice(total)}</RowValue>
          </Row>
        )}
      </Summary>

      <Actions>
        <Button type="button" onClick={() => setShowTicket(true)}>
          <FaFilePdf size={15} />
          Ver mi comprobante
        </Button>
        <SecondaryButton type="button" onClick={onViewAppointments}>
          <FaCalendarCheck size={15} />
          Ver mis citas
        </SecondaryButton>
        <SecondaryButton type="button" onClick={onBookAnother}>
          Agendar otra cita
        </SecondaryButton>
      </Actions>

      {showTicket && (
        <TicketModal
          services={services}
          client={client}
          slot={slot}
          appointment={appointment}
          onClose={() => setShowTicket(false)}
        />
      )}
    </Card>
  )
}

export default SuccessStep
