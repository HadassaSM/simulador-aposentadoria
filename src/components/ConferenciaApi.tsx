import { API_URL } from '../lib/api'
import type { EstadoConferencia } from '../lib/useConferenciaApi'
import { moeda } from '../lib/formato'

interface Props {
  estado: EstadoConferencia | null
  reservaLocal: number
  aporteLocal: number
}

/** Diferença tolerada entre o cálculo local e o da API (arredondamentos). */
const TOLERANCIA = 1

export function ConferenciaApi({ estado, reservaLocal, aporteLocal }: Props) {
  if (!estado) return null

  return (
    <section className="conferencia" aria-live="polite">
      <header>
        <h2>Conferência com a Atuária API</h2>
        <a href={`${API_URL}/docs`} target="_blank" rel="noreferrer">
          ver documentação ↗
        </a>
      </header>

      {estado.status === 'carregando' && (
        <p className="conf-status">
          <span className="girando" aria-hidden /> Consultando a API…
          {estado.lento && ' O servidor gratuito estava em repouso; a primeira resposta pode levar até 1 minuto.'}
        </p>
      )}

      {estado.status === 'erro' && <p className="conf-status conf-erro">⚠ {estado.mensagem}</p>}

      {estado.status === 'ok' && (
        <Comparacao
          linhas={[
            ['Reserva necessária', reservaLocal, estado.plano.reservaNecessaria],
            ['Aporte mensal necessário', aporteLocal, estado.plano.aporteMensal],
          ]}
        />
      )}
    </section>
  )
}

function Comparacao({ linhas }: { linhas: [string, number, number][] }) {
  const tudoBate = linhas.every(([, local, api]) => Math.abs(local - api) < TOLERANCIA)
  return (
    <>
      <table>
        <thead>
          <tr>
            <th />
            <th>Navegador (TypeScript)</th>
            <th>API (Python)</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map(([rotulo, local, api]) => (
            <tr key={rotulo}>
              <td>{rotulo}</td>
              <td>{moeda(local)}</td>
              <td>{moeda(api)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={tudoBate ? 'conf-status conf-ok' : 'conf-status conf-erro'}>
        {tudoBate ? '✓ Os dois cálculos coincidem.' : '⚠ Os cálculos divergem — verifique as implementações.'}
      </p>
    </>
  )
}
