import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function Dashboard() {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newGameName, setNewGameName] = useState('');
	const token = localStorage.getItem('token');
	const email = localStorage.getItem('email');
	const [games, setGames] = useState([]);

	const createGame = async (e) => {
		e.preventDefault();
		const newGameId = Date.now();
		try {
			const response = await axios.put('http://localhost:5005/admin/games', {
				games: [
					{
					id: newGameId,
					name: newGameName,
					owner: email,
					questions: []
					}
				]
			}, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			setNewGameName('');
			setShowCreateForm(false);
			fetchGames();
		} catch (err) {
			alert(err.response.data.error);
		}
	}

	const fetchGames = () => {
		axios.get('http://localhost:5005/admin/games', {
			headers: { Authorization: `Bearer ${token}` }
		})
		.then(res => setGames(res.data.games))
		.catch(err => console.error(err));
	};

	useEffect(() => {
		fetchGames();
	}, [token]);
	

	return (
		<>
			<h1>Dashboard</h1>
			<Button onClick={() => setShowCreateForm(!showCreateForm)} variant="outline-secondary">+ Create Game</Button>
	
			{showCreateForm && (
				<form onSubmit={createGame}>
					<input
						type="text"
						value={newGameName}
						onChange={(e) => setNewGameName(e.target.value)}
						placeholder="Enter game name"
						required
					/>
					<Button type="submit">Create</Button>
				</form>
			)}
	
			{games.map(game => {
				const totalDuration = game.questions.reduce((sum, q) => sum + (q.duration || 0), 0);
				return (
					<div key={game.id} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
						<h3>{game.name}</h3>
						<p>Questions: {game.questions.length}</p>
						<p>Total Duration: {totalDuration} seconds</p>
						<Link to={`/game/${game.id}`}>Edit Game</Link>
					</div>
				);
			})}
		</>
	);
	
}

export default Dashboard;