/**
 * Matemática atuarial com mortalidade de Gompertz-Makeham.
 * Parâmetros do Standard Ultimate Survival Model (Dickson, Hardy & Waters):
 *   mu_x = A + B * c^x
 */
const A = 0.00022
const B = 2.7e-6
const C = 1.124
const IDADE_MAXIMA = 130

/** Probabilidade de (x) sobreviver t anos. */
export function tpx(x: number, t: number): number {
  if (t <= 0) return 1
  return Math.exp(-A * t - (B * C ** x * (C ** t - 1)) / Math.log(C))
}

/** Expectativa de vida completa aproximada: soma de kpx + 1/2. */
export function expectativaVida(x: number): number {
  let soma = 0
  for (let k = 1; k <= IDADE_MAXIMA - Math.floor(x); k++) soma += tpx(x, k)
  return soma + 0.5
}

/** ä_x: anuidade vitalícia antecipada de 1 por ano. */
export function anuidadeAntecipada(x: number, i: number): number {
  const v = 1 / (1 + i)
  let soma = 0
  for (let k = 0; k < IDADE_MAXIMA - Math.floor(x); k++) soma += v ** k * tpx(x, k)
  return soma
}

/** ä_x^(12) pela aproximação de Woolhouse. */
export function anuidadeMensal(x: number, i: number): number {
  return anuidadeAntecipada(x, i) - 11 / 24
}

export interface Entrada {
  idadeAtual: number
  idadeAposentadoria: number
  rendaMensal: number
  /** taxa real anual efetiva, ex.: 0.04 */
  taxaAnual: number
  saldoInicial: number
  aporteMensal: number
}

export interface PontoSaldo {
  idade: number
  saldo: number
}

export interface Resultado {
  reservaNecessaria: number
  aporteNecessario: number
  saldoNaAposentadoria: number
  /** idade em que o saldo zera pagando a renda (sem mutualismo); null se dura até o fim da projeção */
  idadeSaldoZera: number | null
  expectativaVida: number
  serie: PontoSaldo[]
}

const IDADE_FIM_GRAFICO = 100

export function taxaMensal(taxaAnual: number): number {
  return (1 + taxaAnual) ** (1 / 12) - 1
}

export function simular(e: Entrada): Resultado {
  const iM = taxaMensal(e.taxaAnual)
  const meses = (e.idadeAposentadoria - e.idadeAtual) * 12
  const reservaNecessaria = 12 * e.rendaMensal * anuidadeMensal(e.idadeAposentadoria, e.taxaAnual)

  const saldoProjetado = e.saldoInicial * (1 + iM) ** meses
  const fator = iM === 0 ? meses : (((1 + iM) ** meses - 1) / iM) * (1 + iM)
  const aporteNecessario = Math.max(reservaNecessaria - saldoProjetado, 0) / fator

  const serie: PontoSaldo[] = [{ idade: e.idadeAtual, saldo: e.saldoInicial }]
  let saldo = e.saldoInicial
  let idadeSaldoZera: number | null = null
  const totalMeses = (IDADE_FIM_GRAFICO - e.idadeAtual) * 12

  for (let m = 1; m <= totalMeses; m++) {
    if (m <= meses) {
      saldo = (saldo + e.aporteMensal) * (1 + iM)
    } else {
      saldo = (saldo - e.rendaMensal) * (1 + iM)
      if (saldo <= 0) {
        saldo = 0
        idadeSaldoZera ??= e.idadeAtual + m / 12
      }
    }
    if (m % 12 === 0) serie.push({ idade: e.idadeAtual + m / 12, saldo })
  }

  return {
    reservaNecessaria,
    aporteNecessario,
    saldoNaAposentadoria: serie.find((p) => p.idade === e.idadeAposentadoria)?.saldo ?? saldo,
    idadeSaldoZera,
    expectativaVida: expectativaVida(e.idadeAposentadoria),
    serie,
  }
}
