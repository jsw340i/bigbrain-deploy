import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router } from "react-router-dom";
import Pages from './Pages';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Pages />
    </Router>
  );
}

export default App;
