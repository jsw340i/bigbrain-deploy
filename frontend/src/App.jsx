import { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Register from './Register'
import Login from './Login'

function App() {
  return (
    <>
      <Router>
        <Link to="/register">Register</Link>
        &nbsp;|&nbsp;
        <Link to="/login">Login</Link>
        <hr />
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </Router>
    </>
  )
  
}

export default App
