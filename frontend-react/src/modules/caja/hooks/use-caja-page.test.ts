import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCajaPage } from './use-caja-page'

// Mock del servicio de caja
vi.mock('../services/caja.service', () => ({
  cajaService: {
    obtenerCajaAbierta: vi.fn().mockResolvedValue(null),
    obtenerHistorial: vi.fn().mockResolvedValue([
      {
        id: 1,
        fecha: '2026-03-30',
        hora_apertura: '08:00',
        hora_cierre: '16:00',
        usuario_id: '1',
        monto_inicial: 1000,
        cerrada: true,
      },
    ]),
    obtenerHistorialGastos: vi.fn().mockResolvedValue([]),
  },
}))

// Mock de sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

describe('useCajaPage', () => {
  it('inicia con loading en true', () => {
    const { result } = renderHook(() => useCajaPage())
    expect(result.current.loading).toBe(true)
  })

  it('carga el estado de la caja al montar', async () => {
    const { result } = renderHook(() => useCajaPage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.cajaAbierta).toBeNull()
  })

  it('carga el historial de cajas y gastos', async () => {
    const { result } = renderHook(() => useCajaPage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await waitFor(() => {
      expect(result.current.historialCajas).toHaveLength(1)
      expect(result.current.historialGastos).toHaveLength(0)
    })
  })

  it('handleCajaOpened refresca los datos', async () => {
    const { cajaService } = await import('../services/caja.service')
    const { result } = renderHook(() => useCajaPage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    vi.clearAllMocks()

    act(() => {
      result.current.handleCajaOpened()
    })

    expect(cajaService.obtenerCajaAbierta).toHaveBeenCalled()
    expect(cajaService.obtenerHistorial).toHaveBeenCalled()
    expect(cajaService.obtenerHistorialGastos).toHaveBeenCalled()
  })

  it('handleCajaClosed cierra estado de cierre', async () => {
    const { result } = renderHook(() => useCajaPage())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setIsClosing(true)
    })

    expect(result.current.isClosing).toBe(true)

    act(() => {
      result.current.handleCajaClosed()
    })

    expect(result.current.isClosing).toBe(false)
  })
})
