const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs').promises;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Chemin vers le fichier JSON stockant les tâches
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');

// Assurer que le dossier data existe
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir);
        await fs.writeFile(TASKS_FILE, '[]');
    }
}

// Lire les tâches
async function readTasks() {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

// Écrire les tâches
async function writeTasks(tasks) {
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// Routes API
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await readTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la lecture des tâches' });
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Le texte de la tâche est requis' });
        }

        const tasks = await readTasks();
        const newTask = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        await writeTasks(tasks);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de la tâche' });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let tasks = await readTasks();
        tasks = tasks.filter(task => task.id !== id);
        await writeTasks(tasks);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' });
    }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { text } = req.body;
        
        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Le texte de la tâche est requis' });
        }

        let tasks = await readTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }

        tasks[taskIndex] = {
            ...tasks[taskIndex],
            text: text.trim(),
            updatedAt: new Date().toISOString()
        };

        await writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la modification de la tâche' });
    }
});

// Initialisation et démarrage du serveur
async function startServer() {
    await ensureDataDirectory();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
    });
}

startServer().catch(console.error); 