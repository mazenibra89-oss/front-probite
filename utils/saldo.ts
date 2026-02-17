// Simpan saldo per kota di localStorage
export function getSaldo(city: string) {
  const data = JSON.parse(localStorage.getItem('probite_saldo') || '{}');
  return typeof data[city] === 'number' ? data[city] : 0;
}

export function setSaldo(city: string, value: number) {
  const data = JSON.parse(localStorage.getItem('probite_saldo') || '{}');
  data[city] = value;
  localStorage.setItem('probite_saldo', JSON.stringify(data));
}
