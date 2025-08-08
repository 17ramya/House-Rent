import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Box, Avatar, Button, TextField, Grid, Typography, IconButton } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { message } from 'antd';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data?.email || !data?.password || !data?.confirmPassword) {
      return message.error("Please fill all fields");
    } else {
      if (data.password === data.confirmPassword) {
        axios
          .post('http://localhost:8001/api/user/forgotpassword', data)
          .then((res) => {
            if (res.data.success) {
              message.success('Your password has been changed!');
              navigate('/login');
            } else {
              message.error(res.data.message);
            }
          })
          .catch((err) => {
            if (err.response && err.response.status === 401) {
              message.error("User doesn't exist");
            }
            navigate('/register');
          });
      } else {
        message.error("Passwords do not match");
      }
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <div style={{
      backgroundColor: 'rgba(25, 31, 52,0.2)', // Solid blue background
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Container component="main" maxWidth="xs" sx={{
        backgroundColor: '#ffffff',
        padding: 4,
        borderRadius: 4,
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
        border: '1px solid #dcdcdc',
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Avatar sx={{
            bgcolor: '#007bff',
            width: 56,
            height: 56,
          }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{
            fontWeight: 600,
            color: '#333333',
            marginTop: 2,
          }}>
            Forgot Password?
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              fullWidth
              label="Email Address"
              name="email"
              value={data.email}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                style: {
                  backgroundColor: '#fafafa',
                  borderRadius: 4,
                  color: '#333333',
                  border: '1px solid #cccccc',
                }
              }}
              InputLabelProps={{
                style: { color: '#666666' }
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              value={data.password}
              onChange={handleChange}
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              InputProps={{
                style: {
                  backgroundColor: '#fafafa',
                  borderRadius: 4,
                  color: '#333333',
                  border: '1px solid #cccccc',
                },
                endAdornment: (
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ color: '#666666' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              InputLabelProps={{
                style: { color: '#666666' }
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="confirmPassword"
              value={data.confirmPassword}
              onChange={handleChange}
              label="Confirm Password"
              type="password"
              variant="outlined"
              InputProps={{
                style: {
                  backgroundColor: '#fafafa',
                  borderRadius: 4,
                  color: '#333333',
                  border: '1px solid #cccccc',
                }
              }}
              InputLabelProps={{
                style: { color: '#666666' }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                marginTop: 2,
                borderRadius: 4,
                fontWeight: 500,
                backgroundColor: '#007bff',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#0056b3',
                },
              }}
            >
              Change Password
            </Button>
            <Grid container justifyContent="space-between" mt={2} sx={{ color: '#333333' }}>
              <Grid item>
                <Link to="/login" style={{
                  color: '#007bff',
                  textDecoration: 'none',
                }}>
                  Remembered your password? Login
                </Link>
              </Grid>
              <Grid item>
                <Link to="/register" style={{
                  color: '#007bff',
                  textDecoration: 'none',
                }}>
                  Don't have an account? Register
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default ForgotPassword;
