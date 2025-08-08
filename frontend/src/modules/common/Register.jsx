import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Box, Avatar, Button, TextField, Grid, Typography, IconButton, AppBar, Toolbar, Typography as MuiTypography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import axios from 'axios';
import { message } from 'antd';

const Register = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    type: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data?.name || !data?.email || !data?.password || !data?.type) {
      return message.error("Please fill all fields");
    } else {
      axios.post('http://localhost:8001/api/user/register', data)
        .then((response) => {
          if (response.data.success) {
            message.success(response.data.message);
            navigate('/login');
          } else {
            message.error(response.data.message);
          }
        })
        .catch((error) => {
          console.log("Error", error);
        });
    }
  };

  return (
    <div>
      {/* Top Bar */}
      <AppBar position="sticky" sx={{ backgroundColor: '#007bff' }}>
        <Toolbar>
          <MuiTypography variant="h6" sx={{ flexGrow: 1 }}>
            Renteasy
          </MuiTypography>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', marginRight: '15px' }}>Home</Link>
          <Link to="/login" style={{ color: 'white', textDecoration: 'none', marginRight: '15px' }}>Login</Link>
          <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
        </Toolbar>
      </AppBar>

      {/* Register Form */}
      <div style={{
        backgroundColor: 'rgba(25, 31, 52, 0.2)',
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
              Sign up
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                fullWidth
                id="name"
                label="Renter Full Name/Owner Name"
                name="name"
                value={data.name}
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
                id="email"
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
                label="Password"
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
              <InputLabel id="type-label" sx={{ marginTop: 2, color: '#666666' }}>User Type</InputLabel>
              <Select
                labelId="type-label"
                id="type"
                name="type"
                value={data.type}
                label="User Type"
                onChange={handleChange}
                variant="outlined"
                sx={{
                  width: '100%',
                  marginBottom: 2,
                  backgroundColor: '#fafafa',
                  borderRadius: 4,
                  color: '#333333',
                  border: '1px solid #cccccc',
                }}
              >
                <MenuItem value="" disabled>Select User</MenuItem>
                <MenuItem value="Renter">Renter</MenuItem>
                <MenuItem value="Owner">Owner</MenuItem>
              </Select>
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
                Sign Up
              </Button>
              <Grid container justifyContent="flex-end" mt={2} sx={{ color: '#333333' }}>
                <Grid item>
                  <Typography variant="body2" sx={{ display: 'inline', marginRight: 1 }}>
                    Have an account?
                  </Typography>
                  <Link to="/login" style={{
                    color: '#007bff',
                    textDecoration: 'none',
                  }}>
                    Sign In
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </div>
    </div>
  );
};

export default Register;
