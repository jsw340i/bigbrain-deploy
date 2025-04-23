import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function Dashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [games, setGames] = useState({});
  const [activeSessionId, setActiveSessionId] = useState(null); 
  const [sessionModalGameId, setSessionModalGameId] = useState(null); 

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
  
      await fetchGames();
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  const startSession = async (gameId) => {
    try {
      const owner = localStorage.getItem('email');
  
      const res = await axios.post(
        `http://localhost:5005/admin/game/${gameId}/mutate`,
        { mutationType: 'START' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { sessionId } = res.data.data;
      setActiveSessionId(sessionId);
      setSessionModalGameId(gameId);

			alert(`Game session started!\nSession ID: ${sessionId}`);
  
      // Get current games
      const currentGamesRes = await axios.get('http://localhost:5005/admin/games', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const currentGames = currentGamesRes.data.games;
  
      // Modify only the target game
      const updatedGames = Object.values(currentGames).map(game => {
        if (game.id === gameId) {
          return { ...game, active: sessionId, owner };
        }
        return game;
      });
  
      // Send full games list
      await axios.put(
        `http://localhost:5005/admin/games`,
        { games: updatedGames },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      await fetchGames();
    } catch (err) {
      console.error('Error response:', err.response);
      alert('Failed to start session: ' + (err.response.data.error || err.message));
    }
  };
  
  const stopSession = async (gameId) => {
    try {
      const owner = localStorage.getItem('email');
  
      const res = await axios.post(
        `http://localhost:5005/admin/game/${gameId}/mutate`,
        { mutationType: 'END' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
			
      const { sessionId } = res.data;
			const currentSessionId = activeSessionId;
      setActiveSessionId(null);
  
      const currentGamesRes = await axios.get('http://localhost:5005/admin/games', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const currentGames = currentGamesRes.data.games;
  
      const updatedGames = Object.values(currentGames).map(game => {
        if (game.id === gameId) {
          return { ...game, active: null, owner };
        }
        return game;
      });
  
      await axios.put(
        `http://localhost:5005/admin/games`,
        { games: updatedGames },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      await fetchGames();
			const goToResults = window.confirm('The session has ended. Would you like to view the results?');
			if (goToResults) {
				window.location.href = `/session/${currentSessionId}`;
			}
    } catch (err) {
      console.error('Error response:', err.response);
      alert('Failed to stop session: ' + (err.response.data.error || err.message));
    }
  };

  useEffect(() => {
    if (token) fetchGames();
  }, [token]);

  const gameArray = Object.values(games);

	function SessionLink({ sessionId }) {
		const [copied, setCopied] = useState(false);
		const joinUrl = `${window.location.origin}/play/join/${sessionId}`;
	
		const handleCopy = async () => {
			try {
				await navigator.clipboard.writeText(joinUrl);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (err) {
				console.error('Failed to copy:', err);
			}
		};
	
		return (
			<p>
				Active Session ID: <strong>{sessionId}</strong>{' '}
				<button onClick={handleCopy} style={{ marginLeft: '10px' }}>
					📋 {copied ? 'Copied!' : 'Copy Link'}
				</button>
			</p>
		);
	}

  return (
    <>
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
            <p>Total Duration: {Number(totalDuration)} seconds</p>
            <Link to={`/game/${game.id}`}>Edit Game</Link><br />

            {game.active ? (
              <div>
								<SessionLink sessionId={game.active} />
                <Button variant="danger" onClick={() => stopSession(game.id)}>
                  Stop Session
                </Button>
              </div>
            ) : (
              <Button onClick={() => startSession(game.id)} variant="primary">
                Start Game Session
              </Button>
            )}
          </div>
        );
      })}
    </>
  );
}

export default Dashboard;

