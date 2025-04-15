import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function EditGame() {
  const { gameId } = useParams(); // Get the game ID from the URL parameter
  const navigate = useNavigate();
  
  const [game, setGame] = useState({});
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  // Fetch the game and its questions
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(`http://localhost:5005/admin/games/${gameId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setGame(response.data);
      } catch (err) {
        console.error('Error fetching game:', err);
      }
    };
    fetchGame();
  }, [gameId]);
  
  const handleAddQuestion = async () => {
    try {
      const newQuestionData = {
        question: newQuestion,
        // Add any other question properties you need
      };
      
      const response = await axios.post(`http://localhost:5005/admin/games/${gameId}/questions`, newQuestionData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setGame((prevGame) => ({
        ...prevGame,
        questions: [...prevGame.questions, response.data]
      }));
      setNewQuestion('');
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };
  
  const handleDeleteQuestion = async (questionId) => {
    try {
      await axios.delete(`http://localhost:5005/admin/games/${gameId}/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setGame((prevGame) => ({
        ...prevGame,
        questions: prevGame.questions.filter((q) => q.id !== questionId)
      }));
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };
  
  const handleEditQuestion = async (questionId) => {
    try {
      const updatedQuestionData = {
        question: editingQuestion,
        // Update any other properties of the question if needed
      };

      const response = await axios.put(`http://localhost:5005/admin/games/${gameId}/questions/${questionId}`, updatedQuestionData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setGame((prevGame) => ({
        ...prevGame,
        questions: prevGame.questions.map((q) =>
          q.id === questionId ? { ...q, ...response.data } : q
        )
      }));
      setEditingQuestion(null);
    } catch (err) {
      console.error('Error editing question:', err);
    }
  };
  
  return (
    <div>
      <h2>Edit Game</h2>
      <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>Go Back</Button>
      
      <h3>Game: {game.name}</h3>
      
      <h4>Questions:</h4>
      <ul>
        {game.questions && game.questions.map((question) => (
          <li key={question.id}>
            {editingQuestion && editingQuestion.id === question.id ? (
              <div>
                <input
                  type="text"
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                />
                <Button onClick={() => handleEditQuestion(question.id)}>Save</Button>
                <Button onClick={() => setEditingQuestion(null)}>Cancel</Button>
              </div>
            ) : (
              <div>
                <span>{question.question}</span>
                <Button onClick={() => setEditingQuestion({ id: question.id, question: question.question })}>Edit</Button>
                <Button onClick={() => handleDeleteQuestion(question.id)}>Delete</Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      
      <div>
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Enter new question"
        />
        <Button onClick={handleAddQuestion}>Add Question</Button>
      </div>
    </div>
  );
}

export default EditGame;
