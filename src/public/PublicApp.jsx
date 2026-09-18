import { useState } from 'react'
import styled from 'styled-components'
import { FaCalendarCheck, FaScissors } from 'react-icons/fa6'
import Stepper from './Stepper'
import MyAppointments from './MyAppointments'
import ServiceStep from './steps/ServiceStep'
import IdentifyStep from './steps/IdentifyStep'
import DateTimeStep from './steps/DateTimeStep'
import ConfirmStep from './steps/ConfirmStep'
import SuccessStep from './steps/SuccessStep'

const Page = styled.div`
  min-height: 100vh;
  background: var(--color-bg);
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: calc(1rem + env(safe-area-inset-top, 0px)) 1.25rem 1rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
`

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.02em;
  color: var(--color-primary);
`

const HeaderLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.375rem 0.5rem;
  border-radius: var(--radius-sm);

  &:hover {
    background: var(--color-primary-soft);
  }
`

const Container = styled.main`
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3rem;
`

function PublicApp() {
  const [view, setView] = useState('appointments')
  const [step, setStep] = useState(1)
  const [service, setService] = useState(null)
  const [client, setClient] = useState(null)
  const [slot, setSlot] = useState(null)
  const [appointment, setAppointment] = useState(null)

  const startBooking = () => {
    setView('booking')
    setStep(1)
    setService(null)
    setClient(null)
    setSlot(null)
    setAppointment(null)
  }

  const goToAppointments = () => {
    setView('appointments')
  }

  return (
    <Page>
      <Header>
        <Brand>
          <FaScissors size={16} color="var(--color-primary)" />
          Benis
        </Brand>
        {view === 'booking' ? (
          <HeaderLink type="button" onClick={goToAppointments}>
            <FaCalendarCheck size={15} />
            Mis citas
          </HeaderLink>
        ) : (
          <HeaderLink type="button" onClick={startBooking}>
            <FaCalendarCheck size={15} />
            Agendar cita
          </HeaderLink>
        )}
      </Header>

      <Container>
        {view === 'appointments' ? (
          <MyAppointments onBook={startBooking} />
        ) : (
          <>
            {step <= 4 && <Stepper current={step} />}
            {step === 1 && (
              <IdentifyStep
                onBack={goToAppointments}
                onClientReady={(c) => { setClient(c); setStep(2) }}
              />
            )}
            {step === 2 && (
              <ServiceStep
                onBack={() => setStep(1)}
                onSelect={(s) => { setService(s); setStep(3) }}
              />
            )}
            {step === 3 && (
              <DateTimeStep
                service={service}
                onBack={() => setStep(2)}
                onSlotSelected={(s) => { setSlot(s); setStep(4) }}
              />
            )}
            {step === 4 && (
              <ConfirmStep
                service={service}
                client={client}
                slot={slot}
                onBack={() => setStep(3)}
                onConfirmed={(appt) => { setAppointment(appt); setStep(5) }}
              />
            )}
            {step === 5 && (
              <SuccessStep
                service={service}
                client={client}
                slot={slot}
                appointment={appointment}
                onBookAnother={startBooking}
                onViewAppointments={goToAppointments}
              />
            )}
          </>
        )}
      </Container>
    </Page>
  )
}

export default PublicApp
