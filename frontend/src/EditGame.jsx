import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function EditGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [games, setGames] = useState([]);
  const [game, setGame] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5005/admin/games', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setGames(res.data.games);
      const foundGame = res.data.games.find(g => g.id.toString() === id);
      if (foundGame) {
        setGame(foundGame);
        setName(foundGame.name);
      }
    })
    .catch(err => console.error(err));
  }, [id, token]);

  const handleSave = async () => {
    if (!game) return;

    const updatedGames = games.map(g =>
      g.id.toString() === id ? { ...g, name } : g
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
      console.error(err);
      alert(err.response.data.error);
    }
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
    </div>
  );
}

export default EditGame;
