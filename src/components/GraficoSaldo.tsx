import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import type { PontoSaldo } from '../lib/atuaria'
import { moeda, moedaCompacta } from '../lib/formato'

interface Props {
  serie: PontoSaldo[]
  reservaNecessaria: number
  idadeAposentadoria: number
}

function Dica({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as PontoSaldo
  return (
    <div className="dica">
      <strong>{moeda(p.saldo)}</strong>
      <span>
        <i className="chave" /> Saldo aos {p.idade} anos
      </span>
    </div>
  )
}

export function GraficoSaldo({ serie, reservaNecessaria, idadeAposentadoria }: Props) {
  return (
    <figure className="grafico">
      <figcaption>
        <h2>Saldo acumulado por idade</h2>
        <p>Aportes até a aposentadoria e depois saques da renda mensal, com a taxa real informada.</p>
      </figcaption>
      <div className="area-grafico">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={serie} margin={{ top: 24, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--grade)" />
            <XAxis
              dataKey="idade"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickCount={8}
              tick={{ fill: 'var(--texto-2)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--eixo)' }}
              tickLine={false}
              unit=" anos"
            />
            <YAxis
              tickFormatter={moedaCompacta}
              tick={{ fill: 'var(--texto-2)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip content={Dica} cursor={{ stroke: 'var(--texto-2)', strokeWidth: 1 }} />
            <ReferenceLine
              x={idadeAposentadoria}
              stroke="var(--eixo)"
              strokeDasharray="3 3"
              label={{ value: 'Aposentadoria', position: 'top', fill: 'var(--texto-2)', fontSize: 12 }}
            />
            <ReferenceLine
              y={reservaNecessaria}
              ifOverflow="extendDomain"
              stroke="var(--texto-2)"
              strokeDasharray="6 4"
              label={{
                value: `Reserva necessária ${moedaCompacta(reservaNecessaria)}`,
                position: 'insideTopRight',
                fill: 'var(--texto-2)',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="saldo"
              stroke="var(--serie-1)"
              strokeWidth={2}
              fill="var(--serie-1)"
              fillOpacity={0.14}
              activeDot={{ r: 5, stroke: 'var(--superficie)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="tabela">
        <summary>Ver como tabela</summary>
        <table>
          <thead>
            <tr>
              <th>Idade</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {serie
              .filter((p) => p.idade % 5 === 0 || p.idade === idadeAposentadoria)
              .map((p) => (
                <tr key={p.idade}>
                  <td>{p.idade}</td>
                  <td>{moeda(p.saldo)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
