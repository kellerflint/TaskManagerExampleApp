const express = require('express');
const mariadb = require('mariadb');

require('dotenv').config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function connect() {
    try {
        const conn = await pool.getConnection();
        console.log('Connected to the database');
        return conn;
    } catch (err) {
        console.log('Error connecting to the database: ' + err);
    }
}

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes

// Home Route (List all tasks)
app.get('/', async (req, res) => {
    const conn = await connect();
    const tasks = await conn.query('SELECT * FROM tasks');
    conn.end();
    res.render('home', { tasks });
});

// Create Task (Form Submission)
app.post('/tasks', async (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).send('Title is required');
    }
    if (!description) {
        return res.status(400).send('Description is required');
    }
    const conn = await connect();
    await conn.query('INSERT INTO tasks (title, description) VALUES (?, ?)', [title, description]);
    conn.end();
    res.redirect('/');
});

// Update Task (Mark as Completed)
app.post('/tasks/:id/complete', async (req, res) => {
    const { id } = req.params;
    const conn = await connect();
    await conn.query('UPDATE tasks SET completed = ? WHERE id = ?', [true, id]);
    conn.end();
    res.redirect('/');
});

// Delete Task
app.post('/tasks/:id/delete', async (req, res) => {
    const { id } = req.params;
    const conn = await connect();
    await conn.query('DELETE FROM tasks WHERE id = ?', [id]);
    conn.end();
    res.redirect('/');
});

// Start the server
app.listen(process.env.APP_PORT, () => {
    console.log(`Server running on http://localhost:${process.env.APP_PORT}`);
});
