import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function Game() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const playerId = localStorage.getItem('playerId');

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false); 
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
          setSelectedAnswers([]);
          setIsAnswered(false);
          setCorrectAnswer(null);
          setHasSubmitted(false); 
        }

        if (!stopPolling && isMounted.current) {
          setTimeout(poll, 2000);
        }
      } catch (err) {
        if (err.response?.status === 400 && isMounted.current) {
          stopPolling = true;
          navigate(`/play/${playerId}/results/${sessionId}`);
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
  }, [playerId, currentQuestion, navigate, sessionStarted, location.pathname]);

  useEffect(() => {
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout(); // Handle timeout when timer ends
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const submitAnswer = async () => {
    if (selectedAnswers.length === 0) {
      alert('Answers must be provided');
      return;
    }

    try {
      await axios.put(`http://localhost:5005/play/${playerId}/answer`, { answers: selectedAnswers });
      setHasSubmitted(true); // Mark as submitted to prevent further changes
      const res = await axios.get(`http://localhost:5005/play/${playerId}/answer`);
      setCorrectAnswer(res.data.answers);
      setIsAnswered(true); 
    } catch (err) {
      void err;
    }
  };

  const handleTimeout = async () => {
    if (hasSubmitted || correctAnswer !== null) return; // Don't fetch again if already submitted or fetched

    try {
      const res = await axios.get(`http://localhost:5005/play/${playerId}/answer`);
      setCorrectAnswer(res.data.answers);
      setIsAnswered(true); 
    } catch (err) {
      alert(`Timeout error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (hasSubmitted) return; 

    if (selectedAnswers.includes(answer)) {
      setSelectedAnswers(selectedAnswers.filter((selected) => selected !== answer));
    } else {
      setSelectedAnswers([...selectedAnswers, answer]);
    }
  };

  const handleLeave = () => {
    localStorage.removeItem('playerId');
    navigate('/play/join');
  };

  useEffect(() => {
    setIsAnswered(selectedAnswers.length > 0 && !hasSubmitted);
  }, [selectedAnswers, hasSubmitted]);

  if (!sessionStarted) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '50px' }}>
        <h2>🎉 Welcome to the Game Lobby!</h2>
        <p>We&apos;re waiting for the host to start the quiz...</p>
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
      <br />
      <h6>Time left: {timeLeft}s</h6>
      <br />
      <p>
        {currentQuestion.questionType === 'multiple'
          ? 'Please select ALL the correct answers.'
          : 'Please select the correct answer.'}
      </p>

      {currentQuestion.media && (
        <div>
          {currentQuestion.media.type === 'image' ? (
            <img src={currentQuestion.media.url} alt="Question Media" style={{ maxWidth: '100%' }} />
          ) : (
            <video controls style={{ maxWidth: '100%' }}>
              <source src={currentQuestion.media.url} type="video/mp4" />
            </video>
          )}
        </div>
      )}

      <div>
        {currentQuestion.answers.map((answer, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <Button
              disabled={hasSubmitted} // Disable buttons after submitting
              onClick={() => handleAnswerSelect(answer)}
              style={{
                backgroundColor:
                  isAnswered && correctAnswer?.includes(answer)
                    ? 'lightgreen'
                    : selectedAnswers.includes(answer)
                      ? 'lightblue'
                      : '',
              }}
            >
              {answer}
            </Button>
          </div>
        ))}
      </div>

      {isAnswered && (
        <>
          {timeLeft === 0 && !hasSubmitted && <p>⏰ Time&apos;s up!</p>}
          {correctAnswer && (
            <p>
              ✅ Correct Answer(s): <strong>{correctAnswer.join(', ')}</strong>
            </p>
          )}
          {hasSubmitted && selectedAnswers.length > 0 && (
            <p>
              You answered: <strong>{selectedAnswers.join(', ')}</strong> (
              {
                JSON.stringify(selectedAnswers.sort()) === JSON.stringify(correctAnswer?.sort())
                  ? 'Correct ✅'
                  : 'Incorrect ❌'
              })
            </p>
          )}
          {!hasSubmitted && timeLeft === 0 && selectedAnswers.length > 0 && (
            <p>
              You selected: <strong>{selectedAnswers.join(', ')}</strong>
            </p>
          )}
          {!hasSubmitted && timeLeft === 0 && selectedAnswers.length === 0 && (
            <p>You didn&apos;t select an answer in time. ⌛</p>
          )}
        </>
      )}

      {!hasSubmitted && (
        <Button
          onClick={submitAnswer}
          style={{ marginTop: '20px' }}
          disabled={selectedAnswers.length === 0} 
        >
          Submit Answer
        </Button>
      )}
    </div>
  );
}

export default Game;