import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { AbrirCajaForm } from './abrir-caja-form'

// Mock del servicio de caja
vi.mock('../services/caja.service', () => ({
  cajaService: {
    obtenerHistorial: vi.fn().mockResolvedValue([]),
    abrirCaja: vi.fn().mockResolvedValue({ id: 1 }),
  },
}))

// Mock de sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('AbrirCajaForm', () => {
  const onCajaOpened = vi.fn()

  it('renderiza el formulario con todos los campos de billetes y monedas', async () => {
    render(<AbrirCajaForm onCajaOpened={onCajaOpened} />)

    // Verificar títulos de secciones
    expect(screen.getByText('Apertura de Turno')).toBeInTheDocument()
    expect(screen.getByText('Billetes')).toBeInTheDocument()
    expect(screen.getByText('Monedas')).toBeInTheDocument()
    expect(screen.getByText('Total en Efectivo')).toBeInTheDocument()

    // Verificar denominaciones de billetes
    expect(screen.getByText('Bs 200')).toBeInTheDocument()
    expect(screen.getByText('Bs 100')).toBeInTheDocument()
    expect(screen.getByText('Bs 50')).toBeInTheDocument()
    expect(screen.getByText('Bs 20')).toBeInTheDocument()
    expect(screen.getByText('Bs 10')).toBeInTheDocument()

    // Verificar denominaciones de monedas
    expect(screen.getByText('Bs 5')).toBeInTheDocument()
    expect(screen.getByText('Bs 2')).toBeInTheDocument()
    expect(screen.getByText('Bs 1')).toBeInTheDocument()
    expect(screen.getByText('Bs 0.50')).toBeInTheDocument()
    expect(screen.getByText('Bs 0.20')).toBeInTheDocument()
    expect(screen.getByText('Bs 0.10')).toBeInTheDocument()
  })

  it('muestra Bs 0.00 como total inicial', async () => {
    render(<AbrirCajaForm onCajaOpened={onCajaOpened} />)

    // El total en efectivo muestra "Bs 0.00" en el card de resumen
    await waitFor(() => {
      const totalCard = screen.getByText('Total en Efectivo').closest('[data-slot="card"]')
      expect(totalCard).toHaveTextContent('Bs 0.00')
    })
  })

  it('calcula el total correctamente al ingresar 5 billetes de Bs 100', async () => {
    const user = userEvent.setup()
    render(<AbrirCajaForm onCajaOpened={onCajaOpened} />)

    // Esperar a que cargue (sin historial)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /abrir caja/i })).toBeInTheDocument()
    })

    // Encontrar todos los inputs de tipo number
    const inputs = screen.getAllByRole('spinbutton')

    // El input de Bs 100 es el segundo (índice 1) en la lista de billetes
    const b100Input = inputs[1]

    await user.clear(b100Input)
    await user.type(b100Input, '5')

    // 5 billetes de Bs 100 = Bs 500.00
    await waitFor(() => {
      const totalCard = screen.getByText('Total en Efectivo').closest('[data-slot="card"]')
      expect(totalCard).toHaveTextContent('Bs 500.00')
    })
  })

  it('calcula el total con billetes y monedas combinados', async () => {
    const user = userEvent.setup()
    render(<AbrirCajaForm onCajaOpened={onCajaOpened} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /abrir caja/i })).toBeInTheDocument()
    })

    const inputs = screen.getAllByRole('spinbutton')

    // 2 billetes de Bs 200 = 400
    await user.clear(inputs[0])
    await user.type(inputs[0], '2')

    // 3 billetes de Bs 50 = 150
    await user.clear(inputs[2])
    await user.type(inputs[2], '3')

    // Total esperado: 400 + 150 = 550.00
    await waitFor(() => {
      const totalCard = screen.getByText('Total en Efectivo').closest('[data-slot="card"]')
      expect(totalCard).toHaveTextContent('Bs 550.00')
    })
  })

  it('el botón submit está habilitado después de cargar', async () => {
    render(<AbrirCajaForm onCajaOpened={onCajaOpened} />)

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /abrir caja/i })
      expect(button).not.toBeDisabled()
    })
  })

  it('envía el formulario al hacer click en Abrir Caja', async () => {
    const user = userEvent.setup()
    const { cajaService } = await import('../services/caja.service')

    render(<AbrirCajaForm onCajaOpened={onCajaOpened} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /abrir caja/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /abrir caja/i }))

    await waitFor(() => {
      expect(cajaService.abrirCaja).toHaveBeenCalled()
      expect(onCajaOpened).toHaveBeenCalled()
    })
  })
})
