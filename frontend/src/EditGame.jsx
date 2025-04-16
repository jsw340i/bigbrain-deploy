import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function EditGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [games, setGames] = useState([]);
  const [game, setGame] = useState(null);
  const [name, setName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5005/admin/games', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setGames(res.data.games);
      const foundGame = res.data.games.find(g => g.id.toString() === gameId);
      if (foundGame) {
        setGame(foundGame);
        setName(foundGame.name);
        setQuestions(foundGame.questions || []);
      }
    })
    .catch(err => alert(err));
  }, [gameId, token]);

  useEffect(() => {
    if (!game) return;

    const updatedGames = games.map(g =>
      g.id.toString() === gameId ? { ...g, name, questions } : g
    );

    axios.put('http://localhost:5005/admin/games', {
      games: updatedGames
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(err => alert(err.response.data.error));

  }, [questions]);

  const handleSave = async () => {
    if (!game) return;

    const updatedGames = games.map(g =>
      g.id.toString() === gameId ? { ...g, name, questions } : g
    );

    try {
      await axios.put('http://localhost:5005/admin/games', {
        games: updatedGames
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Game updated!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
    alert('Question deleted!');
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const newQ = {
      id: uuidv4(), // generate a unique ID
      question: newQuestion,
      correctAnswers: [],
      duration: 30,
      points: 100,
      answers: [],
    };
    setQuestions([...questions, newQ]);
    setNewQuestion('');
    alert('Question added!');
    navigate('/dashboard');
  };

  return (
    <div>
      <h2>Edit Game</h2>
      <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>Go Back</Button><br />
      
      <label>Game Name:</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button onClick={handleSave}>Save</Button>
  
      <h3>Questions</h3>
      {questions.length === 0 ? (
        <p>No questions yet.</p>
      ) : (
        questions.map((q) => (
          <div key={q.id || q.question} style={{ border: '1px solid gray', padding: '10px', marginBottom: '5px' }}>
            <p><strong>Question:</strong> {q.question}</p>
            <Button variant="danger" onClick={() => handleDeleteQuestion(q.id)}>Delete</Button>
            <Link to={`/game/${gameId}/question/${q.id}`}>
              <Button variant="info">Edit Question</Button>
            </Link>
          </div>
        ))
      )}

  
      <h4>Add a Question</h4>
      <input
        type="text"
        value={newQuestion}
        placeholder="Enter question"
        onChange={(e) => setNewQuestion(e.target.value)}
      />
      <Button variant="success" onClick={handleAddQuestion}>Add Question</Button>
    </div>
  );
  
}

export default EditGame;
