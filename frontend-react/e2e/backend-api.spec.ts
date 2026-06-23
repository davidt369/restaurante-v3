import { test, expect } from '@playwright/test'

test.describe('Pruebas de API (Backend)', () => {
  const API_URL = 'http://localhost:3000/api'
  let token: string

  test.beforeAll(async ({ request }) => {
    // Autenticarse para obtener el token
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        nombre_usuario: 'admin',
        contrasena: 'Admin123!'
      }
    })
    
    expect(loginResponse.ok()).toBeTruthy()
    const loginData = await loginResponse.json()
    token = loginData.access_token
  })

  test('debería obtener el estado de la caja (o null si está cerrada)', async ({ request }) => {
    const response = await request.get(`${API_URL}/caja/actual`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    
    // Puede ser null si no hay caja abierta, o un objeto con id si hay una
    if (data !== null) {
      expect(data).toHaveProperty('id')
    } else {
      expect(data).toBeNull()
    }
  })

  test('debería listar transacciones', async ({ request }) => {
    const response = await request.get(`${API_URL}/transacciones`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data)).toBeTruthy()
  })
})
