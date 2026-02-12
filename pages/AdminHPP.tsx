import React, { useState } from 'react';

interface BahanBaku {
  nama: string;
  takaran: string; // format: "angka satuan", misal "100 g"
  harga: number;
  jumlah: string; // format: "angka satuan", misal "2 pcs"
  satuan?: string; // tidak dipakai lagi, hanya untuk kompatibilitas lama
}

interface Makanan {
  nama: string;
  bahan: BahanBaku[];
}

const AdminHPP: React.FC = () => {
  const [makananList, setMakananList] = useState<Makanan[]>([]);
  const [namaMakanan, setNamaMakanan] = useState('');
  const [selectedMakanan, setSelectedMakanan] = useState<number | null>(null);
  const [input, setInput] = useState<BahanBaku>({ nama: '', takaran: '', harga: 0, jumlah: '' });

  const handleAddMakanan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMakanan) return;
    setMakananList([...makananList, { nama: namaMakanan, bahan: [] }]);
    setNamaMakanan('');
  };

  const handleSelectMakanan = (idx: number) => {
    setSelectedMakanan(idx);
    setInput({ nama: '', takaran: '', harga: 0, jumlah: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBahan = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMakanan === null) return;
    // Validasi: nama, takaran (angka & satuan), jumlah (angka & satuan), harga
    const [takaranAngka, takaranSatuan] = input.takaran.trim().split(' ');
    const [jumlahAngka, jumlahSatuan] = input.jumlah.trim().split(' ');
    if (
      !input.nama ||
      !takaranAngka || isNaN(Number(takaranAngka)) || Number(takaranAngka) <= 0 || !takaranSatuan ||
      !jumlahAngka || isNaN(Number(jumlahAngka)) || Number(jumlahAngka) <= 0 || !jumlahSatuan ||
      input.harga <= 0
    ) return;
    const newList = [...makananList];
    newList[selectedMakanan].bahan.push({ ...input, harga: Number(input.harga) });
    setMakananList(newList);
    setInput({ nama: '', takaran: '', harga: 0, jumlah: '' });
  };

  // Subtotal: total HPP semua bahan baku
  const subtotal = selectedMakanan !== null ? makananList[selectedMakanan].bahan.reduce((sum, b) => {
    const jumlahAngka = Number(b.jumlah.split(' ')[0]);
    const takaranAngka = Number(b.takaran.split(' ')[0]);
    if (!isNaN(jumlahAngka) && jumlahAngka > 0 && !isNaN(takaranAngka) && takaranAngka > 0) {
      return sum + ((b.harga / jumlahAngka) * takaranAngka);
    }
    return sum;
  }, 0) : 0;

  // Handler hapus bahan baku
  const handleDeleteBahan = (idx: number) => {
    if (selectedMakanan === null) return;
    const newList = [...makananList];
    newList[selectedMakanan].bahan.splice(idx, 1);
    setMakananList(newList);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6 md:p-10 mt-4">
      <h1 className="text-2xl font-bold mb-6 text-[#C0392B]">Hitung HPP (Harga Pokok Produksi)</h1>
      {/* Tambah Makanan */}
      <form onSubmit={handleAddMakanan} className="flex gap-3 mb-6">
        <input value={namaMakanan} onChange={e => setNamaMakanan(e.target.value)} className="flex-1 px-4 py-2 rounded-xl border" placeholder="Nama Makanan" required />
        <button type="submit" className="bg-[#C0392B] text-white rounded-xl px-6 py-2 font-bold hover:bg-[#A93226] transition">Tambah Makanan</button>
      </form>
      {/* Pilih Makanan */}
      <div className="flex flex-wrap gap-2 mb-6">
        {makananList.map((m, idx) => (
          <button key={idx} onClick={() => handleSelectMakanan(idx)} className={`px-4 py-2 rounded-xl font-bold border ${selectedMakanan === idx ? 'bg-[#C0392B] text-white' : 'bg-gray-100 text-[#C0392B]'}`}>{m.nama}</button>
        ))}
      </div>
      {/* Form Bahan Baku */}
      {selectedMakanan !== null && (
        <>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border">
            <form onSubmit={handleAddBahan} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex flex-col mb-2 md:mb-0">
                <label className="text-xs font-bold text-gray-600 mb-1">Bahan Baku</label>
                <input name="nama" value={input.nama} onChange={handleChange} className="px-4 py-2 rounded-xl border focus:ring-2 focus:ring-[#C0392B]" placeholder="Nama Bahan Baku" required />
              </div>
              {/* Takaran/pcs: angka + satuan */}
              <div className="flex flex-col mb-2 md:mb-0">
                <label className="text-xs font-bold text-gray-600 mb-1">Takaran</label>
                <div className="flex gap-2">
                  <input name="takaran" type="number" min={1} value={input.takaran.split(' ')[0] || ''} onChange={e => setInput(i => ({ ...i, takaran: e.target.value + ' ' + (i.takaran.split(' ')[1] || 'g') }))} className="w-2/3 px-4 py-2 rounded-xl border focus:ring-2 focus:ring-[#C0392B]" placeholder="Takaran" required />
                  <select value={input.takaran.split(' ')[1] || ''} onChange={e => setInput(i => ({ ...i, takaran: (i.takaran.split(' ')[0] || '') + ' ' + e.target.value }))} className="w-1/3 px-2 py-2 rounded-xl border focus:ring-2 focus:ring-[#C0392B]" required>
                    <option value="" disabled>Satuan</option>
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
              </div>
              {/* Jumlah: angka + satuan */}
              <div className="flex flex-col mb-2 md:mb-0">
                <label className="text-xs font-bold text-gray-600 mb-1">Jumlah</label>
                <div className="flex gap-2">
                  <input name="jumlah" type="number" min={1} value={input.jumlah.split(' ')[0] || ''} onChange={e => setInput(i => ({ ...i, jumlah: e.target.value + ' ' + (i.jumlah.split(' ')[1] || 'pcs') }))} className="w-2/3 px-4 py-2 rounded-xl border focus:ring-2 focus:ring-[#C0392B]" placeholder="Jumlah" required />
                  <select value={input.jumlah.split(' ')[1] || ''} onChange={e => setInput(i => ({ ...i, jumlah: (i.jumlah.split(' ')[0] || '') + ' ' + e.target.value }))} className="w-1/3 px-2 py-2 rounded-xl border focus:ring-2 focus:ring-[#C0392B]" required>
                    <option value="" disabled>Satuan</option>
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
              </div>
              {/* Harga */}
              <div className="flex flex-col mb-2 md:mb-0">
                <label className="text-xs font-bold text-gray-600 mb-1">Harga</label>
                <input name="harga" type="number" value={input.harga || ''} onChange={handleChange} className="px-4 py-2 rounded-xl border focus:ring-2 focus:ring-[#C0392B]" placeholder="Harga Pembelian" required min={1} />
              </div>
              <button type="submit" className="md:col-span-5 w-full bg-[#C0392B] text-white rounded-xl py-2 font-bold hover:bg-[#A93226] transition mt-2">Tambah Bahan</button>
            </form>
            <div className="text-xs text-gray-500 mt-2 mb-2">HPP per bahan baku = (Harga / Jumlah) × Takaran</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Bahan Baku</th>
                  <th className="px-4 py-2">Takaran/pcs</th>
                  <th className="px-4 py-2">Jumlah</th>
                  <th className="px-4 py-2">Satuan</th>
                  <th className="px-4 py-2">Harga</th>
                  <th className="px-4 py-2">HPP</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {makananList[selectedMakanan].bahan.map((b, i) => {
                  const jumlahAngka = Number(b.jumlah.split(' ')[0]);
                  const takaranAngka = Number(b.takaran.split(' ')[0]);
                  const takaranSatuan = b.takaran.split(' ')[1] || '';
                  let hpp = 0;
                  if (!isNaN(jumlahAngka) && jumlahAngka > 0 && !isNaN(takaranAngka) && takaranAngka > 0) {
                    hpp = (b.harga / jumlahAngka) * takaranAngka;
                  }
                  return (
                    <tr key={i}>
                      <td className="px-4 py-2">{b.nama}</td>
                      <td className="px-4 py-2">{b.takaran}</td>
                      <td className="px-4 py-2">{b.jumlah}</td>
                      <td className="px-4 py-2">{takaranSatuan}</td>
                      <td className="px-4 py-2">Rp {b.harga.toLocaleString()}</td>
                      <td className="px-4 py-2">Rp {hpp.toLocaleString(undefined, {maximumFractionDigits: 2})} / {takaranSatuan}</td>
                      <td className="px-4 py-2 text-center">
                        <button onClick={() => handleDeleteBahan(i)} className="bg-red-500 hover:bg-red-700 text-white rounded-lg px-3 py-1 text-xs font-bold">Delete</button>
                      </td>
                    </tr>
                  );
                })}
                {makananList[selectedMakanan].bahan.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-gray-400 py-4">Belum ada bahan baku</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end font-bold text-lg mt-2">
            Total HPP: <span className="ml-2 text-[#C0392B]">Rp {subtotal.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHPP;
