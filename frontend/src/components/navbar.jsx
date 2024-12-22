import React, { useState, useEffect } from 'react';
import logo from "../assets/rover.png";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Firebase imports
import { auth } from '../../../backend/firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function NavigationBar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setIsAuthenticated(true);
                setUser(currentUser.displayName || currentUser.email); // You can customize this to use displayName, email, etc.
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Handle user logout with Firebase
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIsAuthenticated(false);
            navigate('/auth');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const currentUser = auth.currentUser

    return (
        <Navbar className="p-2 navbar-dark" collapseOnSelect expand="md">
            <Container fluid className="container-xxl">
                <Navbar.Brand href={isAuthenticated ? "/home" : "/landing"} className="navbar-brand">
                    <img src={logo} alt="brand" width="40" height="40" />
                    <span className="fw-bold text-light">Rover</span>
                </Navbar.Brand>
                <Navbar.Toggle className="navbar-toggler" aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse className="justify-content-end" id="responsive-navbar-nav">
                    <Nav className="navbar-nav">
                        <Nav.Link className="nav-link text-light" href={isAuthenticated ? "/home" : "/landing"}>
                            <i className="nav-icon bi bi-house"></i> Home
                        </Nav.Link>

                        {/* Conditional rendering based on authentication */}
                        {isAuthenticated ? (
                            <>
                                <Nav.Link className="nav-link text-light" href="/messages">
                                    <i className="nav-icon bi bi-chat"></i> Messages
                                </Nav.Link>
                                <Nav.Link className="nav-link text-light" href="/wanderlog">
                                    <i className="nav-icon bi bi-globe-americas"></i> Wanderlog
                                </Nav.Link>
                                {user && (
                                    <Nav.Link className="nav-link text-light" href={`/profile/${currentUser.uid}`}>
                                        <i className="nav-icon bi bi-person-circle"></i> Profile
                                    </Nav.Link>
                                )}
                                <Nav.Link className="nav-link text-light d-md-none" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                                    Log out
                                </Nav.Link>
                            </>
                        ) : (
                            <Nav.Link className="nav-link text-light d-md-none" href="/auth">
                                Login
                            </Nav.Link>
                        )}
                    </Nav>
                    {isAuthenticated ? (
                        <Nav className="ms-2 d-none d-md-inline">
                            <Nav.Link className="btn btn-pink nav-link rounded-pill" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                                Log out
                            </Nav.Link>
                        </Nav>
                    ) : (
                        <Nav className="ms-2 d-none d-md-inline">
                            <Nav.Link className="btn btn-pink nav-link rounded-pill" href="/auth" style={{ cursor: 'pointer' }}>
                                Login
                            </Nav.Link>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;
