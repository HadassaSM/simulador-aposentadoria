import type { Entrada } from './atuaria'

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'https://atuaria-api.onrender.com'

export interface PlanoApi {
  reservaNecessaria: number
  aporteMensal: number
  expectativaVida: number
}

export class ErroApi extends Error {}

/** Consulta POST /aposentadoria/plano da Atuária API. */
export async function buscarPlano(e: Entrada, signal?: AbortSignal, base = API_URL): Promise<PlanoApi> {
  const resposta = await fetch(`${base}/aposentadoria/plano`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idade_atual: e.idadeAtual,
      idade_aposentadoria: e.idadeAposentadoria,
      renda_mensal: e.rendaMensal,
      taxa_juros: e.taxaAnual,
      saldo_inicial: e.saldoInicial,
    }),
    signal,
  })

  if (resposta.status === 422) throw new ErroApi('Dados fora dos limites aceitos pela API.')
  if (!resposta.ok) throw new ErroApi(`A API respondeu com erro ${resposta.status}.`)

  const corpo = await resposta.json()
  return {
    reservaNecessaria: corpo.reserva_necessaria,
    aporteMensal: corpo.aporte_mensal,
    expectativaVida: corpo.expectativa_vida_na_aposentadoria,
  }
}
