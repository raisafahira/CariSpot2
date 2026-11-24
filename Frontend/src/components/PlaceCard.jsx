function PlaceCard({ name, location, crowd, socket, wifi }) {
  return (
    <div className="place-card">
      <h3>{name}</h3>
      <p>📍 {location}</p>
      <p>Keramaian: {crowd}</p>
      <p>Colokan: {socket}</p>
      <p>WiFi: {wifi}</p>

      <button onClick={() => window.location.href = "/place-detail"}>
        Lihat Detail
      </button>
    </div>
  );
}

export default PlaceCard;

