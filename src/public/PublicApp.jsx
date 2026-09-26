import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FaArrowRightFromBracket, FaHouse, FaScissors } from 'react-icons/fa6'
import Home from './Home'
import LoginGate from './LoginGate'
import WhatsAppButton from './WhatsAppButton'
import Stepper from './Stepper'
import MyAppointments from './MyAppointments'
import Discounts from './Discounts'
import ServiceStep from './steps/ServiceStep'
import AddonsStep from './steps/AddonsStep'
import DateTimeStep from './steps/DateTimeStep'
import ConfirmStep from './steps/ConfirmStep'
import SuccessStep from './steps/SuccessStep'
import {
  makeAppointmentAddon,
  getServiceAddons,
} from '../utils/appointmentServices'
import { getScheduleCached } from '../settings'

const BASE_URL = import.meta.env.BASE_URL || '/'

const STEP_SLUG = {
  1: 'servicio',
  2: 'adicionales',
  3: 'horario',
  4: 'confirmar',
  5: 'exito',
}
const SLUG_STEP = Object.entries(STEP_SLUG).reduce(
  (map, [step, slug]) => ({ ...map, [slug]: Number(step) }),
  {},
)

function parsePath(pathname) {
  const relative = pathname.startsWith(BASE_URL)
    ? pathname.slice(BASE_URL.length)
    : pathname
  const parts = relative.split('/').filter(Boolean)
  if (parts[0] === 'mis-citas') return { view: 'appointments', step: 1 }
  if (parts[0] === 'descuentos') return { view: 'discounts', step: 1 }
  if (parts[0] === 'agendar') {
    return { view: 'booking', step: SLUG_STEP[parts[1]] || 1 }
  }
  return { view: 'home', step: 1 }
}

function pathFor(view, step) {
  if (view === 'appointments') return `${BASE_URL}mis-citas`
  if (view === 'discounts') return `${BASE_URL}descuentos`
  if (view === 'booking') {
    const slug = STEP_SLUG[step]
    return `${BASE_URL}agendar${slug ? `/${slug}` : ''}`
  }
  return BASE_URL
}

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

const Brand = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.02em;
  color: var(--color-primary);
  border: none;
  background: transparent;
  padding: 0.25rem 0.5rem;
  margin-left: -0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;

  &:hover {
    background: var(--color-primary-soft);
  }
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const LogoutButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.375rem 0.5rem;
  border-radius: var(--radius-sm);

  &:hover {
    background: var(--color-danger-soft);
    color: var(--color-danger);
  }
