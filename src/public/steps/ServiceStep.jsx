import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaChevronRight,
  FaClock,
  FaScissors,
} from 'react-icons/fa6'
import BarberIcon from '../../components/BarberIcon'
import { Alert, EmptyState, Spinner } from '../../components/ui'
import { fetchServices, isServiceAvailable } from '../../services'
import {
  fetchDiscounts,
  getApplicableDiscount,
  isBirthdayDiscount,
} from '../../discounts'
import { formatDuration, formatPrice } from '../../utils/format'

const Root = styled.div`
  --svc-ink: #3a2b31;
  --svc-muted: #a58d94;
  --svc-pink: #b76e79;
  --svc-pink-deep: #9c5a66;
  --svc-pink-soft: #fdf3f4;
  --svc-border: #f1e3e5;
  --svc-icon-bg: #fbe9ec;
  --svc-warm: #fffdfc;

  min-height: 100vh;
  background: var(--svc-warm);
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
`

const Inner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.25rem;

  @media (min-width: 768px) {
    padding: 0 2rem;
  }

  @media (min-width: 1024px) {
    padding: 0 2.5rem;
  }
`

const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: transparent;
  font-family: inherit;
  color: var(--svc-muted);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.25rem 0;
  margin: 0 0 2rem;
  transition: color 0.15s ease, transform 0.15s ease;

  &:hover {
    color: var(--svc-pink-deep);
    transform: translateX(-2px);
  }
`

const Title = styled.h1`
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--svc-ink);

  @media (min-width: 768px) {
    font-size: 2.125rem;
  }

  @media (min-width: 1024px) {
    font-size: 2.375rem;
  }
`

const Subtitle = styled.p`
  margin: 0 0 2rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--svc-muted);

  @media (min-width: 1024px) {
    margin: 0 0 2.5rem;
  }
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;

  @media (min-width: 1024px) {
    gap: 1rem;
  }
`

const Card = styled.button`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  grid-template-areas:
    'icon name right arrow'
    'icon duration right arrow';
  align-items: center;
  column-gap: 0.625rem;
  row-gap: 0.375rem;

  width: 100%;
  text-align: left;
  font-family: inherit;
  min-height: 84px;
  padding: 0.875rem 1rem;
  border: ${({ $selected, $promo }) =>
    $selected
      ? '1.5px solid var(--svc-pink)'
      : $promo
        ? '1px solid #f3dbdf'
        : '1px solid var(--svc-border)'};
  border-radius: 18px;
  background: ${({ $selected, $promo }) =>
    $selected ? 'var(--svc-pink-soft)' : $promo ? '#fffafb' : '#ffffff'};
  box-shadow: ${({ $selected }) =>
    $selected
      ? '0 10px 28px rgba(183, 110, 121, 0.12)'
      : '0 1px 2px rgba(58, 42, 49, 0.03), 0 10px 26px rgba(183, 110, 121, 0.06)'};
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease,
    transform 0.15s ease;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-height: 88px;
    padding: 1.125rem 1.5rem;
    border-radius: 20px;
  }

  @media (min-width: 1024px) {
    min-height: 92px;
    padding: 1.25rem 1.75rem;
  }

  &:hover {
    border-color: var(--svc-pink);
    box-shadow: 0 12px 30px rgba(183, 110, 121, 0.1);
  }

  &:active {
    transform: scale(0.998);
  }
`

const IconWrap = styled.span`
  grid-area: icon;
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 13px;
  background: var(--svc-icon-bg);
  color: var(--svc-pink-deep);
  flex-shrink: 0;

  @media (min-width: 768px) {
    width: 3rem;
    height: 3rem;
    border-radius: 14px;
  }
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;

  @media (max-width: 767px) {
    display: contents;
  }
`

const NameBlock = styled.div`
  grid-area: name;
  align-self: center;
  min-width: 0;
`

const Name = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--svc-ink);

  @media (min-width: 768px) {
    font-size: 1.15rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.2rem;
  }
`

const Description = styled.p`
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
  color: var(--svc-muted);
`

const Duration = styled.p`
  grid-area: duration;
  align-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--svc-muted);

  @media (min-width: 768px) {
    margin-top: 0.35rem;
    font-size: 0.9rem;
  }
`

const Right = styled.div`
  grid-area: right;
  align-self: center;
  justify-self: end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0.3rem;
  flex-shrink: 0;
`

const PromoTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: #f7dade;
  color: var(--svc-pink-deep);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;

  b {
    font-weight: 800;
    color: var(--svc-pink-deep);
  }

  @media (min-width: 768px) {
    padding: 0.2rem 0.625rem;
    font-size: 0.65rem;
    letter-spacing: 0.06em;
  }
`

const PriceRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0.1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: baseline;
    gap: 0.45rem;
  }
`

const Price = styled.span`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--svc-ink);
  white-space: nowrap;

  @media (min-width: 768px) {
    font-size: 1.15rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.2rem;
  }

  ${({ $accent }) =>
    $accent &&
    `
    color: var(--svc-pink-deep);
    font-weight: 800;
    font-size: 1.15rem;

    @media (min-width: 768px) {
      font-size: 1.3rem;
    }

    @media (min-width: 1024px) {
      font-size: 1.35rem;
    }
  `}
