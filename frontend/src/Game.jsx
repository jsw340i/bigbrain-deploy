import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation to track current path
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function Game() {
  const navigate = useNavigate();
  const location = useLocation();  // Track current location
  const playerId = localStorage.getItem('playerId');

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const checkStatus = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:5005/play/${playerId}/status`);
        if (res.data.started) {
          setSessionStarted(true);
          clearInterval(checkStatus);
        }
      } catch (err) {
        alert(`Status error: ${err.response?.data?.error || err.message}`);
      }
    }, 2000);

    return () => clearInterval(checkStatus);
  }, [playerId]);

  useEffect(() => {
    if (!sessionStarted) return;
    let stopPolling = false;

    // If the current location is '/results', stop polling for questions
    if (location.pathname.includes('results')) {
      stopPolling = true;
      return;
    }

    const poll = async () => {
      try {
        const questionRes = await axios.get(`http://localhost:5005/play/${playerId}/question`);
        const newQuestion = questionRes.data.question;

        if (!stopPolling && isMounted.current && (!currentQuestion || newQuestion.id !== currentQuestion.id)) {
          setCurrentQuestion(newQuestion);
          setTimeLeft(newQuestion.duration);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setCorrectAnswer(null);
        }

        if (!stopPolling && isMounted.current) {
          setTimeout(poll, 2000);
        }
      } catch (err) {
        if (err.response?.status === 400 && isMounted.current) {
          stopPolling = true; // stop future polls
          navigate(`/play/${playerId}/results`);
        } else if (!stopPolling && isMounted.current) {
          console.error('Polling error:', err);
          setTimeout(poll, 2000);
        }
      }
    };

    poll();

    return () => {
      stopPolling = true;
    };
  }, [playerId, currentQuestion, navigate, sessionStarted, location.pathname]);  // Add location.pathname as dependency

  // Countdown timer
  useEffect(() => {
    if (!currentQuestion || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, currentQuestion]);

  const handleTimeout = async () => {
    setIsAnswered(true);
    try {
      const res = await axios.get(`http://localhost:5005/play/${playerId}/answer`);
      console.log(`the correct asnwer is ${res.data.answer}`);
      setCorrectAnswer(res.data.answer);
    } catch (err) {
      alert(`Timeout error: ${err.response?.data?.error || err.message}`);
    }
  };

  const submitAnswer = async (answer) => {
    if (!answer) return;
    try {
      await axios.put(`http://localhost:5005/play/${playerId}/answer`, { answers: answer });
      setIsAnswered(true);
      const res = await axios.get(`http://localhost:5005/play/${playerId}/answer`);
      setCorrectAnswer(res.data.answer);
    } catch (err) {
      alert(`Submit error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
      submitAnswer(answer);
    }
  };

  const handleLeave = () => {
    localStorage.removeItem('playerId');
    navigate('/play/join');
  };

  if (!sessionStarted) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '50px' }}>
        <h2>🎉 Welcome to the Game Lobby!</h2>
        <p>We're waiting for the host to start the quiz...</p>
        <div style={{ marginTop: '30px' }}>
          <img
            src="https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif"
            alt="Waiting"
            style={{ width: '300px', borderRadius: '10px' }}
          />
        </div>
        <p style={{ marginTop: '20px', color: 'gray' }}>Get ready for some fun trivia!</p>
      </div>
    );
  }
  
  if (!currentQuestion) return <p>Loading question...</p>;

  return (
    <div>
      <Button variant='danger' onClick={handleLeave} style={{ marginTop: '20px' }}>
        Leave Session
      </Button>
      <hr />
      <h2>{currentQuestion.question}</h2>

      {currentQuestion.media && (
        <div>
          {currentQuestion.media.type === 'image' ? (
            <img src={currentQuestion.media.url} alt="Question Media" />
          ) : (
            <video controls>
              <source src={currentQuestion.media.url} type="video/mp4" />
            </video>
          )}
        </div>
      )}

      <div>
        {currentQuestion.answers.map((answer, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <Button
              disabled={isAnswered}
              onClick={() => handleAnswerSelect(answer)}
              style={{
                backgroundColor:
                  isAnswered && correctAnswer === answer
                    ? 'lightgreen'
                    : selectedAnswer === answer
                    ? 'lightcoral'
                    : '',
              }}
            >
              {answer}
            </Button>
          </div>
        ))}
      </div>

      <p>Time left: {timeLeft}s</p>

      {isAnswered && (
        <>
          {timeLeft === 0 && <p>⏰ Time's up!</p>}
          {correctAnswer && <p>✅ Correct Answer: <strong>{correctAnswer}</strong></p>}
          {selectedAnswer && <p>You answered: {selectedAnswer}</p>}
        </>
      )}
    </div>
  );
}

export default Game;
