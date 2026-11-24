
function Login() {
  const handleLogin = (event) => {
    event.preventDefault();
    alert("Fitur login akan dihubungkan ke backend.");
  };

  return (
    <div className="page-container">
      <h2>Login</h2>
      <p>Masuk ke akun Cari Spot kamu.</p>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Masukkan email"
          required
        />

        <input
          type="password"
          placeholder="Masukkan password"
          required
        />

        <button type="submit">Login</button>
      </form>

      <p>Belum punya akun? <a href="/register">Daftar di sini</a></p>
    </div>
  );
}

export default Login;
