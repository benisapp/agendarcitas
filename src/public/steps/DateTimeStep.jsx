import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { FaArrowLeft } from 'react-icons/fa6'
import { getAppointmentsByDate, APPOINTMENT_STATUS } from '../../appointments'
import { getSchedule } from '../../settings'
import { Spinner } from '../../components/ui'
import {
  formatDateString,
  formatDayShort,
  formatTime12h,
  generateSlots,
  isSlotInPast,
  nextWorkingDays,
  overlaps,
} from '../../utils/dates'

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

const SectionLabel = styled.p`
  margin: 1.25rem 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
`

const DaysRow = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
`

const DayChip = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  min-width: 3.5rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid ${({ $selected }) => ($selected ? 'var(--color-primary)' : 'var(--color-border)')};
  border-radius: var(--radius-md);
  background: ${({ $selected }) => ($selected ? 'var(--color-primary)' : 'var(--color-surface)')};
  color: ${({ $selected }) => ($selected ? 'var(--color-on-primary)' : 'var(--color-text)')};
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    border-color: var(--color-primary);
  }
`

const DayWeek = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  opacity: 0.85;
`

const DayNumber = styled.span`
  font-size: 1rem;
  font-weight: 700;
`

const SlotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
  gap: 0.5rem;
`

const Slot = styled.button`
  padding: 0.625rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
  }
`

const Empty = styled.p`
  margin: 1rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
`

const Center = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`

function DateTimeStep({ service, onBack, onSlotSelected }) {
  const [schedule, setSchedule] = useState(null)
  const days = useMemo(
    () => nextWorkingDays(schedule?.daysAhead ?? 3),
    [schedule],
  )
  const [selectedDate, setSelectedDate] = useState(null)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    let mounted = true
    getSchedule()
      .then((data) => {
        if (mounted) setSchedule(data)
      })
      .catch((err) => {
        console.error(err)
        if (mounted) setSchedule(null)
      })
    return () => {
      mounted = false
    }
  }, [])

  const loadSlots = async (date) => {
    setLoadingSlots(true)
    try {
      const existing = await getAppointmentsByDate(date)
      const available = generateSlots(service.duration, {
        open: schedule?.openTime,
        close: schedule?.closeTime,
        step: schedule?.slotStep,
      }).filter(
        (slot) =>
          !isSlotInPast(date, slot.startTime) &&
          !existing.some(
            (appt) =>
              appt.status !== APPOINTMENT_STATUS.CANCELLED &&
              overlaps(slot.startTime, slot.endTime, appt.startTime, appt.endTime),
          ),
      )
      setSlots(available)
    } catch (err) {
      console.error(err)
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleSelectDay = (date) => {
    setSelectedDate(date)
    loadSlots(date)
  }

  return (
    <div>
      <BackLink type="button" onClick={onBack}>
        <FaArrowLeft size={13} />
        Volver
      </BackLink>
      <Title>¿Cuándo querés tu cita?</Title>
      <Subtitle>{service.name} · {service.duration} minutos</Subtitle>

      <SectionLabel>Elegí un día</SectionLabel>
      <DaysRow>
        {days.map((date) => {
          const value = formatDateString(date)
          const { weekday, day } = formatDayShort(date)
          return (
            <DayChip
              key={value}
              type="button"
              $selected={selectedDate === value}
              onClick={() => handleSelectDay(value)}
            >
              <DayWeek>{weekday}</DayWeek>
              <DayNumber>{day}</DayNumber>
            </DayChip>
          )
        })}
      </DaysRow>

      {selectedDate && (
        <>
          <SectionLabel>Elegí un horario</SectionLabel>
          {loadingSlots ? (
            <Center>
              <Spinner />
            </Center>
          ) : slots.length === 0 ? (
            <Empty>No hay horarios disponibles para este día.</Empty>
          ) : (
            <SlotsGrid>
              {slots.map((slot) => (
                <Slot
                  key={slot.startTime}
                  type="button"
                  onClick={() =>
                    onSlotSelected({
                      date: selectedDate,
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                    })
                  }
                >
                  {formatTime12h(slot.startTime)}
                </Slot>
              ))}
            </SlotsGrid>
          )}
        </>
      )}
    </div>
  )
}

export default DateTimeStep
