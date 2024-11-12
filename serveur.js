const express = require('express');
const path = require('path');
const fs = require('fs'); //pour lire et écrire les taches
const app = express();
const PORT = 9000;

// Servir le dossier 'public' comme un dossier statique
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour forcer le type MIME des fichiers JS
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    next();
  });

// Route pour le fichier HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  

//charger les taches depuis un fichier JSON 
const loadTasks = () => {
    //const data = fs.existsSync('tasks.json') ? 
    const data = fs.readFileSync('tasks.json', 'utf-8');
    return JSON.parse(data);
};

//Sauvgarder les taches dans un fichier JSON 
// const saveTasks = (tasks) => fs.writeFileSync('tasks.json', JSON.stringify(tasks));

// Route GET : Recuperer tous les taches 
app.get('/tasks',(req, res) => {
    const tasks = loadTasks();
    res.json(tasks);
});

//Route POST : Ajouter une nouvelle tache 
app.post('/tasks',express.json(), (req, res) => {
    const tasks = loadTasks();
    const newTask = {id: Date.now(), text: req.body.text};
    tasks.push(newTask);
    //saveTasks(tasks);
    fs.writeFileSync('tasks.json', JSON.stringify(tasks));
    res.status(201).json(newTask);
});

//Route DELETE : Supprimer une tache
app.delete('/tasks/:id',(req, res) => {
    let tasks = loadTasks();
    //const filtredTasks = tasks.filter(task => task.id != req.params.id);
    tasks = tasks.filter(task => task.id !== parseInt(req.params.id));

    fs.writeFileSync('tasks.json', JSON.stringify(tasks));
    //saveTasks(filtredTasks);
    res.status(201).send();
});


app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
  });