import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FaArrowLeft, FaClock, FaScissors } from 'react-icons/fa6'
import BarberIcon from '../../components/BarberIcon'
import { Alert, EmptyState, Spinner } from '../../components/ui'
import { fetchServices } from '../../services'
import { formatDuration } from '../../utils/format'

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

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const ServiceCard = styled.button`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-align: left;
  padding: 1rem 1.125rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
  }
`

const Icon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  flex-shrink: 0;
`

const Info = styled.div`
  flex: 1;
  min-width: 0;
`

const Name = styled.p`
  margin: 0;
  font-weight: 600;
  color: var(--color-text);
`

const Description = styled.p`
  margin: 0.125rem 0 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
`

const Meta = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0.375rem 0 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-primary);
`

const Center = styled.div`
  display: flex;
  justify-content: center;
  padding: 3rem 0;
  color: var(--color-text-muted);
`

function ServiceStep({ onBack, onSelect }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true
    fetchServices()
      .then((list) => {
        if (mounted) setServices(list.filter((s) => s.active))
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

  return (
    <div>
      <BackLink type="button" onClick={onBack}>
        <FaArrowLeft size={13} />
        Volver
      </BackLink>
      <Title>¿Qué servicio necesitás?</Title>
      <Subtitle>Elegí el servicio que querés reservar.</Subtitle>

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
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              type="button"
              onClick={() => onSelect(service)}
            >
              {service.icon && (
                <Icon>
                  <BarberIcon id={service.icon} size={22} />
                </Icon>
              )}
              <Info>
                <Name>{service.name}</Name>
                {service.description && (
                  <Description>{service.description}</Description>
                )}
                <Meta>
                  <FaClock size={12} />
                  {formatDuration(service.duration)}
                </Meta>
              </Info>
            </ServiceCard>
          ))}
        </List>
      )}
    </div>
  )
}

export default ServiceStep
