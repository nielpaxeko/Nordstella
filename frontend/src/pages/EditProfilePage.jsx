import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from "../../../backend/firebase/firebase.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/profile.css';

function EditProfilePage() {
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        bio: '',
        country: '',
        profilePicture: '' // Initialize profilePicture in user state
    });

    const [profilePicture, setProfilePicture] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [currentUserUid, setCurrentUserUid] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();
    const storage = getStorage(); // Initialize Firebase Storage

    useEffect(() => {
        // Get the current user's UID
        const currentUser = auth.currentUser;
        if (currentUser) {
            setCurrentUserUid(currentUser.uid);

            // Fetch the user's data from Firestore
            const fetchUserData = async () => {
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        setUser(userDoc.data());
                    } else {
                        setError("User data not found");
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setError('Error fetching user data. Please try again later.');
                }
            };

            fetchUserData();
        } else {
            setError("User is not authenticated.");
        }
    }, [auth.currentUser]);

    // Handle form changes
    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file); 
        const reader = new FileReader();
        reader.onload = (event) => {
            console.log(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        const userConfirmation = window.prompt('Please enter your current password to confirm changes:');
        if (!userConfirmation) return;

        const currentUser = auth.currentUser;

        if (!currentUser) {
            setError('User is not authenticated.');
            return;
        }

        const credential = EmailAuthProvider.credential(currentUser.email, userConfirmation);

        try {
            await reauthenticateWithCredential(currentUser, credential);

            let profilePictureUrl = user.profilePicture || null;

            if (profilePicture) {
                const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
                const snapshot = await uploadBytes(storageRef, profilePicture);
                profilePictureUrl = await getDownloadURL(snapshot.ref);
                console.log('Profile picture uploaded, download URL:', profilePictureUrl);
            }

            // Update user data in Firestore
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                bio: user.bio,
                country: user.country,
                profilePicture: profilePictureUrl
            });

            // Optionally update password
            if (newPassword) {
                await updatePassword(currentUser, newPassword);
                setMessage('Profile and password updated successfully');
            } else {
                setMessage('Profile updated successfully');
            }

        } catch (error) {
            setError(error.message || 'Error updating profile');
            console.error('Error updating profile:', error);
        }
    };

    // Redirect to profile page if the user is not authorized
    if (!currentUserUid) {
        return <Alert variant="danger" className='text-center'>You are not authorized to edit this profile.</Alert>;
    }

    return (
        <Container className="edit-profile-container">
            <h2>Edit Profile For User: {user.username}</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <Form className='mt-4' onSubmit={handleSubmit} encType="multipart/form-data">
                <Form.Group className="edit-form" controlId="formProfilePicture">
                    <Form.Label>Profile Picture</Form.Label>
                    <Form.Control
                        type="file"
                        name="profilePicture"
                        onChange={handleFileChange}
                    />
                </Form.Group>

                <Form.Group className="edit-form" controlId="formFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="firstName"
                        value={user.firstName}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="edit-form" controlId="formLastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="lastName"
                        value={user.lastName}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="edit-form" controlId="formUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        name="username"
                        value={user.username}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="edit-form" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="edit-form" controlId="formNewPassword">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="edit-form" controlId="formBio">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="bio"
                        value={user.bio || ""}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="edit-form" controlId="formCountry">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                        type="text"
                        name="country"
                        value={user.country || ""}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Button type="submit">
                    Save Changes
                </Button>
            </Form>
        </Container>
    );
}

export default EditProfilePage;
