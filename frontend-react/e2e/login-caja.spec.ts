import { test, expect } from '@playwright/test'

test.describe('Flujo de autenticación', () => {
  test('muestra el formulario de login al visitar la app', async ({ page }) => {
    await page.goto('/login')

    // Verificar que se muestra el formulario
    await expect(page.getByRole('heading', { name: /restaurante v2/i })).toBeVisible()
    await expect(page.getByLabel(/nombre de usuario/i)).toBeVisible()
    await expect(page.getByLabel(/contraseña/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible()
  })

  test('muestra errores de validación con campos vacíos', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('button', { name: /iniciar sesión/i }).click()

    await expect(page.getByText('El nombre de usuario es requerido')).toBeVisible()
    await expect(page.getByText('La contraseña es requerida')).toBeVisible()
  })

  test('realiza login exitoso y redirige al dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/nombre de usuario/i).fill('admin')
    await page.getByLabel(/contraseña/i).fill('Admin123!')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()

    // Debería redirigir al dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/nombre de usuario/i).fill('wronguser')
    await page.getByLabel(/contraseña/i).fill('wrongpass')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()

    // Debería seguir en la página de login
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Flujo de Caja', () => {
  test.beforeEach(async ({ page }) => {
    // Simular login guardando token y usuario en localStorage
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'mock-jwt-token')
      localStorage.setItem(
        'usuario',
        JSON.stringify({
          id: '1',
          nombre_usuario: 'admin',
          nombre: 'Administrador',
          rol: 'admin',
        })
      )
    })
  })

  test('accede a la página de caja después del login', async ({ page }) => {
    await page.goto('/caja')

    // Verificar que no redirige al login
    await expect(page).not.toHaveURL(/\/login/)
    // Debería mostrar la página de caja
    await expect(page.getByText(/caja/i).first()).toBeVisible()
  })

  test('el sidebar muestra el enlace a Caja', async ({ page }) => {
    await page.goto('/dashboard')

    // Buscar el enlace de caja en el sidebar
    await expect(page.getByRole('link', { name: /caja/i })).toBeVisible()
  })
})
