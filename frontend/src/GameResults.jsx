import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function GameResults() {
  const navigate = useNavigate();
  const { playerId, sessionId } = useParams();
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [totalScore, setTotalScore] = useState({ player: 0, max: 0 });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`http://localhost:5005/play/${playerId}/results`);
        const playerResults = res.data;

        // Get all games and find the one that has this sessionId in oldSessions
        const sessionRes = await axios.get(`http://localhost:5005/admin/games`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const allGames = sessionRes.data.games;
        const game = allGames.find(g => g.oldSessions.includes(Number(sessionId)));

        if (!game) {
          setError('Game not found for this session.');
          return;
        }

        const gameQuestions = game.questions;

        const detailedResults = playerResults.map((result, index) => {
          const q = gameQuestions[index];
          const timeTaken = (
            (new Date(result.answeredAt) - new Date(result.questionStartedAt)) / 1000
          ).toFixed(1);

          const points = result.correct ? Number(q.points) : 0;

          return {
            question: q.question,
            correctAnswers: q.correctAnswers,
            playerAnswers: result.answers,
            correct: result.correct,
            timeTaken,
            points
          };
        });

        const maxScore = gameQuestions.reduce((sum, q) => sum + Number(q.points), 0);
        const playerScore = detailedResults.reduce((sum, r) => sum + r.points, 0);

        setResults(detailedResults);
        setTotalScore({ player: playerScore, max: maxScore });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load results');
      }
    };

    fetchResults();
  }, [playerId, sessionId]);

  return (
    <>
      <Button onClick={() => navigate('/play/join')} variant="secondary">Go Back</Button>
      <hr />
      <h2 className="mb-3">Your Game Results</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results.map((r, i) => (
        <div key={i} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '10px' }}>
          <h5>Question {i + 1}</h5>
          <p><strong>Q:</strong> {r.question}</p>
          <p><strong>Your Answer:</strong> {r.playerAnswers.join(', ')}</p>
          <p><strong>Correct Answer:</strong> {r.correctAnswers.join(', ')}</p>
          <p>
            <strong>Correct?</strong> {r.correct ? '✅ Yes' : '❌ No'} — <strong>{r.points} points</strong>
          </p>
          <p><strong>Time Taken:</strong> {r.timeTaken} seconds</p>
        </div>
      ))}

      {results.length > 0 && (
        <h4>Total Score: {totalScore.player} / {totalScore.max}</h4>
      )}
    </>
  );
}

export default GameResults;
