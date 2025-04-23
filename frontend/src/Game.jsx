import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function Game() {
  const navigate = useNavigate();
  return(
    <>  
      <p>Hello world</p>
      <Button onClick={() => navigate('/play/join')}>
        Go Back
      </Button>
    </>
  )
}

export default Game;