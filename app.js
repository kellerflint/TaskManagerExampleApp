const express = require('express');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'task_manager'
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
const PORT = 3000;

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
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
