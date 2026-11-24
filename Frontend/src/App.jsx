import { useEffect, useState } from 'react';
import { apiRequest } from './services/api';
import {
    MapPin,
    Plug,
    Wifi,
    RefreshCw,
    LogOut
} from 'lucide-react';

import './index.css';

function App() {
    const [places, setPlaces] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loggedIn, setLoggedIn] = useState(
        !!localStorage.getItem('token')
    );
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    async function loadData() {
        setLoading(true);

        try {
            const [p, c] = await Promise.all([
                apiRequest('/places'),
                apiRequest('/conditions')
            ]);

            setPlaces(p);
            setConditions(c);

        } catch (error) {
            setMessage(error.message);

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (loggedIn) loadData();
    }, [loggedIn]);

    async function login(e) {
        e.preventDefault();

        try {
            const result = await apiRequest(
                '/auth/login',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            localStorage.setItem(
                'token',
                result.token
            );

            setLoggedIn(true);
            setMessage('Login berhasil');

        } catch (error) {
            setMessage(error.message);
        }
    }

    async function checkin(placeId) {
        try {
            const result = await apiRequest(
                '/checkins',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        place_id: placeId
                    })
                }
            );

            setMessage(
                `Check-in berhasil! ID: ${result.checkin_id}`
            );

        } catch (error) {
            setMessage(error.message);
        }
    }

    async function logout() {
        localStorage.removeItem('token');
        setLoggedIn(false);
        setPlaces([]);
        setConditions([]);
    }

    const conditionMap = Object.fromEntries(
        conditions.map(c => [c.PLACE_ID, c])
    );

    if (!loggedIn) {
        return (
            <main className="login-container">
                <form onSubmit={login} className="login-card">
                    <h1>📍 Cari Spot</h1>
                    <p>Login untuk menemukan tempat terbaik.</p>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">
                        Login
                    </button>

                    <p>{message}</p>
                </form>
            </main>
        );
    }

    return (
        <main className="container">

            <header>
                <div>
                    <h1>📍 Cari Spot</h1>
                    <p>
                        Temukan tempat nyaman untuk produktif.
                    </p>
                </div>

                <button onClick={logout}>
                    <LogOut size={16} />
                    Logout
                </button>
            </header>

            <section className="toolbar">
                <h2>Tempat di sekitar kampus</h2>

                <button onClick={loadData}>
                    <RefreshCw size={16} />
                    Refresh
                </button>

                <button
                    onClick={async () => {
                        try {
                            const result = await apiRequest(
                                '/places/available'
                            );
                            setConditions(result);
                            setMessage('Filter tempat tersedia aktif');
                        } catch (error) {
                            setMessage(error.message);
                        }
                    }}
                >
                    Sepi + Colokan
                </button>
            </section>

            {loading && <p>Memuat data...</p>}
            {message && <p>{message}</p>}

            <section className="place-grid">

                {places.map(place => {
                    const c = conditionMap[place.PLACE_ID];

                    return (
                        <article
                            className="place-card"
                            key={place.PLACE_ID}
                        >
                            <div className="place-icon">
                                <MapPin size={26} />
                            </div>

                            <h3>{place.PLACE_NAME}</h3>

                            <p>{place.CATEGORY_NAME}</p>
                            <p>{place.ADDRESS}</p>

                            {c ? (
                                <>
                                    <p>
                                        Kondisi: {c.CROWD_LEVEL}
                                    </p>

                                    <p>
                                        <Plug size={15} />
                                        Colokan: {
                                            c.SOCKET_AVAILABLE === 'Y'
                                                ? 'Tersedia'
                                                : 'Tidak tersedia'
                                        }
                                    </p>

                                    <p>
                                        <Wifi size={15} />
                                        WiFi: {c.WIFI_SPEED}
                                    </p>

                                    <small>
                                        {c.TOTAL_REPORTERS} pelapor berbeda
                                    </small>
                                </>
                            ) : (
                                <p>
                                    Belum ada laporan yang memenuhi syarat.
                                </p>
                            )}

                            <button
                                onClick={() => checkin(place.PLACE_ID)}
                            >
                                Check-in
                            </button>
                        </article>
                    );
                })}

            </section>
        </main>
    );
}

export default App;
