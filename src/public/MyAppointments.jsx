import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  FaArrowLeft,
  FaBan,
  FaCalendarCheck,
  FaClock,
  FaFilePdf,
} from 'react-icons/fa6'
import { getClientByPhone, normalizePhone, clientDisplayName } from '../clients'
import {
  APPOINTMENT_STATUS,
  cancelAppointment,
  getAppointmentsByClient,
} from '../appointments'
import { STATUS_OPTIONS } from '../appointmentStatus'
import { fetchServices } from '../services'
import {
  Alert,
  EmptyState,
  ErrorText,
  Spinner,
} from '../components/ui'
import {
  formatDateLong,
  formatTime12h,
  isSlotInPast,
} from '../utils/dates'
import TicketModal from './TicketModal'
import ServiceList from './ServiceList'

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

const Notice = styled.div`
  margin-bottom: 1rem;
`

const Center = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
  color: var(--color-text-muted);
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const DayGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-text-muted);
  text-transform: capitalize;
`

const DayDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
`

const Section = styled.div`
  margin-bottom: 1.5rem;
`

const SectionTitle = styled.h2`
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--color-text);
  padding-left: 0.625rem;
  border-left: 3px solid var(--color-primary);
`

const VerMasButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.75rem;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.5rem 0.875rem;
  cursor: pointer;

  &:hover {
    background: var(--color-primary-soft);
    border-color: var(--color-primary);
  }
`

const AppointmentCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.125rem;
  box-shadow: var(--shadow-sm);
`

const ServicesBlock = styled.div`
  margin-bottom: 0.75rem;
`

const TimeLine = styled.p`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
`

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  padding: 0.2rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $soft }) => $soft || 'var(--color-success-soft)'};
  color: ${({ $color }) => $color || 'var(--color-success)'};
`

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
`

const CancelLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border: none;
  background: transparent;
  color: var(--color-danger);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
`

const Dialog = styled.div`
  width: 100%;
  max-width: 400px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 1.5rem;
  text-align: left;
`

const DialogTitle = styled.h2`
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: var(--color-text);
`

const DialogText = styled.p`
  margin: 0 0 1.25rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
`

const DialogActions = styled.div`
  display: flex;
  gap: 0.625rem;
`

const DialogButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
`

const KeepButton = styled(DialogButton)`
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text);

  &:hover {
    background: var(--color-bg);
  }
`

const ConfirmButton = styled(DialogButton)`
  border: 1px solid transparent;
  background: var(--color-danger);
  color: #fff;

  &:hover {
    background: var(--color-danger);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ViewLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: var(--color-primary-strong);
  }
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`

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

const STATUS_META = STATUS_OPTIONS.reduce(
  (map, option) => ({ ...map, [option.value]: option }),
  {},
)

