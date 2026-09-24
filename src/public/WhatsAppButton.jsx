import styled from 'styled-components'
import { FaWhatsapp } from 'react-icons/fa6'

const Wrap = styled.a`
  position: fixed;
  bottom: ${({ $lift }) =>
    $lift
      ? 'calc(5.25rem + env(safe-area-inset-bottom, 0px))'
      : 'calc(1.25rem + env(safe-area-inset-bottom, 0px))'};
  right: 1.25rem;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  color: #25d366;
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: scale(1.06);
    box-shadow: var(--shadow-md);
    border-color: #25d366;
  }
`

function buildWaNumber(value) {
  if (!value) return ''
  let digits = value.replace(/\D/g, '')
  if (digits.length === 10) return `57${digits}`
  if (digits.length === 12 && digits.startsWith('57')) return digits
  return digits
}

function WhatsAppButton({ phone, $lift = false }) {
  const waNumber = buildWaNumber(phone)
  if (!waNumber) return null

  return (
    <Wrap
      $lift={$lift}
      href={`https://wa.me/${waNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
    >
      <FaWhatsapp size={26} />
    </Wrap>
  )
}

export default WhatsAppButton