
function PlaceDetail() {
  return (
    <div className="page-container">
      <h2>Detail Tempat</h2>

      <h3>Kopi Sudut</h3>
      <p>📍 Darussalam, Banda Aceh</p>

      <h3>Kondisi Saat Ini</h3>
      <p>Keramaian: Sepi</p>
      <p>Ketersediaan colokan: Tersedia</p>
      <p>Kecepatan WiFi: Cepat</p>

      <p>
        Kondisi tempat ditampilkan berdasarkan
        laporan pengunjung yang masih berlaku.
      </p>

      <button onClick={() => alert("Fitur check-in akan dibuat nanti.")}>
        Check-in
      </button>

      <button onClick={() => alert("Fitur laporan akan dibuat nanti.")}>
        Laporkan Kondisi
      </button>
    </div>
  );
}

export default PlaceDetail;
