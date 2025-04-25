import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function JoinSession() {
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sessionId.trim()) {
      navigate(`/play/join/${sessionId}`);
    }
  };

  return (
    <Container className="mt-4">
      <h3>Join a Game Session</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Enter Session ID:</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. 312894"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Join
        </Button>
      </Form>
    </Container>
  );
}

export default JoinSession;
