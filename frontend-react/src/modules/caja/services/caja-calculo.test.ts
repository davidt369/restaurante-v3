import { describe, it, expect } from 'vitest'
import * as z from 'zod'

// Schema de validación del formulario de abrir caja (replicado del componente)
const abrirCajaSchema = z.object({
  b200: z.number().min(0).optional(),
  b100: z.number().min(0).optional(),
  b50: z.number().min(0).optional(),
  b20: z.number().min(0).optional(),
  b10: z.number().min(0).optional(),
  b5: z.number().min(0).optional(),
  m2: z.number().min(0).optional(),
  m1: z.number().min(0).optional(),
  m050: z.number().min(0).optional(),
  m020: z.number().min(0).optional(),
  m010: z.number().min(0).optional(),
})

// Schema del login
const loginSchema = z.object({
  nombre_usuario: z.string().min(1, 'El nombre de usuario es requerido'),
  contrasena: z.string().min(1, 'La contraseña es requerida'),
})

// Función helper para calcular totales (replicada del componente)
function calcularTotal(values: Record<string, number | undefined>) {
  const denominaciones = [
    { key: 'b200', valor: 200 },
    { key: 'b100', valor: 100 },
    { key: 'b50', valor: 50 },
    { key: 'b20', valor: 20 },
    { key: 'b10', valor: 10 },
    { key: 'b5', valor: 5 },
    { key: 'm2', valor: 2 },
    { key: 'm1', valor: 1 },
    { key: 'm050', valor: 0.5 },
    { key: 'm020', valor: 0.2 },
    { key: 'm010', valor: 0.1 },
  ]

  return denominaciones.reduce((total, { key, valor }) => {
    const cantidad = values[key] || 0
    return total + cantidad * valor
  }, 0)
}

describe('Validación de esquemas Zod', () => {
  describe('abrirCajaSchema', () => {
    it('acepta valores válidos con todos los campos en 0', () => {
      const result = abrirCajaSchema.safeParse({
        b200: 0, b100: 0, b50: 0, b20: 0, b10: 0,
        b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
      })
      expect(result.success).toBe(true)
    })

    it('acepta valores válidos con cantidades positivas', () => {
      const result = abrirCajaSchema.safeParse({
        b200: 5, b100: 10, b50: 20, b20: 30, b10: 40,
        b5: 50, m2: 60, m1: 70, m050: 80, m020: 90, m010: 100,
      })
      expect(result.success).toBe(true)
    })

    it('rechaza valores negativos en billetes', () => {
      const result = abrirCajaSchema.safeParse({
        b200: -1, b100: 0, b50: 0, b20: 0, b10: 0,
        b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
      })
      expect(result.success).toBe(false)
    })

    it('permite campos opcionales no definidos', () => {
      const result = abrirCajaSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('loginSchema', () => {
    it('acepta credenciales válidas', () => {
      const result = loginSchema.safeParse({
        nombre_usuario: 'admin',
        contrasena: 'Admin123!',
      })
      expect(result.success).toBe(true)
    })

    it('rechaza usuario vacío', () => {
      const result = loginSchema.safeParse({
        nombre_usuario: '',
        contrasena: 'Admin123!',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El nombre de usuario es requerido')
      }
    })

    it('rechaza contraseña vacía', () => {
      const result = loginSchema.safeParse({
        nombre_usuario: 'admin',
        contrasena: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La contraseña es requerida')
      }
    })

    it('rechaza cuando ambos campos están vacíos', () => {
      const result = loginSchema.safeParse({
        nombre_usuario: '',
        contrasena: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2)
      }
    })
  })
})

describe('Cálculo de totales de efectivo', () => {
  it('retorna 0 cuando todos los campos son 0', () => {
    const total = calcularTotal({
      b200: 0, b100: 0, b50: 0, b20: 0, b10: 0,
      b5: 0, m2: 0, m1: 0, m050: 0, m020: 0, m010: 0,
    })
    expect(total).toBe(0)
  })

  it('calcula correctamente 5 billetes de Bs 100 = Bs 500', () => {
    const total = calcularTotal({ b100: 5 })
    expect(total).toBe(500)
  })

  it('calcula correctamente 2 billetes de Bs 200 + 3 de Bs 50 = Bs 550', () => {
    const total = calcularTotal({ b200: 2, b50: 3 })
    expect(total).toBe(550)
  })

  it('calcula correctamente con monedas decimales', () => {
    const total = calcularTotal({
      m050: 10, // 10 x 0.50 = 5.00
      m020: 5,  // 5 x 0.20 = 1.00
      m010: 3,  // 3 x 0.10 = 0.30
    })
    expect(total).toBeCloseTo(6.30)
  })

  it('calcula correctamente una combinación completa de billetes y monedas', () => {
    const total = calcularTotal({
      b200: 1,  // 200
      b100: 2,  // 200
      b50: 1,   // 50
      b20: 3,   // 60
      b10: 4,   // 40
      b5: 2,    // 10
      m2: 5,    // 10
      m1: 10,   // 10
      m050: 4,  // 2
      m020: 5,  // 1
      m010: 10, // 1
    })
    expect(total).toBeCloseTo(584.00)
  })

  it('maneja campos undefined como 0', () => {
    const total = calcularTotal({ b100: 5 })
    expect(total).toBe(500)
  })
})