`

const Container = styled.main`
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3rem;
`

function servicesHaveAddons(services) {
  return (Array.isArray(services) ? services : []).some(
    (service) => getServiceAddons(service).length > 0,
  )
}

function stepperPosition(step, hasAddons) {
  if (step <= 1) return 1
  return hasAddons ? step : step - 1
}

function bookingStepFromData(step, services, hasAddons, slot, appointment) {
  if (step <= 1) return 1
  if (services.length === 0) return 1
  if (step === 2) return hasAddons ? 2 : 3
  if (step === 3) return 3
  if (step === 4) return slot ? 4 : 3
  if (step === 5) {
    if (!slot) return 3
    if (!appointment) return 4
    return 5
  }
  return step
}

function PublicApp() {
  const initial = parsePath(window.location.pathname)
  const [view, setView] = useState(initial.view)
  const [step, setStep] = useState(initial.step)
  const [services, setServices] = useState([])
  const [addons, setAddons] = useState([])
  const [client, setClient] = useState(null)
  const [slot, setSlot] = useState(null)
  const [appointment, setAppointment] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [sessionPhone, setSessionPhone] = useState('')
  const [adminPhone, setAdminPhone] = useState('')

  useEffect(() => {
    getScheduleCached()
      .then((data) => setAdminPhone(data?.adminPhone || ''))
      .catch(() => {})

    const redirect = sessionStorage.getItem('benis-redirect')
    let initialView = view
    let initialStep = step
    if (redirect) {
      sessionStorage.removeItem('benis-redirect')
      const parsed = parsePath(redirect)
      initialView = parsed.view
      initialStep = parsed.step
    }
    window.history.replaceState(
      { view: initialView, step: initialStep },
      '',
      pathFor(initialView, initialStep),
    )
    if (initialView !== view || initialStep !== step) {
      setView(initialView)
      setStep(initialStep)
    }

    const onPopState = () => {
      const parsed = parsePath(window.location.pathname)
      setView(parsed.view)
      setStep(parsed.step)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (nextView, nextStep = 1) => {
    if (nextView === view && nextStep === step) return
    setView(nextView)
    setStep(nextStep)
    window.history.pushState(
      { view: nextView, step: nextStep },
      '',
      pathFor(nextView, nextStep),
    )
  }

  const resetBooking = () => {
    setServices([])
    setAddons([])
    setSlot(null)
    setAppointment(null)
  }

  const goHome = () => {
    navigate('home', 1)
    resetBooking()
  }

  const startBooking = () => {
    getScheduleCached().catch(() => {})
    navigate('booking', 1)
    resetBooking()
  }

  const goToAppointments = () => {
    navigate('appointments', 1)
  }

  const goToDiscounts = () => {
    navigate('discounts', 1)
  }

  const handleLogin = (client) => {
    sessionStorage.removeItem('benis-redirect')
    setClient(client)
    setSessionPhone(client.phone)
    setLoggedIn(true)
    navigate('home', 1)
    resetBooking()
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setClient(null)
    navigate('home', 1)
    resetBooking()
  }

  const toggleService = (service) => {
    const exists = services.some((s) => s.id === service.id)
    if (exists) {
      setServices((prev) => prev.filter((s) => s.id !== service.id))
      setAddons((prev) => prev.filter((a) => a.serviceId !== service.id))
    } else {
      setServices((prev) => [...prev, service])
    }
    setSlot(null)
  }

  const toggleAddon = (service, addon) => {
    setAddons((prev) => {
      const exists = prev.some(
        (a) => a.serviceId === service.id && a.id === addon.id,
      )
      if (exists) {
        return prev.filter(
          (a) => !(a.serviceId === service.id && a.id === addon.id),
        )
      }
      return [...prev, makeAppointmentAddon(service.id, addon)]
    })
    setSlot(null)
  }

  const changeAddonQuantity = (serviceId, addonId, quantity) => {
    const next = Math.max(1, Math.floor(Number(quantity) || 1))
    setAddons((prev) =>
      prev.map((a) =>
        a.serviceId === serviceId && a.id === addonId
          ? { ...a, quantity: next }
          : a,
      ),
    )
    setSlot(null)
  }

  const hasAddons = servicesHaveAddons(services)

  const effectiveStep =
    view === 'booking'
      ? bookingStepFromData(step, services, hasAddons, slot, appointment)
      : step

  useEffect(() => {
    if (view === 'booking' && effectiveStep !== step) {
      window.history.replaceState(
        { view, step: effectiveStep },
        '',
        pathFor('booking', effectiveStep),
      )
      setStep(effectiveStep)
    }
  }, [view, step, effectiveStep, services, hasAddons, client, slot, appointment])

  return (
    <Page>
      <Header>
        <Brand type="button" onClick={goHome} title="Ir al inicio">
          <FaScissors size={16} color="var(--color-primary)" />
          Benis
        </Brand>
        {loggedIn && (
          <HeaderActions>
            {view !== 'home' && (
              <HeaderLink type="button" onClick={goHome}>
                <FaHouse size={15} />
                Inicio
              </HeaderLink>
            )}
            <LogoutButton type="button" onClick={handleLogout} title="Cerrar sesión">
              <FaArrowRightFromBracket size={15} />
              Salir
            </LogoutButton>
          </HeaderActions>
        )}
      </Header>

      <Container>
        {!loggedIn ? (
          <LoginGate onEnter={handleLogin} />
        ) : view === 'home' ? (
          <Home
            onBook={startBooking}
            onViewAppointments={goToAppointments}
            onViewDiscounts={goToDiscounts}
          />
        ) : view === 'appointments' ? (
          <MyAppointments phone={sessionPhone} onBackHome={goHome} />
        ) : view === 'discounts' ? (
          <Discounts client={client} onBackHome={goHome} />
        ) : (
          <>
            {effectiveStep <= 4 && (
              <Stepper
                current={stepperPosition(effectiveStep, hasAddons)}
                hasAddons={hasAddons}
              />
            )}
            {effectiveStep === 1 && (
              <ServiceStep
                selected={services}
                client={client}
                onToggleService={toggleService}
                onBack={goHome}
                onContinue={() => navigate('booking', 2)}
              />
            )}
            {effectiveStep === 2 && (
              <AddonsStep
                services={services}
                addons={addons}
                onToggleAddon={toggleAddon}
                onChangeAddonQuantity={changeAddonQuantity}
                onBack={() => navigate('booking', 1)}
                onContinue={() => navigate('booking', 3)}
              />
            )}
            {effectiveStep === 3 && (
              <DateTimeStep
                services={services}
                addons={addons}
                onBack={() => navigate('booking', hasAddons ? 2 : 1)}
                onSlotSelected={(s) => {
                  setSlot(s)
                  navigate('booking', 4)
                }}
              />
            )}
            {effectiveStep === 4 && (
              <ConfirmStep
                services={services}
                addons={addons}
                client={client}
                slot={slot}
                onBack={() => navigate('booking', 3)}
                onConfirmed={(appt) => {
                  setAppointment(appt)
                  setSlot((prev) =>
                    prev ? { ...prev, endTime: appt.endTime } : prev,
                  )
                  navigate('booking', 5)
                }}
              />
            )}
            {effectiveStep === 5 && (
              <SuccessStep
                services={services}
                addons={addons}
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
      {loggedIn && (
        <WhatsAppButton
          phone={adminPhone || '3126606408'}
          $lift={view === 'booking' && (effectiveStep === 1 || effectiveStep === 3)}
        />
      )}
    </Page>
  )
}

export default PublicApp