import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function Game() {
  const { sessionId } = useParams(); // Get session ID from the URL
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    // Fetch game session details and the current question
    async function fetchGameData() {
      try {
        const response = await axios.get(`/play/${sessionId}/gameState`);
        setGameState(response.data);
        if (response.data.currentQuestion) {
          setCurrentQuestion(response.data.currentQuestion);
          setTimeLeft(response.data.timeLeft);
        }
      } catch (err) {
        console.error('Error fetching game data:', err);
      }
    }

    fetchGameData();
  }, [sessionId]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !isAnswered) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Handle timer reaching 0 (show results)
      submitAnswer(selectedAnswer); // Automatically submit answer when time runs out
    }
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered]);

  const submitAnswer = async (answer) => {
    if (!answer) return;
    try {
      await axios.post(`/play/join/${sessionId}/submit`, { answer });
      setIsAnswered(true); // Prevent further selection
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    submitAnswer(answer);
  };

  const handleGoToNextQuestion = () => {
    // Navigate or reload to move to the next question
    navigate(`/play/${sessionId}/game`);
  };

  if (!gameState) {
    return <p>Loading game...</p>;
  }

  // Check if the game hasn't started
  if (!gameState.currentQuestion) {
    return <p>Please wait...</p>;
  }

  return (
    <div>
      <h2>{currentQuestion.text}</h2>
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
          <button
            key={index}
            disabled={isAnswered}
            onClick={() => handleAnswerSelect(answer)}
          >
            {answer.text}
          </button>
        ))}
      </div>
      <p>Time left: {timeLeft}s</p>
      {timeLeft === 0 && !isAnswered && (
        <p>Time's up! Waiting for the admin to move to the next question...</p>
      )}
      {isAnswered && (
        <div>
          <p>Your answer has been submitted.</p>
          <button onClick={handleGoToNextQuestion}>Next Question</button>
        </div>
      )}
    </div>
  );
}

export default Game;
