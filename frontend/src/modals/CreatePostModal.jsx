import { Button, Dropdown, Modal, Form, Alert } from "react-bootstrap";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { db, storage } from "../../../backend/firebase/firebase.js";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import '../styles/timeline.css';

const CreatePostModal = ({ show, onHide, user, onAddPost }) => {
    const [content, setContent] = useState('');
    const [privacy, setPrivacy] = useState('public');
    const [mediaFile, setMediaFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
        }
    };

    const uploadMedia = async (file) => {
        const storageRef = ref(storage, `posts/${user.userID}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return { mediaUrl: downloadURL, mediaType: file.type };
    };

    const handleCreatePost = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const postData = {
                userID: user.userID,
                content,
                privacy,
                createdAt: new Date(),
            };

            if (mediaFile) {
                const { mediaUrl, mediaType } = await uploadMedia(mediaFile);
                postData.mediaUrl = mediaUrl;
                postData.mediaType = mediaType;
            }

            const postsCollectionRef = collection(db, "posts");
            const docRef = await addDoc(postsCollectionRef, postData);
            // Refresh HomePage:
            const newPost = { id: docRef.id, ...postData };
            onAddPost(newPost);
            setSuccessMessage('Post created successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
            setContent('');
            setMediaFile(null);
        } catch (error) {
            console.error('Error creating post:', error);
            setErrorMessage('Error creating post. Please try again later.');
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    return (
        <Modal show={show} onHide={onHide} className="create-post-template">
            <Modal.Header closeButton>
                <Modal.Title className="post-modal-title">
                    Create Post
                    <Dropdown onSelect={(e) => setPrivacy(e)} style={{ marginLeft: "10px" }}>
                        <Dropdown.Toggle variant="light" id="dropdown-basic">
                            {privacy.charAt(0).toUpperCase() + privacy.slice(1)}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item eventKey="public">Public</Dropdown.Item>
                            <Dropdown.Item eventKey="private">Private</Dropdown.Item>
                            <Dropdown.Item eventKey="friends">Friends</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="post-form" onSubmit={(e) => { e.preventDefault(); handleCreatePost(); }}>
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    <Form.Group controlId="content">
                        <Form.Label>Content</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="postMedia">
                        <Form.Label>Choose Image or Video</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleMediaChange}
                        />
                    </Form.Group>

                    {/* Preview media file if available */}
                    {mediaFile && (
                        <p className="text-muted">{mediaFile.type.startsWith('image') ? 'Image selected' : 'Video selected'}</p>
                    )}

                    {/* Actual Media Preview */}
                    {mediaFile && mediaFile.type.startsWith('image') && (
                        <img
                            src={URL.createObjectURL(mediaFile)}
                            alt="Preview"
                            className="prompt-media"
                        />
                    )}

                    {mediaFile && mediaFile.type.startsWith('video') && (
                        <video
                            controls
                            src={URL.createObjectURL(mediaFile)}
                            className="prompt-media"
                        />
                    )}

                    <Button type="submit" className="mt-3">Create Post</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

// Add PropTypes to validate props
CreatePostModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    onAddPost: PropTypes.func.isRequired,
};
export default CreatePostModal;