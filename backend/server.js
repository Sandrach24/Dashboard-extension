const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const emailRoutes = require('./routes/emailRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

const db = new sqlite3.Database(path.join(__dirname, 'validations.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        db.run(`CREATE TABLE IF NOT EXISTS validation_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            field_name TEXT,
            validation_message TEXT,
            email_date TEXT,
            url TEXT,
            recipient TEXT,
            content TEXT,
            ip TEXT,
            is_phishing INTEGER
        )`);
    }
});

app.post('/check-phishing', (req, res) => {
    const { subject, content, sender, date, url, ip, validationMessage, isPhishing } = req.body;

    if (!content || !sender || !subject || !date || !url) {
        return res.status(400).json({ error: 'Campos requeridos están faltando' });
    }

    console.log('Datos recibidos:', { subject, sender, date, url, ip, validationMessage, isPhishing });

    const sql = `INSERT INTO validation_results (field_name, validation_message, email_date, url, recipient, content, ip, is_phishing) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        subject,
        validationMessage,
        date,
        url,
        sender,
        content,
        ip || 'IP not available',
        isPhishing ? 1 : 0
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error al insertar en la base de datos:', err);
            return res.status(500).json({ error: 'Error inserting data', details: err.message });
        }
        console.log('Registro insertado con éxito. ID:', this.lastID);
        res.json({ success: true, lastID: this.lastID, isPhishing: isPhishing });
    });
});

app.get('/stats', (req, res) => {
    const statsQuery = `
        SELECT 
            COUNT(*) AS totalEmails,
            SUM(CASE WHEN is_phishing = 1 THEN 1 ELSE 0 END) AS totalPhishing,
            SUM(CASE WHEN is_phishing = 0 THEN 1 ELSE 0 END) AS totalNonPhishing
        FROM validation_results;
    `;

    db.get(statsQuery, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching stats', details: err.message });
        }
        res.json(row);
    });
});

app.get('/data', (req, res) => {
    db.all(`SELECT url, ip, recipient, email_date, is_phishing FROM validation_results`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching data', details: err.message });
        }
        res.json(rows);
    });
});

// Ruta para servir el archivo index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});