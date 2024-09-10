const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('validations.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Ruta para obtener estadísticas de emails
router.get('/stats', (req, res) => {
    const sql = `SELECT * FROM validation_results`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            res.status(500).json({ error: 'Error fetching data' });
        } else {
            res.json(rows);
        }
    });
});

// Ruta para obtener los contadores acumulados
router.get('/counters', (req, res) => {
    const phishingSql = `SELECT COUNT(*) AS count FROM validation_results WHERE is_phishing = 1`;
    const validEmailSql = `SELECT COUNT(*) AS count FROM validation_results WHERE is_phishing = 0`;
    const totalSendersSql = `SELECT COUNT(DISTINCT recipient) AS count FROM validation_results`;
    const totalEmailsSql = `SELECT COUNT(*) AS count FROM validation_results`;

    db.get(phishingSql, [], (err, phishingCount) => {
        if (err) {
            console.error('Error fetching phishing count:', err.message);
            res.status(500).json({ error: 'Error fetching phishing count' });
            return;
        }

        db.get(validEmailSql, [], (err, validEmailCount) => {
            if (err) {
                console.error('Error fetching valid email count:', err.message);
                res.status(500).json({ error: 'Error fetching valid email count' });
                return;
            }

            db.get(totalSendersSql, [], (err, totalSendersCount) => {
                if (err) {
                    console.error('Error fetching total senders count:', err.message);
                    res.status(500).json({ error: 'Error fetching total senders count' });
                    return;
                }

                db.get(totalEmailsSql, [], (err, totalEmailsCount) => {
                    if (err) {
                        console.error('Error fetching total emails count:', err.message);
                        res.status(500).json({ error: 'Error fetching total emails count' });
                        return;
                    }

                    res.json({
                        phishingAttempts: phishingCount.count,
                        validEmails: validEmailCount.count,
                        totalSenders: totalSendersCount.count,
                        totalEmails: totalEmailsCount.count
                    });
                });
            });
        });
    });
});

module.exports = router;
