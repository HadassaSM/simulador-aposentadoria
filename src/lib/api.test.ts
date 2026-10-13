import { afterEach, describe, expect, it, vi } from 'vitest'
import { buscarPlano, ErroApi } from './api'

const entrada = {
  idadeAtual: 25,
  idadeAposentadoria: 65,
  rendaMensal: 5000,
  taxaAnual: 0.04,
  saldoInicial: 1000,
  aporteMensal: 500,
}

function respostaFalsa(status: number, corpo: unknown = {}) {
  return vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status }))
}

afterEach(() => vi.unstubAllGlobals())

describe('buscarPlano', () => {
  it('envia o corpo no formato da API e converte a resposta', async () => {
    const fetchFalso = respostaFalsa(200, {
      reserva_necessaria: 864975.6,
      aporte_mensal: 742.55,
      meses_contribuicao: 480,
      total_aportado: 356426.17,
      expectativa_vida_na_aposentadoria: 22.74,
    })
    vi.stubGlobal('fetch', fetchFalso)

    const plano = await buscarPlano(entrada, undefined, 'https://api.teste')

    const [url, opcoes] = fetchFalso.mock.calls[0]
    expect(url).toBe('https://api.teste/aposentadoria/plano')
    expect(JSON.parse(opcoes.body)).toEqual({
      idade_atual: 25,
      idade_aposentadoria: 65,
      renda_mensal: 5000,
      taxa_juros: 0.04,
      saldo_inicial: 1000,
    })
    expect(plano).toEqual({ reservaNecessaria: 864975.6, aporteMensal: 742.55, expectativaVida: 22.74 })
  })

  it('traduz 422 em mensagem amigável', async () => {
    vi.stubGlobal('fetch', respostaFalsa(422))
    await expect(buscarPlano(entrada)).rejects.toThrow(new ErroApi('Dados fora dos limites aceitos pela API.'))
  })

  it('informa outros erros HTTP', async () => {
    vi.stubGlobal('fetch', respostaFalsa(503))
    await expect(buscarPlano(entrada)).rejects.toThrow('erro 503')
  })
})
