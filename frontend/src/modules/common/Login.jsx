import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Box, Avatar, Button, TextField, Grid, Typography, IconButton } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { message } from 'antd';

const Login = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data?.email || !data?.password) {
      return message.error("Please fill all fields");
    } else {
      axios
        .post('http://localhost:8001/api/user/login', data)
        .then((res) => {
          if (res.data.success) {
            message.success(res.data.message);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            const isLoggedIn = JSON.parse(localStorage.getItem("user"));
            switch (isLoggedIn.type) {
              case "Admin":
                navigate("/adminhome");
                break;
              case "Renter":
                navigate("/renterhome");
                break;
              case "Owner":
                if (isLoggedIn.granted === 'ungranted') {
                  message.error('Your account is not yet confirmed by the admin');
                } else {
                  navigate("/ownerhome");
                }
                break;
              default:
                navigate("/login");
                break;
            }
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            message.error(res.data.message);
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 401) {
            message.error("User doesn't exist");
          }
          navigate("/login");
        });
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <div style={{
      backgroundColor: 'rgba(25, 31, 52,0.2)', // Solid blue background
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Bar */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#007bff',
        padding: '10px 20px',
        color: '#fff',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          RentEasy
        </Typography>
        <Box>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginRight: '15px' }}>Home</Link>
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none', marginRight: '15px' }}>Login</Link>
          <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
        </Box>
      </Box>

      {/* Login Form */}
      <Container component="main" maxWidth="xs" sx={{
        backgroundColor: '#ffffff',
        padding: 4,
        borderRadius: 4,
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
        border: '1px solid #dcdcdc',
        marginTop: 2,
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
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              fullWidth
              label="Username"
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
              label="Password"
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
              Sign in
            </Button>
            <Grid container justifyContent="space-between" mt={2} sx={{ color: '#333333' }}>
              <Grid item>
                <Link to="/forgotpassword" style={{
                  color: '#007bff',
                  textDecoration: 'none',
                }}>
                  Forgot password?
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

export default Login;
