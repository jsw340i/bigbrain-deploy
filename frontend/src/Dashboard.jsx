import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function Dashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [games, setGames] = useState({});

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  const fetchGames = async () => {
    try {
      const res = await axios.get('http://localhost:5005/admin/games', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGames(res.data.games);
    } catch (err) {
      alert('Failed to fetch games:', err);
    }
  };

  const createGame = async (e) => {
		e.preventDefault();
		const newGameId = Date.now();
	
		try {
			const res = await axios.get('http://localhost:5005/admin/games', {
				headers: { Authorization: `Bearer ${token}` }
			});
			const currentGames = res.data.games;
	
			const updatedGames = [
				...Object.values(currentGames),
				{
					id: newGameId,
					name: newGameName,
					owner: email,
					questions: [],
					oldSessions: [],
					active: null
				}
			];
	
			await axios.put('http://localhost:5005/admin/games', {
				games: updatedGames
			}, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
	
			setNewGameName('');
			setShowCreateForm(false);
	
			await fetchGames(); // Re-fetch to get fresh game IDs and structure
		} catch (err) {
			alert(err.response.data.error);
		}
	};
	

  useEffect(() => {
    if (token) fetchGames();
  }, [token]);

  const gameArray = Object.values(games);

  return (
    <>
			<u>
				<h5>Hi <strong>{email}</strong></h5>
			</u>
      <h1>Dashboard</h1>
      <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="outline-secondary">
        + Create Game
      </Button>

      {showCreateForm && (
        <form onSubmit={createGame} style={{ marginTop: '10px' }}>
          <input
            type="text"
            value={newGameName}
            onChange={(e) => setNewGameName(e.target.value)}
            placeholder="Enter game name"
            required
            style={{ marginRight: '10px' }}
          />
          <Button type="submit">Create</Button>
        </form>
      )}

      {gameArray.length === 0 && <p style={{ marginTop: '20px' }}>No games found.</p>}

      {gameArray.map((game) => {
        const totalDuration = game.questions?.reduce((sum, q) => sum + (q.duration || 0), 0) || 0;
        return (
          <div
            key={game.id}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginTop: '15px',
              borderRadius: '8px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            <h3>{game.name}</h3>
            <p>Questions: {game.questions?.length || 0}</p>
            <p>Total Duration: {totalDuration} seconds</p>
            <Link to={`/game/${game.id}`}>Edit Game</Link>
          </div>
        );
      })}
    </>
  );
}

export default Dashboard;
