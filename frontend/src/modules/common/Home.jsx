import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar';
import { Container, Nav, Button } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import p1 from '../../images/p1.jpg'
import p2 from '../../images/p2.jpg'
import p3 from '../../images/p3.jpg'
import p4 from '../../images/p4.jpg'
import AllPropertiesCards from '../user/AllPropertiesCards';

const Home = () => {
   const [index, setIndex] = useState(0);

   const handleSelect = (selectedIndex) => {
      setIndex(selectedIndex);
   };

   return (
      <>
         <div style={{ backgroundColor: 'rgba(25, 31, 52, 0.2)', minHeight: '100vh' }}>
            <Navbar expand="lg" className="bg-body-tertiary">
            <Container fluid style={{ backgroundColor: '#007bff', color: 'white' }}>
   <Navbar.Brand>
      <h2 style={{ color: 'white' }}>RentEase</h2>
   </Navbar.Brand>
   <Navbar.Toggle aria-controls="navbarScroll" />
   <Navbar.Collapse id="navbarScroll">
      <Nav
         className="me-auto my-2 my-lg-0"
         style={{ maxHeight: '100px' }}
         navbarScroll
      >
      </Nav>
      <Nav>
      <Link to={'/adminhome'} style={{ color: 'white' }}>Admin</Link>

         <Link to={'/'} style={{ color: 'white' }}>Home</Link>
         <Link to={'/login'} style={{ color: 'white' }}>Login</Link>
         <Link to={'/register'} style={{ color: 'white' }}>Register</Link>
      </Nav>
   </Navbar.Collapse>
</Container>

            </Navbar>

            {/* Carousel with the new background */}
            <div className='home-body'>
               <Carousel activeIndex={index} onSelect={handleSelect}>
                  <Carousel.Item>
                     <img
                        src={p1}
                        alt="First slide"
                     />
                  </Carousel.Item>
                  <Carousel.Item>
                     <img
                        src={p2}
                        alt="Second slide"
                     />
                  </Carousel.Item>
                  <Carousel.Item>
                     <img
                        src={p3}
                        alt="Third slide"
                     />
                  </Carousel.Item>
                  <Carousel.Item>
                     <img
                        src={p4}
                        alt="Fourth slide"
                     />
                  </Carousel.Item>
               </Carousel>
            </div>

            <div className='property-content'>
               <div className='text-center'>
                  <h1 className='m-1 p-5'>All Properties that may you look for</h1>
                  <p style={{ fontSize: 15, fontWeight: 800 }}>
   Want to post your Property? 
   <Link to={'/register'}>
      <Button 
         variant='outline-info' 
         style={{ borderColor: 'black', color: 'black' }}
      >
         Register as Owner
      </Button>
   </Link>
</p>

               </div>

               <Container>
                  <AllPropertiesCards />
               </Container>
            </div>
         </div>
      </>
   )
}

export default Home;
