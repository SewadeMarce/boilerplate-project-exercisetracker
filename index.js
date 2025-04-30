const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let users = [];
let exercises = [];

// 2. POST /api/users - Créer un nouvel utilisateur
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (username) {
    const newUser = {
      _id: Math.random().toString(36).substring(7), // Générer un ID simple
      username: username
    };
    users.push(newUser);
    // 3. Réponse : { username: "...", _id: "..." }
    res.json(newUser);
  } else {
    res.status(400).json({ error: 'Nom d\'utilisateur requis' });
  }
});

// 4. GET /api/users - Obtenir la liste de tous les utilisateurs
app.get('/api/users', (req, res) => {
  // 5. Réponse : un tableau
  // 6. Chaque élément : { username: "...", _id: "..." }
  res.json(users);
});

// 7. POST /api/users/:_id/exercises - Ajouter un exercice pour un utilisateur
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  if (!description || !duration) {
    return res.status(400).json({ error: 'Description et durée sont requises' });
  }

  const durationNumber = parseInt(duration);
  if (isNaN(durationNumber)) {
    return res.status(400).json({ error: 'La durée doit être un nombre' });
  }

  const exerciseDate = date ? new Date(date) : new Date();

  const newExercise = {
    username: user.username,
    description: description,
    duration: durationNumber,
    date: exerciseDate.toDateString(),
    userId: userId
  };

  exercises.push(newExercise);

  // 8. Réponse : l'objet utilisateur avec les champs d'exercice ajoutés
  const response = {
    _id: user._id,
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date
  };
  res.json(response);
});

// 9. GET /api/users/:_id/logs - Récupérer le journal d'exercice d'un utilisateur
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  let userExercises = exercises.filter(exercise => exercise.userId === userId);

  // Filtrer par date
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(exercise => new Date(exercise.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(exercise => new Date(exercise.date) <= toDate);
  }

  // Limiter le nombre de résultats
  if (limit) {
    const limitNumber = parseInt(limit);
    if (!isNaN(limitNumber) && limitNumber >= 0) {
      userExercises = userExercises.slice(0, limitNumber);
    }
  }

  // 10. Réponse : objet utilisateur avec une propriété 'count'
  // 11. Et un tableau 'log' de tous les exercices ajoutés
  const log = userExercises.map(exercise => ({
    // 12. Chaque élément du log : { description, duration, date }
    description: exercise.description,
    // 13. description est une chaîne
    duration: exercise.duration,
    // 14. duration est un nombre
    date: exercise.date // 15. date est une chaîne (toDateString)
  }));

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
