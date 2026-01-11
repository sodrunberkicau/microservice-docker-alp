const db = require('../config/database');

// Get User Profile
exports.getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await db.promise().query('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
