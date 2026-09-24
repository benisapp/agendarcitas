import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FaDownload, FaXmark } from 'react-icons/fa6'
import { Button, SecondaryButton, Spinner } from '../components/ui'
import { formatDateLong, formatTime12h } from '../utils/dates'
import { formatDuration, formatPrice } from '../utils/format'
import { downloadTicketImage, getTicketCode } from '../utils/ticket'
import ServiceList from './ServiceList'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
`

const Dialog = styled.div`
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  position: relative;
`

const Header = styled.div`
  position: relative;
  background: var(--color-surface-alt);
  color: var(--color-text);
  text-align: center;
  padding: 2.25rem 1.5rem 3rem;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: rgba(183, 110, 121, 0.1);
  }

  &::before {
    width: 12rem;
    height: 12rem;
    top: -5rem;
    right: -3rem;
  }

  &::after {
    width: 8rem;
    height: 8rem;
    bottom: -3.5rem;
    left: -2rem;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 0.875rem;
  right: 0.875rem;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-text-muted);
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.12);
    color: var(--color-text);
  }
`

const Brand = styled.p`
  margin: 0;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-primary);
`

const Tagline = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
`

const Body = styled.div`
  padding: 0 1.5rem 1.5rem;
  margin-top: -1.75rem;
`

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 auto 1rem;
  padding: 0.4rem 1rem;
  background: #fff;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
`

const Dot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-success);
  flex-shrink: 0;
`

const Name = styled.h2`
  margin: 0;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
`

const Greeting = styled.p`
  margin: 0.25rem 0 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-muted);
`

const Summary = styled.div`
  background: var(--color-primary-soft);
  border-radius: var(--radius-lg);
  padding: 0.875rem 1rem;
  margin-bottom: 1.25rem;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(183, 110, 121, 0.18);
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
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(183, 110, 121, 0.18);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-success);
`

const ServicesWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(183, 110, 121, 0.18);
`

const CodeBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem;
  margin-bottom: 1.25rem;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
`

const CodeLabel = styled.span`
  font-size: 0.8rem;
  color: var(--color-text-muted);
`

const CodeValue = styled.span`
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--color-primary);
`

const Footer = styled.p`
  margin: 0 0 1.25rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-muted);
`

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

function TicketModal({ services, service, client, slot, appointment, onClose }) {
  const [downloading, setDownloading] = useState(false)

  const serviceList = Array.isArray(services) && services.length
    ? services
    : service
      ? [service]
      : []

  const totalDuration = serviceList.reduce((sum, s) => sum + (s.duration || 0), 0)

  const subtotal = serviceList.every((s) => s.price != null)
    ? serviceList.reduce((sum, s) => sum + s.price, 0)
    : null
  const discountPercent = appointment?.discountPercent ?? null
  const discountAmount =
    subtotal != null && discountPercent != null
      ? Math.round((subtotal * discountPercent) / 100)
      : 0
  const total = subtotal != null ? subtotal - discountAmount : null

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadTicketImage({ services: serviceList, client, slot, appointment })
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  const code = getTicketCode(appointment)

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Header>
          <CloseButton type="button" onClick={onClose} aria-label="Cerrar">
            <FaXmark size={16} />
          </CloseButton>
          <Brand>Benis</Brand>
          <Tagline>Tu centro de belleza</Tagline>
        </Header>

        <Body>
          <Badge>
            <Dot />
            Cita agendada
          </Badge>

          <Name>{client.name}</Name>
          <Greeting>Te esperamos, {client.name}.</Greeting>

          <Summary>
            <ServicesWrap>
              <RowLabel>Servicios</RowLabel>
              <ServiceList services={serviceList} />
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
            <Row>
              <RowLabel>Duración</RowLabel>
              <RowValue>{totalDuration ? formatDuration(totalDuration) : '—'}</RowValue>
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

          {code && (
            <CodeBlock>
              <CodeLabel>Comprobante Nº</CodeLabel>
              <CodeValue>{code}</CodeValue>
            </CodeBlock>
          )}

          <Footer>Gracias por confiar en Benis. Presentá este comprobante al llegar.</Footer>

          <Actions>
            <Button type="button" onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <>
                  <Spinner $light />
                  Generando imagen...
                </>
              ) : (
                <>
                  <FaDownload size={15} />
                  Descargar imagen
                </>
              )}
            </Button>
            <SecondaryButton type="button" onClick={onClose}>
              Cerrar
            </SecondaryButton>
          </Actions>
        </Body>
      </Dialog>
    </Overlay>
  )
}

export default TicketModal
