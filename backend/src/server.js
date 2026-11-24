
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const {
    getConnection,
    oracledb
} = require('./config/database');

const auth = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

// ======================================
// HEALTH CHECK
// ======================================

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        application: 'Cari Spot'
    });
});

// ======================================
// REGISTER
// ======================================

app.post('/api/auth/register', async (req, res) => {
    let conn;

    try {
        const { full_name, email, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: 'Semua data wajib diisi'
            });
        }

        const hash = await bcrypt.hash(password, 12);

        conn = await getConnection();

        await conn.execute(
            `INSERT INTO users
             (full_name, email, password_hash)
             VALUES (:name, :email, :password)`,
            {
                name: full_name,
                email: email,
                password: hash
            }
        );

        await conn.commit();

        res.status(201).json({
            message: 'Registrasi berhasil'
        });

    } catch (error) {
        if (conn) await conn.rollback();

        res.status(500).json({
            message: 'Registrasi gagal',
            error: error.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// ======================================
// LOGIN
// ======================================

app.post('/api/auth/login', async (req, res) => {
    let conn;

    try {
        const { email, password } = req.body;

        conn = await getConnection();

        const result = await conn.execute(
            `SELECT user_id, full_name, email, password_hash
             FROM users
             WHERE email = :email`,
            { email }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Email atau password salah'
            });
        }

        const user = result.rows[0];

        const valid = await bcrypt.compare(
            password,
            user.PASSWORD_HASH
        );

        if (!valid) {
            return res.status(401).json({
                message: 'Email atau password salah'
            });
        }

        const token = jwt.sign(
            {
                user_id: user.USER_ID
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login berhasil',
            token,
            user: {
                user_id: user.USER_ID,
                full_name: user.FULL_NAME,
                email: user.EMAIL
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Login gagal',
            error: error.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// ======================================
// DAFTAR TEMPAT
// ======================================

app.get('/api/places', async (req, res) => {
    let conn;

    try {
        conn = await getConnection();

        const result = await conn.execute(
            `SELECT
                p.place_id,
                p.place_name,
                p.address,
                c.category_name
             FROM places p
             JOIN categories c
             ON p.category_id = c.category_id
             ORDER BY p.place_name`
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// ======================================
// KONDISI TERKINI
// ======================================

app.get('/api/conditions', async (req, res) => {
    let conn;

    try {
        conn = await getConnection();

        const result = await conn.execute(
            `SELECT * FROM v_kondisi_terkini`
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// ======================================
// FILTER TEMPAT TERSEDIA
// ======================================

app.get('/api/places/available', async (req, res) => {
    let conn;

    try {
        conn = await getConnection();

        const result = await conn.execute(
            `SELECT * FROM v_tempat_tersedia`
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// ======================================
// CHECK-IN
// ======================================

app.post('/api/checkins', auth, async (req, res) => {
    let conn;

    try {
        const { place_id } = req.body;

        if (!place_id) {
            return res.status(400).json({
                message: 'Place ID wajib diisi'
            });
        }

        conn = await getConnection();

        const result = await conn.execute(
            `INSERT INTO checkins (user_id, place_id)
             VALUES (:userId, :placeId)
             RETURNING checkin_id INTO :id`,
            {
                userId: req.user.user_id,
                placeId: place_id,
                id: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.NUMBER
                }
            }
        );

        await conn.commit();

        res.status(201).json({
            message: 'Check-in berhasil',
            checkin_id: result.outBinds.id[0]
        });

    } catch (error) {
        if (conn) await conn.rollback();

        res.status(400).json({
            message: error.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// ======================================
// LAPOR KONDISI
// ======================================

app.post('/api/reports', auth, async (req, res) => {
    let conn;

    try {
        const {
            place_id,
            crowd_level,
            socket_available,
            wifi_speed,
            wifi_mbps
        } = req.body;

        conn = await getConnection();

        await conn.execute(
            `BEGIN
                sp_laporkan_kondisi(
                    :userId,
                    :placeId,
                    :crowd,
                    :socket,
                    :wifi,
                    :mbps
                );
             END;`,
            {
                userId: req.user.user_id,
                placeId: place_id,
                crowd: crowd_level,
                socket: socket_available,
                wifi: wifi_speed,
                mbps: wifi_mbps
            }
        );

        await conn.commit();

        res.status(201).json({
            message: 'Laporan berhasil disimpan'
        });

    } catch (error) {
        if (conn) await conn.rollback();

        res.status(400).json({
            message: error.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// ======================================
// CHECK-OUT
// ======================================

app.post('/api/checkins/:id/checkout', auth, async (req, res) => {
    let conn;

    try {
        conn = await getConnection();

        await conn.execute(
            `BEGIN
                sp_checkout(:checkinId, :userId);
             END;`,
            {
                checkinId: Number(req.params.id),
                userId: req.user.user_id
            }
        );

        await conn.commit();

        res.json({
            message: 'Check-out berhasil'
        });

    } catch (error) {
        if (conn) await conn.rollback();

        res.status(400).json({
            message: error.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// ======================================
// RIWAYAT POIN
// ======================================

app.get('/api/points', auth, async (req, res) => {
    let conn;

    try {
        conn = await getConnection();

        const result = await conn.execute(
            `SELECT
                point_log_id,
                points_change,
                description,
                created_at
             FROM point_log
             WHERE user_id = :userId
             ORDER BY created_at DESC`,
            {
                userId: req.user.user_id
            }
        );

        res.json(result.rows);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    } finally {
        if (conn) await conn.close();
    }
});

// ======================================
// START SERVER
// ======================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Cari Spot berjalan pada port ${PORT}`);
});