function MyAppointments({ phone, onBackHome }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [client, setClient] = useState(null)
  const [upcomingGroups, setUpcomingGroups] = useState(null)
  const [pastGroups, setPastGroups] = useState(null)
  const [pastVisible, setPastVisible] = useState(5)
  const [ticketAppt, setTicketAppt] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const search = useCallback(
    async (value) => {
      const phoneValue = normalizePhone(value)
      if (!phoneValue) {
        setError('No pudimos identificar tu cuenta.')
        return
      }

      setError('')
      setLoading(true)
      setClient(null)
      setUpcomingGroups(null)
      setPastGroups(null)

      try {
        const found = await getClientByPhone(phoneValue)
        if (!found) {
          setError('No encontramos un cliente con ese celular.')
          return
        }

        const [appts, services] = await Promise.all([
          getAppointmentsByClient(found.id),
          fetchServices(),
        ])
        const serviceMap = services.reduce((map, s) => {
          map[s.id] = s
          return map
        }, {})

        const withService = appts.map((appt) => {
          const ids = Array.isArray(appt.serviceIds) ? appt.serviceIds : []
          const serviceList = ids.map((id) => serviceMap[id]).filter(Boolean)
          return { ...appt, services: serviceList }
        })

        const groupByDate = (list) => {
          const byDate = new Map()
          for (const appt of list) {
            if (!byDate.has(appt.date)) byDate.set(appt.date, [])
            byDate.get(appt.date).push(appt)
          }
          return Array.from(byDate.entries()).map(([date, appointments]) => ({
            date,
            appointments: appointments.sort((a, b) =>
              a.startTime.localeCompare(b.startTime),
            ),
          }))
        }

        const upcoming = withService
          .filter(
            (a) =>
              a.status !== APPOINTMENT_STATUS.CANCELLED &&
              !isSlotInPast(a.date, a.startTime),
          )
          .sort((a, b) =>
            `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
          )

        const past = withService
          .filter(
            (a) =>
              a.status === APPOINTMENT_STATUS.CANCELLED ||
              isSlotInPast(a.date, a.startTime),
          )
          .sort((a, b) =>
            `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`),
          )

        setClient(found)
        setUpcomingGroups(groupByDate(upcoming))
        setPastGroups(groupByDate(past))
        setPastVisible(5)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar las citas. Intentalo de nuevo.')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    search(phone)
  }, [phone, search])

  useEffect(() => {
    if (!cancelTarget) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape' && !cancelling) setCancelTarget(null)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [cancelTarget, cancelling])

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    setCancelError('')
    try {
      await cancelAppointment(cancelTarget)
      setCancelTarget(null)
      await search(phone)
    } catch (err) {
      console.error(err)
      setCancelError('No se pudo cancelar la cita. Intentalo de nuevo.')
    } finally {
      setCancelling(false)
    }
  }

  if (client) {
    const upcoming = upcomingGroups || []
    const past = pastGroups || []

    const renderGroup = (group, cancellable = false) => (
      <DayGroup key={group.date}>
        <DayHeader>
          <DayDot />
          {formatDateLong(group.date)}
        </DayHeader>
        {group.appointments.map((appt) => {
          const meta = STATUS_META[appt.status]
          const StatusIcon = meta?.Icon
          return (
            <AppointmentCard key={appt.id}>
              <ServicesBlock>
                <ServiceList services={appt.services} addons={appt.addons} />
              </ServicesBlock>
              <TimeLine>
                <FaClock size={12} />
                {formatTime12h(appt.startTime)} -{' '}
                {formatTime12h(appt.endTime || appt.startTime)}
              </TimeLine>
              <Status $color={meta?.color} $soft={meta?.soft}>
                {StatusIcon ? <StatusIcon size={11} /> : null}
                {meta ? meta.label : 'Confirmada'}
              </Status>
              <CardFooter>
                {cancellable ? (
                  <CancelLink
                    type="button"
                    onClick={() => {
                      setCancelError('')
                      setCancelTarget(appt)
                    }}
                  >
                    <FaBan size={12} />
                    Cancelar cita
                  </CancelLink>
                ) : (
                  <span />
                )}
                <ViewLink
                  type="button"
                  onClick={() => setTicketAppt(appt)}
                >
                  <FaFilePdf size={13} />
                  Ver comprobante
                </ViewLink>
              </CardFooter>
            </AppointmentCard>
          )
        })}
      </DayGroup>
    )

    const hasAny = upcoming.length > 0 || past.length > 0

    return (
      <div>
        <BackLink type="button" onClick={onBackHome}>
          <FaArrowLeft size={13} />
          Volver al inicio
        </BackLink>
        <HeaderRow>
          <div>
            <Title>Hola, {clientDisplayName(client)}</Title>
            <Subtitle>Tus próximas citas y tu historial.</Subtitle>
          </div>
        </HeaderRow>

        {!hasAny ? (
          <EmptyState
            icon={<FaCalendarCheck size={26} />}
            title="No tenés citas"
            description="Cuando agendes una cita la vas a ver acá."
          />
        ) : (
          <>
            <Section>
              <SectionTitle>Próximas citas</SectionTitle>
              {upcoming.length === 0 ? (
                <EmptyState
                  icon={<FaCalendarCheck size={26} />}
                  title="No hay próximas citas"
                  description="Todavía no tenés citas futuras agendadas."
                />
              ) : (
                <List>{upcoming.map((group) => renderGroup(group, true))}</List>
              )}
            </Section>

            <Section>
              <SectionTitle>Citas anteriores</SectionTitle>
              {past.length === 0 ? (
                <EmptyState
                  icon={<FaClock size={26} />}
                  title="Sin citas anteriores"
                  description="Acá vas a ver tu historial de citas."
                />
              ) : (
                <>
                  <List>
                    {past.slice(0, pastVisible).map((group) => renderGroup(group))}
                  </List>
                  {past.length > pastVisible && (
                    <VerMasButton
                      type="button"
                      onClick={() => setPastVisible((p) => p + 5)}
                    >
                      Ver más
                    </VerMasButton>
                  )}
                </>
              )}
            </Section>
          </>
        )}

        {ticketAppt && (
          <TicketModal
            services={ticketAppt.services}
            client={client}
            slot={{
              date: ticketAppt.date,
              startTime: ticketAppt.startTime,
              endTime: ticketAppt.endTime,
            }}
            appointment={ticketAppt}
            onClose={() => setTicketAppt(null)}
          />
        )}

        {cancelTarget && (
          <Overlay onClick={() => !cancelling && setCancelTarget(null)}>
            <Dialog role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <DialogTitle>¿Cancelar esta cita?</DialogTitle>
              <DialogText>
                {formatDateLong(cancelTarget.date)} a las{' '}
                {formatTime12h(cancelTarget.startTime)}. El horario volverá a quedar
                disponible.
              </DialogText>
              {cancelError && <ErrorText>{cancelError}</ErrorText>}
              <DialogActions>
                <KeepButton
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  disabled={cancelling}
                >
                  Volver
                </KeepButton>
                <ConfirmButton
                  type="button"
                  onClick={handleCancelConfirm}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
                </ConfirmButton>
              </DialogActions>
            </Dialog>
          </Overlay>
        )}
      </div>
    )
  }

  return (
    <div>
      <BackLink type="button" onClick={onBackHome}>
        <FaArrowLeft size={13} />
        Volver al inicio
      </BackLink>
      <Title>Ver mis citas</Title>
      <Subtitle>Tus próximas citas y tu historial.</Subtitle>

      {loading ? (
        <Center>
          <Spinner />
        </Center>
      ) : error ? (
        <Notice>
          <Alert tone="error">{error}</Alert>
        </Notice>
      ) : (
        <Notice>
          <Alert tone="info">No se encontraron citas.</Alert>
        </Notice>
      )}
    </div>
  )
}

export default MyAppointments