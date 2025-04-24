import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function GameResults() {
  const navigate = useNavigate();
  return(
    <> 
      <Button onClick={() => navigate('/play/join')}>Go Back</Button>
      <hr />
      <p>Hello World</p>
    </>
  )
}

export default GameResults;