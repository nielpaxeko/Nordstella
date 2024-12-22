import { Button, Dropdown, Modal, Form, Alert } from "react-bootstrap";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { db, storage } from "../../../backend/firebase/firebase.js";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import '../styles/timeline.css';

const EditPostModal = ({ show, onHide, user, post, onUpdatePost }) => {
    const [content, setContent] = useState(post.content);
    const [privacy, setPrivacy] = useState(post.privacy);
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

    const handleEditPost = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const postRef = doc(db, "posts", post.id);
            const updatedPostData = {
                userID: user.userID,
                content,
                privacy,
                updatedAt: new Date(),
            };

            if (mediaFile) {
                const { mediaUrl, mediaType } = await uploadMedia(mediaFile);
                updatedPostData.mediaUrl = mediaUrl;
                updatedPostData.mediaType = mediaType;
            }

            await updateDoc(postRef, updatedPostData);
            onUpdatePost({ id: post.id, ...updatedPostData }); // Update in local state
            setSuccessMessage('Post updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
            setContent('');
            setMediaFile(null);
            onHide(); // Close modal after successful update
        } catch (error) {
            console.error('Error updating post:', error);
            setErrorMessage('Error updating post. Please try again later.');
            setTimeout(() => setErrorMessage(null), 3000);
        }
    };

    return (
        <Modal show={show} onHide={onHide} className="edit-post-template">
            <Modal.Header closeButton>
                <Modal.Title className="post-modal-title">Edit Post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="post-form" onSubmit={(e) => { e.preventDefault(); handleEditPost(); }}>
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    <Form.Group controlId="content">
                        <Form.Label>Content</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
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

                    {mediaFile && (
                        <p className="text-muted">{mediaFile.type.startsWith('image') ? 'Image selected' : 'Video selected'}</p>
                    )}

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

                    <Button type="submit" className="mt-3">Update Post</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

// Add PropTypes to validate props
EditPostModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    post: PropTypes.object.isRequired,
    onUpdatePost: PropTypes.func.isRequired,
};

export default EditPostModal;
