import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { LoginForm } from './login-form'

// Mock del hook useAuth
const mockLogin = vi.fn()
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    mockLogin.mockReset()
  })

  it('renderiza el formulario de login con campos de usuario y contraseña', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra errores de validación cuando los campos están vacíos', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText('El nombre de usuario es requerido')).toBeInTheDocument()
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    })
  })

  it('llama a login con las credenciales correctas al enviar', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(undefined)

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/nombre de usuario/i), 'admin')
    await user.type(screen.getByLabelText(/contraseña/i), 'Admin123!')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        nombre_usuario: 'admin',
        contrasena: 'Admin123!',
      })
    })
  })

  it('deshabilita el botón mientras se envía', async () => {
    const user = userEvent.setup()
    // login nunca se resuelve para mantener el estado de submitting
    mockLogin.mockImplementation(() => new Promise(() => {}))

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/nombre de usuario/i), 'admin')
    await user.type(screen.getByLabelText(/contraseña/i), 'Admin123!')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeDisabled()
    })
  })
})
