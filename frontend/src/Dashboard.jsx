import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function Dashboard() {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newGameName, setNewGameName] = useState('');
	const newGameId = Date.now();
	const token = localStorage.getItem('token');
	const email = localStorage.getItem('email');

	const createGame = async (e) => {
		e.preventDefault();
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
		} catch (err) {
			alert(err.response.data.error);
		}
	}
	

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
			
		</>
	)
}

export default Dashboard;