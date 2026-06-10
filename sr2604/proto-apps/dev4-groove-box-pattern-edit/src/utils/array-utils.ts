export function seqNumbers(n: number): number[] {
  return new Array(n).fill(0).map((_, i) => i);
}

export function seqNumbersInRange(lo: number, hi: number): number[] {
  return seqNumbers(hi - lo + 1).map((i) => i + lo);
}
