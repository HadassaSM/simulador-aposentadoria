import { describe, expect, it } from 'vitest'
import { anuidadeAntecipada, expectativaVida, simular, taxaMensal, tpx } from './atuaria'

const base = {
  idadeAtual: 25,
  idadeAposentadoria: 65,
  rendaMensal: 5000,
  taxaAnual: 0.04,
  saldoInicial: 0,
  aporteMensal: 0,
}

describe('mortalidade (SUSM)', () => {
  it('reproduz ä_60 = 14,9041 a 5% a.a. (Dickson, Hardy & Waters)', () => {
    expect(anuidadeAntecipada(60, 0.05)).toBeCloseTo(14.9041, 3)
  })

  it('probabilidade de sobrevivência decresce', () => {
    expect(tpx(40, 0)).toBe(1)
    expect(tpx(40, 10)).toBeGreaterThan(tpx(40, 20))
    expect(expectativaVida(30)).toBeGreaterThan(expectativaVida(60))
  })
})

describe('simular', () => {
  it('bate com a API Python para o caso de referência', () => {
    const r = simular(base)
    expect(r.reservaNecessaria).toBeCloseTo(864975.6, 0)
    expect(r.aporteNecessario).toBeCloseTo(742.55, 1)
  })

  it('aportando o necessário, o saldo na aposentadoria atinge a reserva', () => {
    const { aporteNecessario, reservaNecessaria } = simular(base)
    const r = simular({ ...base, aporteMensal: aporteNecessario })
    expect(r.saldoNaAposentadoria).toBeCloseTo(reservaNecessaria, 0)
  })

  it('sem aportes, o saldo zera logo na aposentadoria', () => {
    const r = simular(base)
    expect(r.idadeSaldoZera).toBeCloseTo(65 + 1 / 12, 5)
  })

  it('saldo inicial grande dispensa aportes', () => {
    expect(simular({ ...base, saldoInicial: 5_000_000 }).aporteNecessario).toBe(0)
  })

  it('gera um ponto por ano até os 100 anos', () => {
    const r = simular(base)
    expect(r.serie[0].idade).toBe(25)
    expect(r.serie.at(-1)!.idade).toBe(100)
    expect(r.serie).toHaveLength(76)
  })

  it('taxa mensal equivalente', () => {
    expect((1 + taxaMensal(0.04)) ** 12).toBeCloseTo(1.04, 10)
  })
})
