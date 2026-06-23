import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { server } from './test/mocks/server'

// Iniciar MSW antes de todos los tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Resetear handlers entre tests
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
  localStorage.clear()
})

// Cerrar MSW después de todos los tests
afterAll(() => server.close())
