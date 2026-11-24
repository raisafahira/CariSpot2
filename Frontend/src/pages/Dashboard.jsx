
import PlaceCard from "../components/PlaceCard";

function Dashboard() {
  const places = [
    {
      id: 1,
      name: "Kopi Sudut",
      location: "Darussalam, Banda Aceh",
      crowd: "Sepi",
      socket: "Tersedia",
      wifi: "Cepat"
    },
    {
      id: 2,
      name: "Warkop Campus",
      location: "Kopelma Darussalam",
      crowd: "Ramai",
      socket: "Terbatas",
      wifi: "Sedang"
    },
    {
      id: 3,
      name: "Coffee Corner",
      location: "Banda Aceh",
      crowd: "Sedang",
      socket: "Tersedia",
      wifi: "Cepat"
    }
  ];

  return (
    <div className="page-container">
      <h2>Temukan Spot Terbaik!</h2>
      <p>
        Cari tempat yang nyaman untuk belajar,
        mengerjakan tugas, atau bersantai.
      </p>

      <input
        type="text"
        placeholder="Cari nama tempat..."
      />

      <h3>Daftar Tempat</h3>

      <div className="place-list">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            name={place.name}
            location={place.location}
            crowd={place.crowd}
            socket={place.socket}
            wifi={place.wifi}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
