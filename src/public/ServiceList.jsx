import styled from 'styled-components'
import BarberIcon from '../components/BarberIcon'
import { formatPrice } from '../utils/format'
import { addonQuantity, addonLinePrice } from '../utils/appointmentServices'

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding-left: ${({ $addon }) => ($addon ? '1.5rem' : '0')};
`

const IconBox = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.875rem;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  flex-shrink: 0;
`

const AddonIconBox = styled(IconBox)`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 8px;
  border: 1px dashed var(--color-border-strong);
  background: transparent;
`

const Name = styled.span`
  font-weight: 600;
  color: var(--color-text);
`

const AddonName = styled(Name)`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-muted);
`

const AddonQty = styled.span`
  margin-left: 0.3rem;
  color: var(--color-primary);
  font-weight: 800;
  white-space: nowrap;
`

const Price = styled.span`
  margin-left: auto;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
`

const AddonPrice = styled(Price)`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
`

function ServiceList({ services, addons, showPrice = false, size = 16 }) {
  const list = Array.isArray(services) ? services.filter(Boolean) : []
  const addonList = Array.isArray(addons) ? addons.filter(Boolean) : []

  const addonsFor = (serviceId) =>
    addonList.filter((addon) => addon.serviceId === serviceId)
  const ungrouped = addonList.filter(
    (addon) => !list.some((service) => service.id === addon.serviceId),
  )

  const renderAddon = (addon) => {
    const quantity = addonQuantity(addon)
    return (
      <Item key={`addon-${addon.serviceId}-${addon.id}`} $addon>
        {addon.icon && (
          <AddonIconBox>
            <BarberIcon id={addon.icon} size={Math.max(12, size - 3)} />
          </AddonIconBox>
        )}
        <AddonName>
          {addon.name}
          {quantity > 1 ? <AddonQty>×{quantity}</AddonQty> : null}
        </AddonName>
        {showPrice ? (
          <AddonPrice>{formatPrice(addonLinePrice(addon))}</AddonPrice>
        ) : null}
      </Item>
    )
  }

  if (list.length === 0 && addonList.length === 0) return <Name>Servicio</Name>

  return (
    <List>
      {list.map((service) => (
        <Group key={service.id}>
          <Item>
            {service.icon && (
              <IconBox>
                <BarberIcon id={service.icon} size={size} />
              </IconBox>
            )}
            <Name>{service.name}</Name>
            {showPrice && service.price != null ? (
              <Price>{formatPrice(service.price)}</Price>
            ) : null}
          </Item>
          {addonsFor(service.id).map(renderAddon)}
        </Group>
      ))}
      {ungrouped.map(renderAddon)}
    </List>
  )
}

export default ServiceList
