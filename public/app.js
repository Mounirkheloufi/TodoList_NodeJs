// Fonction pour gérer l'affichage des messages de statut
function showStatus(message, type = 'info') {
    const statusMessage = document.getElementById('statusMessage');
    if (message) {
        statusMessage.textContent = message;
        statusMessage.className = `alert alert-${type}`;
        statusMessage.style.display = 'block';
    } else {
        statusMessage.style.display = 'none';
    }
}

// Charger les tâches depuis le serveur
async function loadTasks() {
    const taskList = document.getElementById('taskList');
    
    try {
        showStatus('Chargement des tâches...', 'info');
        const response = await fetch('/tasks');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const tasks = await response.json();
        taskList.innerHTML = ''; // Vider la liste
        
        if (tasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'list-group-item text-center text-muted';
            emptyMessage.textContent = 'Aucune tâche pour le moment';
            taskList.appendChild(emptyMessage);
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>${escapeHtml(task.text)}</span>
                <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            `;
            taskList.appendChild(li);
        });
        
        showStatus('');
    } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
        showStatus('Erreur lors du chargement des tâches', 'danger');
        taskList.innerHTML = `
            <li class="list-group-item text-danger">
                Impossible de charger les tâches. Veuillez réessayer plus tard.
            </li>
        `;
    }
}

// Fonction pour échapper les caractères HTML dangereux
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Ajouter une tâche
document.getElementById('addTaskButton').addEventListener('click', async () => {
    const taskInput = document.getElementById('taskInput');
    const text = taskInput.value.trim();

    console.log('Tentative d\'ajout de tâche:', text); // Log de débogage

    if (text === '') {
        showStatus('Veuillez entrer une tâche valide', 'warning');
        return;
    }

    try {
        showStatus('Ajout de la tâche...', 'info');
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        console.log('Réponse du serveur:', response.status); // Log de débogage

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log('Tâche ajoutée:', result); // Log de débogage

        taskInput.value = '';
        showStatus('Tâche ajoutée avec succès!', 'success');
        await loadTasks();
        
        setTimeout(() => {
            showStatus('');
        }, 2000);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la tâche:', error);
        showStatus('Erreur lors de l\'ajout de la tâche', 'danger');
    }
});

// Supprimer une tâche
async function deleteTask(id) {
    const statusMessage = document.getElementById('statusMessage');
    
    try {
        statusMessage.textContent = 'Suppression de la tâche...';
        const response = await fetch(`/tasks/${id}`, { method: 'DELETE' });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        statusMessage.textContent = 'Tâche supprimée avec succès!';
        await loadTasks();
        
        // Effacer le message de succès après 2 secondes
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 2000);
    } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
        statusMessage.textContent = 'Erreur lors de la suppression de la tâche';
    }
}

// Charger les tâches au démarrage
document.addEventListener('DOMContentLoaded', loadTasks);
  