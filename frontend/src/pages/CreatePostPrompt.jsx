import { Button } from "react-bootstrap";
import defaultProfilePicture from "../assets/default-profile-picture.jpeg";
import '../styles/timeline.css';
import CreatePostModal from '../modals/CreatePostModal.jsx';
import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from 'prop-types';


function CreatePostPrompt({ user, onAddPost }) {
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);
    const profilePicture = user?.profilePicture || defaultProfilePicture;

    return (
        <div className="create-post-prompt shadow-sm border rounded-5 p-3 bg-white shadow box-area">
            <div className="prompt-info">
                <a className="user-link" href={`/profile/${user?.userID}`} style={{ textDecoration: "none" }}>
                    <img src={profilePicture} alt="Profile pic" className="profile-picture rounded-circle" width={50} height={50} />
                </a>
                <p className="username">
                    What's on your mind{" "} {user.username}?
                </p>
            </div>

            <Button className="rounded-5" onClick={() => setShowCreatePostModal(true)}>
                Create Post
            </Button>

            <CreatePostModal
                show={showCreatePostModal}
                onHide={() => setShowCreatePostModal(false)}
                user={user}
                onAddPost={onAddPost}
            />
        </div>
    );
}
CreatePostPrompt.propTypes = {
    user: PropTypes.object.isRequired,
    onAddPost: PropTypes.func.isRequired,
};
export default CreatePostPrompt;