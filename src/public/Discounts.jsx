import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FaArrowLeft, FaPercent, FaTag } from 'react-icons/fa6'
import { fetchDiscounts, getVisibleDiscounts, isBirthdayDiscount, describeDiscountValidity } from '../discounts'
import { Alert, EmptyState, Spinner } from '../components/ui'

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

const Center = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
  color: var(--color-text-muted);
`

const Notice = styled.div`
  margin-bottom: 1rem;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const DiscountCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.125rem;
  box-shadow: var(--shadow-sm);
`

const IconBox = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
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
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text);
`

const Validity = styled.p`
  margin: 0.125rem 0 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  flex-shrink: 0;
  padding: 0.3rem 0.625rem;
  border-radius: var(--radius-full);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-size: 0.85rem;
  font-weight: 800;
  white-space: nowrap;
`

function todayString() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`
}

function Discounts({ client, onBackHome }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [discounts, setDiscounts] = useState([])

  useEffect(() => {
    let mounted = true
    fetchDiscounts()
      .then((list) => {
        if (mounted) setDiscounts(list)
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

  const visible = getVisibleDiscounts(discounts, client, todayString())

  return (
    <div>
      <BackLink type="button" onClick={onBackHome}>
        <FaArrowLeft size={13} />
        Volver al inicio
      </BackLink>
      <Title>Descuentos</Title>
      <Subtitle>Estos son los descuentos disponibles para vos.</Subtitle>

      {loading ? (
        <Center>
          <Spinner />
        </Center>
      ) : error ? (
        <Notice>
          <Alert tone="error">No se pudieron cargar los descuentos.</Alert>
        </Notice>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<FaTag size={26} />}
          title="No hay descuentos disponibles"
          description="Volvé a intentarlo más tarde."
        />
      ) : (
        <List>
          {visible.map((discount) => (
            <DiscountCard key={discount.id}>
              <IconBox>
                <FaPercent size={16} />
              </IconBox>
              <Info>
                <Name>{discount.title}</Name>
                <Validity>
                  {isBirthdayDiscount(discount) ? 'Cumpleaños · ' : ''}
                  {describeDiscountValidity(discount)}
                </Validity>
              </Info>
              <Badge>{discount.percent}%</Badge>
            </DiscountCard>
          ))}
        </List>
      )}
    </div>
  )
}

export default Discounts
