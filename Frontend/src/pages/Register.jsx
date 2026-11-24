
function Register() {
  const handleRegister = (event) => {
    event.preventDefault();
    alert("Fitur registrasi akan dihubungkan ke backend.");
  };

  return (
    <div className="page-container">
      <h2>Daftar Akun</h2>
      <p>Buat akun untuk mulai menggunakan Cari Spot.</p>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nama lengkap"
          required
        />

        <input
          type="email"
          placeholder="Email"
          required
        />

        <input
          type="password"
          placeholder="Password"
          required
        />

        <button type="submit">Daftar</button>
      </form>

      <p>Sudah punya akun? <a href="/login">Login di sini</a></p>
    </div>
  );
}

export default Register;
