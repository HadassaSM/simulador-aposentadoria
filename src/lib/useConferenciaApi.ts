import { useEffect, useState } from 'react'
import { buscarPlano, ErroApi, type PlanoApi } from './api'
import type { Entrada } from './atuaria'

export type EstadoConferencia =
  | { status: 'carregando'; lento: boolean }
  | { status: 'ok'; plano: PlanoApi }
  | { status: 'erro'; mensagem: string }

const ESPERA_DIGITACAO_MS = 600
/** Depois disso, avisamos que o servidor gratuito provavelmente está "acordando". */
const AVISO_LENTIDAO_MS = 3000

const CARREGANDO: EstadoConferencia = { status: 'carregando', lento: false }

export function useConferenciaApi(entrada: Entrada | null): EstadoConferencia | null {
  // Cada estado guarda a entrada que o originou: uma resposta antiga nunca é
  // comparada com valores novos enquanto a próxima consulta não chega.
  const [atual, setAtual] = useState<{ para: Entrada; estado: EstadoConferencia } | null>(null)

  useEffect(() => {
    if (!entrada) return
    const controle = new AbortController()
    const definir = (estado: EstadoConferencia) => setAtual({ para: entrada, estado })
    let avisoLento: ReturnType<typeof setTimeout> | undefined

    const disparo = setTimeout(() => {
      avisoLento = setTimeout(() => definir({ status: 'carregando', lento: true }), AVISO_LENTIDAO_MS)

      buscarPlano(entrada, controle.signal)
        .then((plano) => definir({ status: 'ok', plano }))
        .catch((erro: unknown) => {
          if (controle.signal.aborted) return
          const mensagem = erro instanceof ErroApi ? erro.message : 'Não foi possível conectar à API.'
          definir({ status: 'erro', mensagem })
        })
        .finally(() => clearTimeout(avisoLento))
    }, ESPERA_DIGITACAO_MS)

    return () => {
      clearTimeout(disparo)
      clearTimeout(avisoLento)
      controle.abort()
    }
  }, [entrada])

  if (!entrada) return null
  return atual?.para === entrada ? atual.estado : CARREGANDO
}
