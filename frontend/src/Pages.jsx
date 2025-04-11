import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';

function  Pages() {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  const successJob = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
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
      setToken(null);
      navigate('/login');
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <>
      {token ? (
        <>
          <Button onClick={logout}>Logout</Button>
        </>
      ) : (
        <>
          <Link to="/register">Register</Link>
          &nbsp;|&nbsp;
          <Link to="/login">Login</Link>
        </>
      )}
      <hr />
      <Routes>
        <Route path="/register" element={<Register successJob={successJob} token={token} />} />
        <Route path="/login" element={<Login successJob={successJob} token={token} />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default Pages;
