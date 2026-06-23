import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:4000/api'

export const handlers = [
  // Auth
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { nombre_usuario: string; contrasena: string }

    if (body.nombre_usuario === 'admin' && body.contrasena === 'Admin123!') {
      return HttpResponse.json({
        access_token: 'mock-jwt-token-admin',
        usuario: {
          id: '1',
          nombre_usuario: 'admin',
          nombre: 'Administrador',
          rol: 'admin',
        },
      })
    }

    if (body.nombre_usuario === 'cajero1' && body.contrasena === 'Cajero123!') {
      return HttpResponse.json({
        access_token: 'mock-jwt-token-cajero',
        usuario: {
          id: '2',
          nombre_usuario: 'cajero1',
          nombre: 'Cajero Uno',
          rol: 'cajero',
        },
      })
    }

    return HttpResponse.json(
      { message: 'Credenciales inválidas' },
      { status: 401 }
    )
  }),

  // Caja - obtener caja abierta
  http.get(`${API_BASE}/caja/actual`, () => {
    return HttpResponse.json(null)
  }),

  // Caja - historial
  http.get(`${API_BASE}/caja/historial`, () => {
    return HttpResponse.json([
      {
        id: 1,
        fecha: '2026-03-30',
        hora_apertura: '08:00',
        hora_cierre: '16:00',
        usuario_id: '1',
        monto_inicial: 1000,
        b200: 2,
        b100: 3,
        b50: 4,
        b20: 5,
        b10: 6,
        b5: 7,
        m2: 8,
        m1: 9,
        m050: 10,
        m020: 11,
        m010: 12,
        ventas_efectivo: 500,
        ventas_qr: 300,
        total_salidas: 100,
        cerrada: true,
        cierre_obs: null,
      },
    ])
  }),

  // Caja - detalle
  http.get(`${API_BASE}/caja/:id/detalle`, () => {
    return HttpResponse.json({
      caja: {
        id: 1,
        fecha: '2026-03-30',
        hora_apertura: '08:00',
        hora_cierre: '16:00',
        usuario_id: '1',
        monto_inicial: 1000,
        b200: 2,
        b100: 3,
        b50: 4,
        b20: 5,
        b10: 6,
        b5: 7,
        m2: 8,
        m1: 9,
        m050: 10,
        m020: 11,
        m010: 12,
        ventas_efectivo: 500,
        ventas_qr: 300,
        total_salidas: 100,
        cerrada: true,
        cierre_obs: null,
      },
      resumen: {
        monto_inicial: 1000,
        ventas_efectivo: 500,
        ventas_qr: 300,
        gastos_efectivo: 50,
        gastos_qr: 50,
        efectivo_esperado: 1450,
        total_qr: 300,
        total_del_dia: 800,
        total_gastos: 100,
      },
      gastos: [],
    })
  }),

  // Caja - abrir
  http.post(`${API_BASE}/caja/abrir`, () => {
    return HttpResponse.json({
      id: 2,
      fecha: '2026-03-30',
      hora_apertura: '09:00',
      hora_cierre: null,
      usuario_id: '1',
      monto_inicial: 500,
      b200: 0,
      b100: 5,
      b50: 0,
      b20: 0,
      b10: 0,
      b5: 0,
      m2: 0,
      m1: 0,
      m050: 0,
      m020: 0,
      m010: 0,
      ventas_efectivo: 0,
      ventas_qr: 0,
      total_salidas: 0,
      cerrada: false,
      cierre_obs: null,
    })
  }),

  // Caja - historial de gastos
  http.get(`${API_BASE}/caja/gastos/historial`, () => {
    return HttpResponse.json([])
  }),
]
