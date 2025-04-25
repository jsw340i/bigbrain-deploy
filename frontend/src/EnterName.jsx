import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function EnterName() {
  const { sessionId } = useParams();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`http://localhost:5005/play/join/${sessionId}`, { 
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
        name: name,
      });
      const Id_player = response.data.playerId;
      localStorage.setItem('playerId', Id_player);
      navigate(`/play/${sessionId}/game`);
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <Container className="mt-4">
      <h3>Joining Session {sessionId}</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Your Name:</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" variant="success" className="mt-3">
          Enter Game
        </Button>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Form>
    </Container>
  );
}

export default EnterName;
