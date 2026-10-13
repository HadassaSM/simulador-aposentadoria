const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const brlCompacto = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const moeda = (v: number) => brl.format(v)
export const moedaCompacta = (v: number) => brlCompacto.format(v)
export const anos = (v: number) => `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} anos`
