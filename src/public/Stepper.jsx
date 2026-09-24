import { Fragment } from 'react'
import styled from 'styled-components'

const steps = ['Servicio', 'Fecha y hora', 'Confirmar']

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const Circle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${({ $state }) =>
    $state === 'active' || $state === 'done'
      ? 'var(--color-primary)'
      : 'var(--color-border)'};
  color: ${({ $state }) =>
    $state === 'active' || $state === 'done'
      ? 'var(--color-on-primary)'
      : 'var(--color-text-muted)'};
`

const Label = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ $active }) =>
    $active ? 'var(--color-text)' : 'var(--color-text-muted)'};
  display: none;

  @media (min-width: 480px) {
    display: inline;
  }
`

const Connector = styled.span`
  width: 1.25rem;
  height: 2px;
  background: var(--color-border);
  flex-shrink: 0;
`

function Stepper({ current }) {
  return (
    <Wrap>
      {steps.map((label, i) => {
        const n = i + 1
        const state = n === current ? 'active' : n < current ? 'done' : 'todo'
        return (
          <Fragment key={label}>
            <Step>
              <Circle $state={state}>{n}</Circle>
              <Label $active={n === current}>{label}</Label>
            </Step>
            {i < steps.length - 1 && <Connector />}
          </Fragment>
        )
      })}
    </Wrap>
  )
}

export default Stepper
