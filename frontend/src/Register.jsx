import { useState } from 'react';
import axios from 'axios';

function Register({ successJob }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const register = async () => {
      try {
        const response = await axios.post('http://localhost:5005/admin/auth/register', {
          email: email,
          password: password,
          name: name
        });
        const token = response.data.token;
        successJob(token);
      } catch (err) {
        console.log(err);
        alert(err.response.data.error);
      }
    }
  
    return (
      <>
        <h1>Register</h1>
        Email: <input value={email} onChange={e => setEmail(e.target.value)} type='text'/><br />
        Name: <input value={name} onChange={e => setName(e.target.value)} type='text'/><br />
        Password: <input value={password} onChange={e => setPassword(e.target.value)} type='password'/><br />
        Confirm Password: <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type='password'/><br />
        <button onClick={register}>Register</button>
      </>
    )
}

export default Register;