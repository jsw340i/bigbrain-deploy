import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function Register({ successJob, token }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);
    
  const register = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return; 
    }
    try {
      const response = await axios.post('http://localhost:5005/admin/auth/register', {
        email: email,
        password: password,
        name: name
      });
      const token = response.data.token;
      successJob(token, email);
    } catch (err) {
      alert(err.response.data.error);
    }
  }
  
  return (
    <>
      <h1>Register</h1>
      <form onSubmit={register}>
          Email: <input value={email} onChange={e => setEmail(e.target.value)} type='text' required /><br />
          Name: <input value={name} onChange={e => setName(e.target.value)} type='text' required /><br />
          Password: <input value={password} onChange={e => setPassword(e.target.value)} type='password' required /><br />
          Confirm Password: <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type='password' required /><br />
        <Button type="submit">Register</Button>
      </form>
    </>
  );
}

export default Register;