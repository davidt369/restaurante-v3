import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/test-utils'
import { TransaccionesStatsTabs } from './transacciones-stats-tabs'
import { Tabs } from '@/components/ui/tabs'

describe('TransaccionesStatsTabs', () => {
  const mockCounts = {
    todos: 50,
    pendiente: 10,
    abierto: 15,
    cerrado: 20,
    cocina: 5,
  }

  it('renders correctly with counts', () => {
    render(
      <Tabs defaultValue="todos">
        <TransaccionesStatsTabs counts={mockCounts} />
      </Tabs>
    )

    expect(screen.getByText(/Pendientes \(10\)/)).toBeInTheDocument()
    expect(screen.getByText(/Cocina \(5\)/)).toBeInTheDocument()
    expect(screen.getByText(/Abiertos \(15\)/)).toBeInTheDocument()
    expect(screen.getByText(/Cerrados \(20\)/)).toBeInTheDocument()
    expect(screen.getByText(/Todos \(50\)/)).toBeInTheDocument()
  })

  it('renders ChefHat icon for Cocina tab', () => {
    const { container } = render(
      <Tabs defaultValue="todos">
        <TransaccionesStatsTabs counts={mockCounts} />
      </Tabs>
    )

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})
