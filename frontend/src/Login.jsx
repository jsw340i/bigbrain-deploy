import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';


function Login({ successJob, token }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);
  
  const login = async () => {
    try {
      const response = await axios.post('http://localhost:5005/admin/auth/login', {
        email: email,
        password: password,
      });
      const token = response.data.token;
      successJob(token, email);
    } catch (err) {
      alert(err.response.data.error);
    }
  }

  return (
    <>
      <h1>Login</h1>
      <form onSubmit={login}>
        Email: <input value={email} onChange={e => setEmail(e.target.value)} type='text' /><br />
        Password: <input value={password} onChange={e => setPassword(e.target.value)} type='password' /><br />
        <Button type="submit">Login</Button>
      </form>
    </>
  );
  
}

export default Login;