`

const OldPrice = styled.span`
  font-size: 0.75rem;
  color: var(--svc-muted);
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
  white-space: nowrap;

  @media (min-width: 768px) {
    font-size: 0.875rem;
  }
`

const Indicator = styled.span`
  grid-area: arrow;
  align-self: center;
  justify-self: end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  flex-shrink: 0;
  color: #c9b4b9;
`

const popIn = keyframes`
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  70% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const CheckMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: var(--svc-pink);
  color: #ffffff;
  animation: ${popIn} 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
`

const Center = styled.div`
  display: flex;
  justify-content: center;
  padding: 5rem 0;
  color: var(--svc-muted);
`

const Spacer = styled.div`
  height: 7.5rem;
`

const Footer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  padding: 0.875rem 0 calc(0.875rem + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 253, 252, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--svc-border);
  box-shadow: 0 -8px 30px rgba(183, 110, 121, 0.06);
`

const FooterInner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.25rem;

  @media (min-width: 768px) {
    padding: 0 2rem;
  }

  @media (min-width: 1024px) {
    padding: 0 2.5rem;
  }
`

const Continue = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 54px;
  padding: 0 1.25rem;
  border: none;
  border-radius: 15px;
  font-family: inherit;
  background: linear-gradient(135deg, #c98a96, #b76e79);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(183, 110, 121, 0.28);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;

  @media (min-width: 1024px) {
    height: 56px;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(183, 110, 121, 0.36);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`

function ServiceStep({ selected, onToggle, onBack, onContinue }) {
  const [services, setServices] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const selectedList = Array.isArray(selected) ? selected : []

  useEffect(() => {
    let mounted = true
    const today = new Date()
    const todayString = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    Promise.all([fetchServices(), fetchDiscounts()])
      .then(([serviceList, discountList]) => {
        if (!mounted) return
        setServices(serviceList.filter((s) => isServiceAvailable(s, todayString)))
        setDiscounts(discountList)
      })
      .catch(() => {
        if (mounted) setError(true)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const discountByService = (serviceId) => {
    const today = new Date()
    const todayString = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    // El descuento de cumpleaños depende de la fecha de la cita (aún no
    // elegida en este paso), así que no se previsualiza acá.
    const previewable = discounts.filter((d) => !isBirthdayDiscount(d))
    return getApplicableDiscount(todayString, [serviceId], previewable)
  }

  return (
    <Root>
      <Inner>
        <BackLink type="button" onClick={onBack}>
          <FaArrowLeft size={14} />
          Volver
        </BackLink>

        <Title>¿Qué servicio necesitás?</Title>
        <Subtitle>Podés elegir uno o más servicios.</Subtitle>

        {loading ? (
          <Center>
            <Spinner />
          </Center>
        ) : error ? (
          <Alert tone="error">No se pudieron cargar los servicios.</Alert>
        ) : services.length === 0 ? (
          <EmptyState
            icon={<FaScissors size={26} />}
            title="No hay servicios disponibles"
            description="Volvé a intentarlo más tarde."
          />
        ) : (
          <List>
            {services.map((service) => {
              const isSelected = selectedList.some((s) => s.id === service.id)
              const discount = discountByService(service.id)
              const discountedPrice =
                discount && typeof service.price === 'number'
                  ? Math.round((service.price * (100 - discount.percent)) / 100)
                  : null
              return (
                <Card
                  key={service.id}
                  type="button"
                  $selected={isSelected}
                  $promo={!!discount}
                  onClick={() => onToggle(service)}
                >
                  {service.icon && (
                    <IconWrap>
                      <BarberIcon id={service.icon} size={22} />
                    </IconWrap>
                  )}
                  <Info>
                    <NameBlock>
                      <Name>{service.name}</Name>
                      {service.description && (
                        <Description>{service.description}</Description>
                      )}
                    </NameBlock>
                    <Duration>
                      <FaClock size={12} />
                      {formatDuration(service.duration)}
                    </Duration>
                  </Info>
                  <Right>
                    {discount && (
                      <PromoTag title={discount.title}>
                        PROMO&nbsp;·&nbsp;<b>{discount.percent}% OFF</b>
                      </PromoTag>
                    )}
                    {service.price != null && (
                      <PriceRow>
                        {discountedPrice != null &&
                          discountedPrice !== service.price && (
                            <OldPrice>{formatPrice(service.price)}</OldPrice>
                          )}
                        <Price $accent={!!discount}>
                          {formatPrice(discountedPrice ?? service.price)}
                        </Price>
                      </PriceRow>
                    )}
                  </Right>
                  <Indicator>
                    {isSelected ? (
                      <CheckMark>
                        <FaCheck size={11} />
                      </CheckMark>
                    ) : (
                      <FaChevronRight size={15} />
                    )}
                  </Indicator>
                </Card>
              )
            })}
          </List>
        )}
      </Inner>

      <Spacer />
      <Footer>
        <FooterInner>
          <Continue
            type="button"
            disabled={selectedList.length === 0}
            onClick={onContinue}
          >
            Continuar
            {selectedList.length > 0 ? ` (${selectedList.length})` : ''}
            <FaArrowRight size={16} />
          </Continue>
        </FooterInner>
      </Footer>
    </Root>
  )
}

export default ServiceStep
