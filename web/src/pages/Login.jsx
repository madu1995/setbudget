import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const LoginBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: ${props => props.theme.radius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 30px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.sm};
  box-sizing: border-box;
  font-size: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.sm};
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorMsg = styled.p`
  color: #DC2626;
  margin-bottom: 15px;
`;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, updatePassword, user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const loggedInUser = await login(username, password);
      if (!loggedInUser.requiresPasswordChange) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      await updatePassword(newPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
    }
  };

  if (user && user.requiresPasswordChange) {
    return (
      <LoginContainer>
        <LoginBox>
          <Title>Update Password</Title>
          <p style={{marginBottom: '20px', color: '#666'}}>Please update your default password to continue.</p>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <form onSubmit={handlePasswordChange}>
            <Input 
              type="password" 
              placeholder="New Password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
            />
            <Input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
            />
            <Button type="submit">Update Password</Button>
          </form>
        </LoginBox>
      </LoginContainer>
    );
  }

  return (
    <LoginContainer>
      <LoginBox>
        <Title>Set Budget</Title>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <form onSubmit={handleLogin}>
          <Input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <Input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <Button type="submit">Login</Button>
        </form>
      </LoginBox>
    </LoginContainer>
  );
}
