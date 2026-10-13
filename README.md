# 🧮 Simulador de Aposentadoria

[![CI e deploy](https://github.com/HadassaSM/simulador-aposentadoria/actions/workflows/deploy.yml/badge.svg)](https://github.com/HadassaSM/simulador-aposentadoria/actions/workflows/deploy.yml)

**▶ Acesse online: https://HadassaSM.github.io/simulador-aposentadoria/**

Aplicação web em **React + TypeScript** que calcula quanto é preciso acumular para receber uma **renda vitalícia** e qual o **aporte mensal** necessário para chegar lá, usando matemática atuarial de verdade em vez da regra dos "4%".

## Como funciona

1. **Reserva necessária**: valor presente de uma renda mensal vitalícia, `12 × renda × ä_x^(12)`, em que `ä_x^(12)` é a anuidade atuarial mensal na idade de aposentadoria.
2. **Mortalidade**: lei de **Gompertz-Makeham** com os parâmetros do *Standard Ultimate Survival Model* (Dickson, Hardy & Waters). Os testes conferem `ä_60 = 14,9041` a 5% a.a.
3. **Aporte necessário**: série de pagamentos mensais que, capitalizada à taxa real, atinge a reserva.
4. **Gráfico**: evolução do saldo com o *seu* aporte e, depois da aposentadoria, os saques da renda. Assim dá para ver até que idade o dinheiro dura sem o mutualismo de uma renda vitalícia.

## Integração com a API

O simulador calcula tudo **no navegador**, para responder instantaneamente a cada alteração. Em paralelo, envia os mesmos dados para a [**Atuária API**](https://github.com/HadassaSM/atuaria-api) (Python/FastAPI, publicada no Render) e mostra, no painel *Conferência com a Atuária API*, se as duas implementações chegam ao mesmo resultado.

- As consultas esperam 600 ms após a última digitação, e uma requisição que ficou obsoleta é cancelada (`AbortController`).
- Cada resposta fica associada à entrada que a gerou, para que um valor antigo nunca seja comparado com um novo.
- Como o plano gratuito do Render hiberna, depois de 3 s o painel avisa que o servidor está "acordando".
- O endereço da API pode ser trocado com a variável `VITE_API_URL`.

## Tecnologias

React 19 · TypeScript · Vite · Recharts · Vitest · Fetch API · Oxlint · GitHub Actions · GitHub Pages

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
├── lib/api.ts              # cliente da Atuária API (testado com fetch simulado)
├── lib/useConferenciaApi.ts # hook: debounce, cancelamento e estados da consulta
├── components/ConferenciaApi.tsx
├── components/GraficoSaldo.tsx
└── App.tsx                 # formulário e indicadores
```

## Aviso

Projeto educacional, desenvolvido durante a graduação em Ciências Atuariais (UFMG). Não é recomendação de investimento.

## Licença

[MIT](LICENSE)
