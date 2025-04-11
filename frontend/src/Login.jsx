import { useState } from 'react';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const login = async () => {
      try {
        const response = await axios.post('http://localhost:5005/admin/auth/login', {
          email: email,
          password: password,
        });
        const token = response.data.token;
      } catch (err) {
        alert(err.response.data.error);
      }
    }
  
    return (
      <>
        <h1>Login</h1>
        Email: <input value={email} onChange={e => setEmail(e.target.value)} type='text'/><br />
        Password: <input value={password} onChange={e => setPassword(e.target.value)} type='password'/><br />
        <button onClick={login}>Login</button>
      </>
    )
}

export default Login;