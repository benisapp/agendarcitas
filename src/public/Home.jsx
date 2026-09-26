import styled from 'styled-components'
import { FaCalendarCheck, FaCalendarPlus, FaPercent, FaScissors } from 'react-icons/fa6'

const Hero = styled.div`
  text-align: center;
  padding: 2rem 0 1.5rem;
`

const Logo = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-lg);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  margin-bottom: 1rem;
`

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0 0 0.25rem;
  color: var(--color-text);
`

const Subtitle = styled.p`
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
`

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
`

const ActionCard = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
  padding: 1.25rem;
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

const ActionIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  flex-shrink: 0;
`

const ActionInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ActionName = styled.p`
  margin: 0;
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text);
`

const ActionHint = styled.p`
  margin: 0.125rem 0 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
`

function Home({ onBook, onViewAppointments, onViewDiscounts }) {
  return (
    <div>
      <Hero>
        <Logo>
          <FaScissors size={26} />
        </Logo>
        <Title>¡Hola! ¿Qué querés hacer?</Title>
        <Subtitle>Agendá o consultá tus citas de una forma rápida.</Subtitle>
      </Hero>

      <Grid>
        <ActionCard type="button" onClick={onBook}>
          <ActionIcon>
            <FaCalendarPlus size={22} />
          </ActionIcon>
          <ActionInfo>
            <ActionName>Agendar una cita</ActionName>
            <ActionHint>Elegí servicio, día y horario</ActionHint>
          </ActionInfo>
        </ActionCard>

        <ActionCard type="button" onClick={onViewAppointments}>
          <ActionIcon>
            <FaCalendarCheck size={22} />
          </ActionIcon>
          <ActionInfo>
            <ActionName>Ver mis citas</ActionName>
            <ActionHint>Consultá tus citas próximas y anteriores</ActionHint>
          </ActionInfo>
        </ActionCard>

        <ActionCard type="button" onClick={onViewDiscounts}>
          <ActionIcon>
            <FaPercent size={22} />
          </ActionIcon>
          <ActionInfo>
            <ActionName>Descuentos</ActionName>
            <ActionHint>Mirá los descuentos disponibles</ActionHint>
          </ActionInfo>
        </ActionCard>
      </Grid>
    </div>
  )
}

export default Home