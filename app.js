// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'));
}

// IndexedDB Setup
let db;
const DB_NAME = 'FitLogDB';
const DB_VERSION = 1;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            
            if (!db.objectStoreNames.contains('workouts')) {
                const workoutStore = db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
                workoutStore.createIndex('date', 'date', { unique: false });
                workoutStore.createIndex('type', 'type', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('foods')) {
                const foodStore = db.createObjectStore('foods', { keyPath: 'id', autoIncrement: true });
                foodStore.createIndex('date', 'date', { unique: false });
            }
        };
    });
}

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    document.getElementById(screenId).classList.add('active');
    
    if (screenId === 'homeScreen') {
        updateDashboard();
    } else if (screenId === 'historyScreen') {
        loadHistory();
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Date Helpers
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getDateString(date) {
    return date.toISOString().split('T')[0];
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Update Dashboard
function updateDashboard() {
    const today = getDateString(new Date());
    document.getElementById('currentDate').textContent = formatDate(new Date());
    
    // Get today's workouts
    const workoutTx = db.transaction(['workouts'], 'readonly');
    const workoutStore = workoutTx.objectStore('workouts');
    const workoutIndex = workoutStore.index('date');
    const workoutRequest = workoutIndex.getAll(today);
    
    workoutRequest.onsuccess = () => {
        const workouts = workoutRequest.result;
        let totalKm = 0;
        let totalPushups = 0;
        
        workouts.forEach(workout => {
            if (workout.type === 'running') {
                totalKm += parseFloat(workout.value) || 0;
            } else if (workout.type === 'pushups') {
                totalPushups += parseInt(workout.value) || 0;
            }
        });
        
        document.getElementById('todayKm').textContent = totalKm.toFixed(1);
        document.getElementById('todayPushups').textContent = totalPushups;
    };
    
    // Get today's foods
    const foodTx = db.transaction(['foods'], 'readonly');
    const foodStore = foodTx.objectStore('foods');
    const foodIndex = foodStore.index('date');
    const foodRequest = foodIndex.getAll(today);
    
    foodRequest.onsuccess = () => {
        const foods = foodRequest.result;
        let totalCalories = 0;
        let totalProtein = 0;
        
        foods.forEach(food => {
            totalCalories += parseInt(food.calories) || 0;
            totalProtein += parseInt(food.protein) || 0;
        });
        
        document.getElementById('todayCalories').textContent = totalCalories;
        document.getElementById('todayProtein').textContent = totalProtein;
    };
}

// Workout Type Change Handler
document.addEventListener('DOMContentLoaded', () => {
    const workoutType = document.getElementById('workoutType');
    const runningInput = document.getElementById('runningInput');
    const repsInput = document.getElementById('repsInput');
    
    workoutType.addEventListener('change', () => {
        if (workoutType.value === 'running') {
            runningInput.style.display = 'block';
            repsInput.style.display = 'none';
        } else {
            runningInput.style.display = 'none';
            repsInput.style.display = 'block';
        }
    });
});

// Save Workout
function saveWorkout() {
    const type = document.getElementById('workoutType').value;
    const notes = document.getElementById('workoutNotes').value;
    let value;
    
    if (type === 'running') {
        value = document.getElementById('runningKm').value;
        if (!value || parseFloat(value) <= 0) {
            showToast('Please enter a valid distance');
            return;
        }
    } else {
        value = document.getElementById('reps').value;
        if (!value || parseInt(value) <= 0) {
            showToast('Please enter a valid number of reps');
            return;
        }
    }
    
    const workout = {
        type: type,
        value: value,
        notes: notes,
        date: getDateString(new Date()),
        time: new Date().toISOString()
    };
    
    const tx = db.transaction(['workouts'], 'readwrite');
    const store = tx.objectStore('workouts');
    const request = store.add(workout);
    
    request.onsuccess = () => {
        showToast('Workout logged! 💪');
        
        // Clear form
        document.getElementById('runningKm').value = '';
        document.getElementById('reps').value = '';
        document.getElementById('workoutNotes').value = '';
        
        // Go back to home
        setTimeout(() => {
            showScreen('homeScreen');
        }, 800);
    };
    
    request.onerror = () => {
        showToast('Error saving workout');
    };
}

// Save Food
function saveFood() {
    const name = document.getElementById('foodName').value;
    const calories = document.getElementById('foodCalories').value;
    const protein = document.getElementById('foodProtein').value;
    const notes = document.getElementById('foodNotes').value;
    
    if (!name || !calories || !protein) {
        showToast('Please fill in all required fields');
        return;
    }
    
    if (parseInt(calories) <= 0 || parseInt(protein) < 0) {
        showToast('Please enter valid values');
        return;
    }
    
    const food = {
        name: name,
        calories: calories,
        protein: protein,
        notes: notes,
        date: getDateString(new Date()),
        time: new Date().toISOString()
    };
    
    const tx = db.transaction(['foods'], 'readwrite');
    const store = tx.objectStore('foods');
    const request = store.add(food);
    
    request.onsuccess = () => {
        showToast('Food logged! 🍎');
        
        // Clear form
        document.getElementById('foodName').value = '';
        document.getElementById('foodCalories').value = '';
        document.getElementById('foodProtein').value = '';
        document.getElementById('foodNotes').value = '';
        
        // Go back to home
        setTimeout(() => {
            showScreen('homeScreen');
        }, 800);
    };
    
    request.onerror = () => {
        showToast('Error saving food');
    };
}

// Load History
function loadHistory() {
    const container = document.getElementById('historyContainer');
    const emptyState = document.getElementById('emptyState');
    
    // Get all workouts and foods
    const workoutTx = db.transaction(['workouts'], 'readonly');
    const workoutStore = workoutTx.objectStore('workouts');
    const workoutRequest = workoutStore.getAll();
    
    const foodTx = db.transaction(['foods'], 'readonly');
    const foodStore = foodTx.objectStore('foods');
    const foodRequest = foodStore.getAll();
    
    Promise.all([
        new Promise(resolve => { workoutRequest.onsuccess = () => resolve(workoutRequest.result); }),
        new Promise(resolve => { foodRequest.onsuccess = () => resolve(foodRequest.result); })
    ]).then(([workouts, foods]) => {
        // Combine and sort by date
        const allEntries = [
            ...workouts.map(w => ({ ...w, category: 'workout' })),
            ...foods.map(f => ({ ...f, category: 'food' }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time));
        
        if (allEntries.length === 0) {
            emptyState.style.display = 'block';
            container.querySelectorAll('.day-group').forEach(el => el.remove());
            return;
        }
        
        emptyState.style.display = 'none';
        
        // Group by date
        const groupedByDate = {};
        allEntries.forEach(entry => {
            if (!groupedByDate[entry.date]) {
                groupedByDate[entry.date] = [];
            }
            groupedByDate[entry.date].push(entry);
        });
        
        // Clear existing entries
        container.querySelectorAll('.day-group').forEach(el => el.remove());
        
        // Render grouped entries
        Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
            const dayGroup = document.createElement('div');
            dayGroup.className = 'day-group';
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = formatDate(new Date(date + 'T00:00:00'));
            dayGroup.appendChild(dayHeader);
            
            groupedByDate[date].forEach(entry => {
                const card = createEntryCard(entry);
                dayGroup.appendChild(card);
            });
            
            container.appendChild(dayGroup);
        });
    });
}

// Create Entry Card
function createEntryCard(entry) {
    const card = document.createElement('div');
    card.className = 'entry-card';
    
    const header = document.createElement('div');
    header.className = 'entry-header';
    
    const type = document.createElement('div');
    type.className = 'entry-type';
    
    if (entry.category === 'workout') {
        const icons = {
            running: '🏃',
            pushups: '💪',
            situps: '🧘',
            squats: '🦵'
        };
        type.innerHTML = `${icons[entry.type]} ${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}`;
    } else {
        type.innerHTML = `🍽️ ${entry.name}`;
    }
    
    const time = document.createElement('div');
    time.className = 'entry-time';
    time.textContent = formatTime(new Date(entry.time));
    
    header.appendChild(type);
    header.appendChild(time);
    
    const value = document.createElement('div');
    value.className = 'entry-value';
    
    if (entry.category === 'workout') {
        if (entry.type === 'running') {
            value.textContent = `${parseFloat(entry.value).toFixed(1)} km`;
        } else {
            value.textContent = `${entry.value} reps`;
        }
    } else {
        value.textContent = `${entry.calories} cal`;
    }
    
    card.appendChild(header);
    card.appendChild(value);
    
    if (entry.category === 'food') {
        const details = document.createElement('div');
        details.className = 'entry-details';
        details.textContent = `Protein: ${entry.protein}g`;
        card.appendChild(details);
    }
    
    if (entry.notes) {
        const notes = document.createElement('div');
        notes.className = 'entry-notes';
        notes.textContent = entry.notes;
        card.appendChild(notes);
    }
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteEntry(entry);
    card.appendChild(deleteBtn);
    
    return card;
}

// Delete Entry
function deleteEntry(entry) {
    const storeName = entry.category === 'workout' ? 'workouts' : 'foods';
    const tx = db.transaction([storeName], 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(entry.id);
    
    request.onsuccess = () => {
        showToast('Entry deleted');
        loadHistory();
        updateDashboard();
    };
    
    request.onerror = () => {
        showToast('Error deleting entry');
    };
}

// Initialize App
initDB().then(() => {
    updateDashboard();
}).catch(err => {
    console.error('Database initialization failed:', err);
    showToast('App initialization failed');
});
