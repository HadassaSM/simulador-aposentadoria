# 🧮 Simulador de Aposentadoria

[![CI e deploy](https://github.com/HadassaSM/simulador-aposentadoria/actions/workflows/deploy.yml/badge.svg)](https://github.com/HadassaSM/simulador-aposentadoria/actions/workflows/deploy.yml)

**▶ Acesse online: https://HadassaSM.github.io/simulador-aposentadoria/**

Aplicação web em **React + TypeScript** que calcula quanto é preciso acumular para receber uma **renda vitalícia** e qual o **aporte mensal** necessário para chegar lá, usando matemática atuarial de verdade em vez da regra dos "4%".

## Como funciona

1. **Reserva necessária**: valor presente de uma renda mensal vitalícia, `12 × renda × ä_x^(12)`, em que `ä_x^(12)` é a anuidade atuarial mensal na idade de aposentadoria.
2. **Mortalidade**: lei de **Gompertz-Makeham** com os parâmetros do *Standard Ultimate Survival Model* (Dickson, Hardy & Waters). Os testes conferem `ä_60 = 14,9041` a 5% a.a.
3. **Aporte necessário**: série de pagamentos mensais que, capitalizada à taxa real, atinge a reserva.
4. **Gráfico**: evolução do saldo com o *seu* aporte e, depois da aposentadoria, os saques da renda. Assim dá para ver até que idade o dinheiro dura sem o mutualismo de uma renda vitalícia.

Os mesmos cálculos estão disponíveis como API REST no projeto [atuaria-api](https://github.com/HadassaSM/atuaria-api).

## Tecnologias

React 19 · TypeScript · Vite · Recharts · Vitest · Oxlint · GitHub Actions · GitHub Pages

## Como executar

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm test          # testes (Vitest)
npm run build     # build de produção em dist/
```

## Estrutura

```
src/
├── lib/atuaria.ts          # cálculos atuariais (funções puras, testadas)
├── lib/formato.ts          # formatação de moeda e idade (pt-BR)
├── components/GraficoSaldo.tsx
└── App.tsx                 # formulário e indicadores
```

## Aviso

Projeto educacional, desenvolvido durante a graduação em Ciências Atuariais (UFMG). Não é recomendação de investimento.

## Licença

[MIT](LICENSE)
