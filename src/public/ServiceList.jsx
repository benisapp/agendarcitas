import styled from 'styled-components'
import BarberIcon from '../components/BarberIcon'

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
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

const Name = styled.span`
  font-weight: 600;
  color: var(--color-text);
`

function ServiceList({ services, size = 16 }) {
  const list = Array.isArray(services) ? services.filter(Boolean) : []

  if (list.length === 0) return <Name>Servicio</Name>

  return (
    <List>
      {list.map((service) => (
        <Item key={service.id}>
          {service.icon && (
            <IconBox>
              <BarberIcon id={service.icon} size={size} />
            </IconBox>
          )}
          <Name>{service.name}</Name>
        </Item>
      ))}
    </List>
  )
}

export default ServiceList