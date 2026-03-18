const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Formats a value in cents to BRL currency string */
export function formatCurrency(valueInCents: number): string {
  return BRL.format(valueInCents / 100)
}

/** Sums an array of cent values */
export function sumCents(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0)
}
