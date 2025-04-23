import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import EditGame from './EditGame';
import EditQuestion from './EditQuestion';
import SessionResult from './SessionResult';
import JoinSession from './JoinSession';
import EnterName from './EnterName';
import Game from './Game';

function  Pages() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setEmail(localStorage.getItem('email'));
  }, []);

  const successJob = (token, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    setToken(token);
    setEmail(email);
    navigate('/dashboard');
  } 

  const logout = async () => {
    try {
      const response = await axios.post('http://localhost:5005/admin/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      setEmail(null);
      setToken(null);
      navigate('/login');
    } catch (err) {
      alert(err.response.data.error);
    }
  };
  

  const shouldHideHeader = location.pathname.startsWith('/play');

  return (
    <>
      {!shouldHideHeader && (
        <div>
          {token ? (
            <>
              <Button onClick={logout}>Logout</Button>
              <div style={{ textAlign: 'right', marginRight: '50px' }}>
                <h5>
                  User Logged in:  <strong><u>{email}</u></strong>
                </h5>
              </div>
            </>
          ) : (
            <>
              <Link to="/register">Register</Link>
              &nbsp;|&nbsp;
              <Link to="/login">Login</Link>
            </>
          )}
          <hr />
        </div>
      )}
      <Routes>
        <Route path="/register" element={<Register successJob={successJob} token={token} />} />
        <Route path="/login" element={<Login successJob={successJob} token={token} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game/:gameId" element={<EditGame />} />
        <Route path="/game/:gameId/question/:questionId" element={<EditQuestion />} />
        <Route path="/session/:sessionId" element={<SessionResult />} />
        <Route path="/play/join" element={<JoinSession />} />
        <Route path="/play/join/:sessionId" element={<EnterName />} />
        <Route path="/play/:sessionId/game" element={<Game />} />
      </Routes>
    </>
  );
}

export default Pages;
