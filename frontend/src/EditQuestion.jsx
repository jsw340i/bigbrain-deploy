import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function EditQuestion() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [duration, setDuration] = useState('');
  const [points, setPoints] = useState('');
  const [questionType, setQuestionType] = useState('single');
  const [answers, setAnswers] = useState(['', '']);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [mediaType, setMediaType] = useState('');
  const [media, setMedia] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5005/admin/games', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const foundGame = res.data.games.find(g => g.id.toString() === gameId);
      if (foundGame) {
        setGame(foundGame);
        const foundQ = foundGame.questions.find(q => q.id === questionId);
        if (foundQ) {
          setQuestion(foundQ);
          setQuestionText(foundQ.question || '');
          setDuration(foundQ.duration || '');
          setPoints(foundQ.points || '');
          setQuestionType(foundQ.questionType || 'single');
          setAnswers(foundQ.answers.length ? foundQ.answers : ['', '']);
          setCorrectAnswers(foundQ.correctAnswers || []);
          if (foundQ.media?.type) {
            setMediaType(foundQ.media.type);
            setMedia(foundQ.media.content);
          }
        }
      }
    }).catch(err => alert(err));
  }, [gameId, questionId, token]);

  const handleSubmit = async () => {
    try {
      const res = await axios.get('http://localhost:5005/admin/games', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allGames = res.data.games;

      const updatedGames = allGames.map((g) => {
        if (g.id.toString() === gameId) {
          const updatedQuestions = g.questions.map((q) =>
            q.id === questionId ? {
              ...q,
              question: questionText || q.question,
              duration: duration || q.duration,
              points: points || q.points,
              questionType: questionType || q.questionType,
              answers: answers,
              correctAnswers: correctAnswers,
              media: mediaType && media ? { type: mediaType, content: media } : undefined,
            } : q
          );
          return {
            ...g,
            questions: updatedQuestions
          };
        }
        return g;
      });

      await axios.put('http://localhost:5005/admin/games', {
        games: updatedGames
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Question updated!');
      navigate(`/dashboard`);
    } catch (err) {
      alert('Failed to update question.');
    }
  };

  const handleCorrectAnswerChange = (answer) => {
    if (questionType === 'judgement' || questionType === 'single') {
      setCorrectAnswers([answer]);
    } else {
      if (correctAnswers.includes(answer)) {
        setCorrectAnswers(correctAnswers.filter(a => a !== answer));
      } else {
        setCorrectAnswers([...correctAnswers, answer]);
      }
    }
  };

  return (
    <div>
      <h2>Edit Question</h2>
      <Button variant="outline-secondary" onClick={() => navigate(`/game/${gameId}`)}>Go Back</Button><br /><br />

      <label>Question Text:</label>
      <input
        type="text"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      /><br />

      <label>Time Limit (seconds):</label>
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value.replace(/^0+/, '') || '0')}
      /><br />

      <label>Points:</label>
      <input
        type="number"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
      /><br />

      <label>Question Type:</label>
      <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
        <option value="single">Single Choice</option>
        <option value="multiple">Multiple Choice</option>
        <option value="judgement">Judgement</option>
      </select><br />

      <label>Media Type:</label>
      <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
        <option value="">None</option>
        <option value="image">Image</option>
        <option value="youtube">YouTube</option>
      </select><br />

      {mediaType && (
        <>
          <label>{mediaType === 'image' ? 'Image URL:' : 'YouTube URL:'}</label>
          <input
            type="text"
            value={media}
            onChange={(e) => setMedia(e.target.value)}
          /><br />
        </>
      )}

      <label>Answers (2–6):</label><br />
      <p>(pick the bubble that has the correct answer)</p>
      {answers.map((ans, index) => (
        <div key={index}>
          <input
            type="text"
            value={ans}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[index] = e.target.value;
              setAnswers(newAnswers);
            }}
          />
          {(questionType === 'single' || questionType === 'judgement') ? (
            <input
              type="radio"
              name="correctAnswer"
              checked={correctAnswers.includes(ans)}
              onChange={() => handleCorrectAnswerChange(ans)}
            />
          ) : (
            <input
              type="checkbox"
              checked={correctAnswers.includes(ans)}
              onChange={() => handleCorrectAnswerChange(ans)}
            />
          )}
          {answers.length > 2 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                const newAnswers = answers.filter((_, i) => i !== index);
                setAnswers(newAnswers);
                setCorrectAnswers(correctAnswers.filter(a => a !== ans));
              }}
            >Remove</Button>
          )}
        </div>
      ))}
      {answers.length < 6 && (
        <Button onClick={() => setAnswers([...answers, ''])}>Add Answer</Button>
      )}
      <br /><br />

      <Button variant="primary" onClick={handleSubmit}>Submit</Button>
    </div>
  );
}

export default EditQuestion;
