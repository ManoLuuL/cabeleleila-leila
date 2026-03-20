const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatCurrency(valueInCents: number): string {
  return BRL.format(valueInCents / 100)
}

export function sumCents(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0)
}
