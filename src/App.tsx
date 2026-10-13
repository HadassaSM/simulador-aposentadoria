import { useMemo, useState } from 'react'
import { ConferenciaApi } from './components/ConferenciaApi'
import { GraficoSaldo } from './components/GraficoSaldo'
import { simular, type Entrada } from './lib/atuaria'
import { anos, moeda } from './lib/formato'
import { useConferenciaApi } from './lib/useConferenciaApi'

interface Campo {
  chave: keyof Entrada
  rotulo: string
  min: number
  max: number
  passo: number
  sufixo?: string
}

const CAMPOS: Campo[] = [
  { chave: 'idadeAtual', rotulo: 'Idade atual', min: 14, max: 80, passo: 1, sufixo: 'anos' },
  { chave: 'idadeAposentadoria', rotulo: 'Idade de aposentadoria', min: 40, max: 90, passo: 1, sufixo: 'anos' },
  { chave: 'rendaMensal', rotulo: 'Renda mensal desejada', min: 0, max: 100_000, passo: 100, sufixo: 'R$' },
  { chave: 'saldoInicial', rotulo: 'Saldo já acumulado', min: 0, max: 10_000_000, passo: 1000, sufixo: 'R$' },
  { chave: 'aporteMensal', rotulo: 'Seu aporte mensal', min: 0, max: 100_000, passo: 50, sufixo: 'R$' },
]

const INICIAL: Entrada = {
  idadeAtual: 25,
  idadeAposentadoria: 65,
  rendaMensal: 5000,
  taxaAnual: 0.04,
  saldoInicial: 0,
  aporteMensal: 500,
}

export default function App() {
  const [entrada, setEntrada] = useState<Entrada>(INICIAL)
  const valida = entrada.idadeAposentadoria > entrada.idadeAtual
  const r = useMemo(() => (valida ? simular(entrada) : null), [entrada, valida])
  const conferencia = useConferenciaApi(valida ? entrada : null)

  const alterar = (chave: keyof Entrada, valor: number) =>
    setEntrada((e) => ({ ...e, [chave]: Number.isFinite(valor) ? valor : 0 }))

  return (
    <main>
      <header>
        <h1>Simulador de Aposentadoria</h1>
        <p>
          Quanto você precisa acumular para receber uma renda vitalícia e quanto precisa poupar por mês. O cálculo
          usa uma tábua de mortalidade (Gompertz-Makeham) e anuidades atuariais.
        </p>
      </header>

      <section className="painel">
        <form className="formulario" onSubmit={(ev) => ev.preventDefault()}>
          {CAMPOS.map((c) => (
            <label key={c.chave}>
              <span>{c.rotulo}</span>
              <div className="entrada">
                {c.sufixo === 'R$' && <em>R$</em>}
                <input
                  type="number"
                  min={c.min}
                  max={c.max}
                  step={c.passo}
                  value={entrada[c.chave]}
                  onChange={(ev) => alterar(c.chave, ev.target.valueAsNumber)}
                />
                {c.sufixo === 'anos' && <em>anos</em>}
              </div>
            </label>
          ))}
          <label>
            <span>
              Taxa real de juros: <strong>{(entrada.taxaAnual * 100).toFixed(1)}% a.a.</strong>
            </span>
            <input
              type="range"
              min={0}
              max={0.1}
              step={0.005}
              value={entrada.taxaAnual}
              onChange={(ev) => alterar('taxaAnual', ev.target.valueAsNumber)}
            />
          </label>
          {r && (
            <button type="button" onClick={() => alterar('aporteMensal', Math.ceil(r.aporteNecessario))}>
              Usar o aporte necessário ({moeda(r.aporteNecessario)})
            </button>
          )}
        </form>

        {r ? (
          <div className="resultados">
            <div className="indicadores">
              <Indicador
                titulo="Reserva necessária"
                valor={moeda(r.reservaNecessaria)}
                nota="valor presente da renda vitalícia"
              />
              <Indicador
                titulo="Aporte mensal necessário"
                valor={moeda(r.aporteNecessario)}
                nota={`por ${(entrada.idadeAposentadoria - entrada.idadeAtual) * 12} meses`}
              />
              <Indicador
                titulo="Seu saldo na aposentadoria"
                valor={moeda(r.saldoNaAposentadoria)}
                nota={
                  r.saldoNaAposentadoria >= r.reservaNecessaria
                    ? 'cobre a reserva ✓'
                    : `faltam ${moeda(r.reservaNecessaria - r.saldoNaAposentadoria)}`
                }
              />
              <Indicador
                titulo="A renda dura até"
                valor={r.idadeSaldoZera === null ? '100+ anos' : anos(Math.floor(r.idadeSaldoZera))}
                nota={`expectativa de vida aos ${entrada.idadeAposentadoria}: mais ${anos(r.expectativaVida)}`}
              />
            </div>
            <GraficoSaldo
              serie={r.serie}
              reservaNecessaria={r.reservaNecessaria}
              idadeAposentadoria={entrada.idadeAposentadoria}
            />
            <ConferenciaApi
              estado={conferencia}
              reservaLocal={r.reservaNecessaria}
              aporteLocal={r.aporteNecessario}
            />
          </div>
        ) : (
          <p className="aviso">A idade de aposentadoria precisa ser maior que a idade atual.</p>
        )}
      </section>

      <footer>
        <p>
          Projeto educacional. Valores em termos reais (já descontada a inflação). A reserva considera mortalidade
          (renda vitalícia com mutualismo); a curva de saldo mostra saques individuais, sem mutualismo.
        </p>
      </footer>
    </main>
  )
}

function Indicador({ titulo, valor, nota }: { titulo: string; valor: string; nota: string }) {
  return (
    <div className="indicador">
      <span>{titulo}</span>
      <strong>{valor}</strong>
      <small>{nota}</small>
    </div>
  )
}
