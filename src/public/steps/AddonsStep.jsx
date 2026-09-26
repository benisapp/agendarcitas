import styled from 'styled-components'
import { FaArrowLeft, FaArrowRight, FaCheck, FaMinus, FaPlus } from 'react-icons/fa6'
import BarberIcon from '../../components/BarberIcon'
import { formatDuration, formatPrice } from '../../utils/format'
import {
  getServiceAddons,
  addonQuantity,
  addonLinePrice,
} from '../../utils/appointmentServices'

const Root = styled.div`
  --sva-ink: #3a2b31;
  --sva-muted: #a58d94;
  --sva-pink: #b76e79;
  --sva-pink-deep: #9c5a66;
  --sva-pink-soft: #fdf3f4;
  --sva-border: #f1e3e5;
  --sva-icon-bg: #fbe9ec;

  min-height: 100vh;
  background: #fffdfc;
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
  color: var(--sva-muted);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.25rem 0;
  margin: 0 0 2rem;
  transition: color 0.15s ease, transform 0.15s ease;

  &:hover {
    color: var(--sva-pink-deep);
    transform: translateX(-2px);
  }
`

const Title = styled.h1`
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--sva-ink);

  @media (min-width: 768px) {
    font-size: 2.125rem;
  }
`

const Subtitle = styled.p`
  margin: 0 0 2rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--sva-muted);
`

const ServiceGroup = styled.div`
  margin-bottom: 1.25rem;
`

const ServiceHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sva-pink-deep);
`

const AddonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const AddonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid
    ${({ $accepted }) => ($accepted ? 'var(--sva-pink)' : 'var(--sva-border)')};
  border-radius: 14px;
  background: ${({ $accepted }) =>
    $accepted ? 'var(--sva-pink-soft)' : '#ffffff'};
  box-shadow: 0 1px 2px rgba(58, 42, 49, 0.03),
    0 10px 26px rgba(183, 110, 121, 0.05);
  transition: border-color 0.15s ease, background 0.15s ease;
`

const AddonToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  text-align: left;
  padding: 0;
  cursor: pointer;
`

const AddonCheck = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 7px;
  border: 1.5px solid
    ${({ $accepted }) => ($accepted ? 'var(--sva-pink)' : '#d9c6cb')};
  background: ${({ $accepted }) => ($accepted ? 'var(--sva-pink)' : '#ffffff')};
  color: #ffffff;
  flex-shrink: 0;
`

const AddonIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 10px;
  background: var(--sva-icon-bg);
  color: var(--sva-pink-deep);
  flex-shrink: 0;
`

const AddonInfo = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const AddonName = styled.span`
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--sva-ink);
  line-height: 1.25;
`

const AddonMeta = styled.span`
  font-size: 0.76rem;
  color: var(--sva-muted);
`

const Qty = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
`

const QtyButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 8px;
  border: 1px solid var(--sva-border);
  background: #ffffff;
  color: var(--sva-pink-deep);
  cursor: pointer;
  padding: 0;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const QtyValue = styled.span`
  min-width: 1.35rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--sva-ink);
`

const AddonTotal = styled.span`
  flex-shrink: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--sva-pink-deep);
  white-space: nowrap;
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
  border-top: 1px solid var(--sva-border);
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
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(183, 110, 121, 0.36);
  }

  &:active {
    transform: translateY(1px);
  }
`

function AddonsStep({
  services,
  addons,
  onToggleAddon,
  onChangeAddonQuantity,
  onBack,
  onContinue,
}) {
  const serviceList = Array.isArray(services) ? services.filter(Boolean) : []
  const acceptedAddons = Array.isArray(addons) ? addons : []

  const groups = serviceList
    .map((service) => ({
      service,
      addons: getServiceAddons(service),
    }))
    .filter((group) => group.addons.length > 0)

  const acceptedCount = acceptedAddons.reduce(
    (sum, addon) => sum + addonQuantity(addon),
    0,
  )
  const addonTotal = acceptedAddons.reduce(
    (sum, addon) => sum + addonLinePrice(addon),
    0,
  )

  return (
    <Root>
      <Inner>
        <BackLink type="button" onClick={onBack}>
          <FaArrowLeft size={14} />
          Volver
        </BackLink>

        <Title>¿Querés sumar adicionales?</Title>
        <Subtitle>
          Son opcionales. Marcá los que quieras agregar a tu cita.
        </Subtitle>

        {groups.map(({ service, addons: serviceAddons }) => (
          <ServiceGroup key={service.id}>
            <ServiceHeading>
              <BarberIcon id={service.icon} size={14} />
              {service.name}
            </ServiceHeading>
            <AddonList>
              {serviceAddons.map((addon) => {
                const accepted = acceptedAddons.find(
                  (a) => a.serviceId === service.id && a.id === addon.id,
                )
                const quantity = accepted ? addonQuantity(accepted) : 1
                const incremental = addon.incremental !== false
                return (
                  <AddonRow key={addon.id} $accepted={!!accepted}>
                    <AddonToggle
                      type="button"
                      onClick={() => onToggleAddon(service, addon)}
                    >
                      <AddonCheck $accepted={!!accepted}>
                        {accepted && <FaCheck size={10} />}
                      </AddonCheck>
                      <AddonIcon>
                        <BarberIcon id={addon.icon} size={16} />
                      </AddonIcon>
                      <AddonInfo>
                        <AddonName>{addon.name}</AddonName>
                        <AddonMeta>
                          {formatPrice(addon.price ?? 0)}
                          {incremental ? ' c/u' : ''}
                          {addon.duration > 0
                            ? ` · ${formatDuration(addon.duration)}`
                            : ''}
                        </AddonMeta>
                      </AddonInfo>
                    </AddonToggle>

                    {accepted && incremental && (
                      <Qty>
                        <QtyButton
                          type="button"
                          aria-label="Quitar una unidad"
                          disabled={quantity <= 1}
                          onClick={() =>
                            onChangeAddonQuantity(
                              service.id,
                              addon.id,
                              quantity - 1,
                            )
                          }
                        >
                          <FaMinus size={10} />
                        </QtyButton>
                        <QtyValue>{quantity}</QtyValue>
                        <QtyButton
                          type="button"
                          aria-label="Agregar una unidad"
                          onClick={() =>
                            onChangeAddonQuantity(
                              service.id,
                              addon.id,
                              quantity + 1,
                            )
                          }
                        >
                          <FaPlus size={10} />
                        </QtyButton>
                      </Qty>
                    )}

                    {accepted && (
                      <AddonTotal>
                        {formatPrice(addonLinePrice(accepted))}
                      </AddonTotal>
                    )}
                  </AddonRow>
                )
              })}
            </AddonList>
          </ServiceGroup>
        ))}
      </Inner>

      <Spacer />
      <Footer>
        <FooterInner>
          <Continue type="button" onClick={onContinue}>
            {acceptedCount > 0
              ? `Continuar (${acceptedCount}) · ${formatPrice(addonTotal)}`
              : 'Continuar sin adicionales'}
            <FaArrowRight size={16} />
          </Continue>
        </FooterInner>
      </Footer>
    </Root>
  )
}

export default AddonsStep
