// Async account management
let balance = 100

export async function withdraw(amount: number): Promise<boolean> {
  const current = balance
  await new Promise((r) => setTimeout(r, 1)) // simulate async work
  if (current >= amount) {
    balance = current - amount
    return true
  }
  return false
}

export function getBalance(): number {
  return balance
}

export function resetBalance(value: number = 100): void {
  balance = value
}
