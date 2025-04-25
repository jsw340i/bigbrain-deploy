import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function SessionResult() {
  const { sessionId } = useParams();
  const [results, setResults] = useState(null);
  const [sessionActive, setSessionActive] = useState(true);
  const navigate = useNavigate();
  
  const fetchResults = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/admin/session/${sessionId}/results`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    
      const raw = response.data;
  
      if (!raw || !raw.results || raw.results.length === 0) {
        setResults({ players: [], questions: [] });
        setSessionActive(true);
        return;
      }

      const players = raw.results.map(result => ({
        name: result.name,
        answers: result.answers
      }));
  
      const numQuestions = players[0]?.answers?.length || 0;
  
      const questions = Array.from({ length: numQuestions }, (_, qIndex) => {
        let correctCount = 0;
        let totalAnswers = 0;
        let totalTime = 0;
        let timeCount = 0;
  
        players.forEach(player => {
          const answerData = player.answers?.[qIndex];
          if (answerData) {
            if (answerData.answeredAt && answerData.questionStartedAt) {
              const time = (new Date(answerData.answeredAt) - new Date(answerData.questionStartedAt)) / 1000;
              totalTime += time;
              timeCount++;
            }
            if (answerData.correct) correctCount++;
            totalAnswers++;
          }
        });
  
        return {
          correctPercentage: totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0,
          averageAnswerTime: timeCount > 0 ? parseFloat((totalTime / timeCount).toFixed(2)) : 0
        };
      });
  
      setResults({ players, questions });
      setSessionActive(false);
    } catch (error) {
      alert(`Error fetching session results:${error}`);
    }
  };
  
  const advanceSession = async () => {
    try {
      await axios.post(
        `http://localhost:5005/admin/game/${gameId}/mutate`,
        { mutationType: 'ADVANCE' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Advanced to next question.');
    } catch (error) {
      alert(`Error advancing session::${error}`, );
    }
  };

  const stopSession = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5005/admin/game/${gameId}/mutate`,
        { mutationType: 'END' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSessionActive(false);
      fetchResults(); 
    } catch (error) {
      alert(`Error ending session:${error}`);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 3000); // fetching results every 3 sec
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="p-4">
      <h2>Session Results - ID: {sessionId}</h2>
      <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>Go Back</Button><br />
  
      {sessionActive ? (
        <>
          <p>This session is still active.</p>
          <Button variant="primary" onClick={advanceSession} className="me-2">Advance Question</Button>
          <Button variant="danger" onClick={stopSession}>End Session</Button>
        </>
      ) : results ? (
        <>
          {/* Top 5 Players Table */}
          {Array.isArray(results.players) && results.players.length > 0 && (
            <>
              <h4 className="mt-4">Top 5 Players</h4>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {results.players
                    .map((player) => {
                      const correctAnswers = player.answers.filter(answer => answer.correct).length;
                      const totalQuestions = results.questions.length;
                      return {
                        ...player,
                        score: `${correctAnswers}/${totalQuestions}` 
                      };
                    })
                    .sort((a, b) => b.score.split('/')[0] - a.score.split('/')[0]) 
                    .slice(0, 5) 
                    .map((player, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{player.name}</td>
                        <td>{player.score}</td> 
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}
          {/* Correct Answer % Bar Chart */}
          {Array.isArray(results.questions) && results.questions.length > 0 && (
            <>
              <h4 className="mt-5">Correct Answer Distribution</h4>
              <Bar
                data={{
                  labels: results.questions.map((_, idx) => `Q${idx + 1}`),
                  datasets: [{
                    label: '% Correct',
                    data: results.questions.map(q => q.correctPercentage ?? 0),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  }]
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: { display: true, text: '%' }
                    }
                  }
                }}
              />
            </>
          )}
          {/* Average Response Time Line Chart */}
          {Array.isArray(results.questions) && results.questions.length > 0 && (
            <>
              <h4 className="mt-5">Average Answer Time</h4>
              <Line
                data={{
                  labels: results.questions.map((_, idx) => `Q${idx + 1}`),
                  datasets: [{
                    label: 'Avg Time (s)',
                    data: results.questions.map(q => q.averageAnswerTime ?? 0),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    tension: 0.4,
                    fill: true
                  }]
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: 'Seconds' }
                    }
                  }
                }}
              />
            </>
          )}
        </>
      ) : (
        <p>Loading session results...</p>
      )}
    </div>
  );
}

export default SessionResult;
