import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import '../styles/auth.css';
import { useNavigate, Navigate } from 'react-router-dom';
import logo from "../assets/logo.png";

// Firebase imports
import { doSignInWithEmailAndPassword, doCreateUserWithEmailAndPassword, doSignInWithGoogle } from "../../../backend/firebase/auth.js";
import { useAuth } from "../../../backend/contexts/authContext/index.jsx";
import { doc, setDoc } from 'firebase/firestore';
import { db } from "../../../backend/firebase/firebase.js";

function AuthPage() {
    const { currentUser, userLoggedIn } = useAuth();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        country_of_origin: "",
        password: "",
        confirmPassword: ""
    });
    const [isLogin, setIsLogin] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const navigate = useNavigate();

    // Handle input changes
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Toggle between sign-up and login forms
    const toggleForm = () => {
        setIsLogin(!isLogin);
        setFormData({
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            country_of_origin: "",
            password: "",
            confirmPassword: ""
        });
    };

    // Handle Sign Up form submission using Firebase
    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            if (formData.password !== formData.confirmPassword) {
                setErrorMessage("Passwords do not match");
                return;
            }
            setIsSigningIn(true);
            // Create user in Firebase Authentication
            const userCredential = await doCreateUserWithEmailAndPassword(formData.email, formData.password);
            const user = userCredential.user;

            // Add the user's additional profile data to Firestore with UID as the document ID
            await setDoc(doc(db, "users", user.uid), {
                userID: user.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                createdAt: new Date().toISOString(),
            });

            alert("Sign up successful!");
            navigate('/home');
        } catch (error) {
            console.error("Sign up failed:", error);
            setErrorMessage(error.message || "Sign up failed");
        } finally {
            setIsSigningIn(false);
        }
    };

    // Handle Sign In form submission using Firebase
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setIsSigningIn(true);
            await doSignInWithEmailAndPassword(formData.email, formData.password);
            alert("Login successful!");
            navigate('/home');
        } catch (error) {
            console.error("Login failed:", error);
            setErrorMessage(error.message || "Login failed");
        } finally {
            setIsSigningIn(false);
        }
    };

    // Handle Google Sign-In using Firebase
    const onGoogleSignIn = async (e) => {
        e.preventDefault();
        try {
            setIsSigningIn(true);
            await doSignInWithGoogle();
            navigate('/home');
        } catch (error) {
            console.error("Google Sign-In failed:", error);
            setErrorMessage(error.message || "Google Sign-In failed");
        } finally {
            setIsSigningIn(false);
        }
    };

    // If the user is logged in, redirect to home
    if (userLoggedIn) {
        return <Navigate to="/home" replace={true} />;
    }


    return (
        <div className="auth-wrapper">
            {userLoggedIn && (<Navigate to={"/home"} replace={true} />)}
            <div className={`auth-container container-lg  ${!isLogin ? 'active' : ''}`}>
                {/* Sign Up Form */}
                <div className={`sign-up ${isLogin ? 'hidden' : ''}`}>
                    <form onSubmit={handleSignup}>
                        <h1 style={{ color: "#921A40" }}>Create Account</h1>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                        />
                        <button className="btn w-100" type="submit">Sign Up</button>
                        <p>Already have an account?</p>
                        <button type="button" onClick={toggleForm} className="btn hidden" id="login-button">Login</button>
                    </form>
                </div>

                {/* Sign In Form */}
                <div className={`sign-in ${isLogin ? '' : 'hidden'}`}>
                    <form onSubmit={handleLogin}>
                        <h1 style={{ color: "#921A40" }}>Sign In</h1>
                        <input
                            type="text"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <button className="btn w-100" type="submit" disabled={isSigningIn}>
                            {isSigningIn ? "Signing In..." : "Sign In"}
                        </button>
                        <button className="btn w-100 google-btn" onClick={onGoogleSignIn} disabled={isSigningIn}>
                            {isSigningIn ? "Signing In with Google..." : "Sign In with Google"}
                        </button>
                        <p>Don&apos;t have an account?</p>
                        <button type="button" onClick={toggleForm} className="btn hidden" id="signup-button">Create Account</button>
                    </form>
                </div>

                {/* Toggle Panels */}
                <div className="toggle-container">
                    <div className="toggle">
                        {/* Toggle Sign In */}
                        <div className="toggle-panel toggle-left">

                            <img src={logo} className="logo"></img>
                            <h1 className="welcome-msg title text-light">Welcome to Nordstella!</h1>
                        </div>
                        {/* Toggle Sign Up */}
                        <div className="toggle-panel toggle-right">

                            <img src={logo} className="logo"></img>
                            <h1 className="welcome-msg title text-light">Welcome back to Nordstella!</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
