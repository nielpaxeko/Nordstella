import React, { useState } from "react";
import { Form, Button, Image } from "react-bootstrap";
import PropTypes from "prop-types";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase/firebase.js";
import defaultProfilePicture from "../assets/default-profile-picture.jpeg";

const CreateCommentPrompt = ({ postID, user, onCommentAdded }) => {
    const [comment, setComment] = useState("");

    const handleAddComment = async () => {
        if (comment.trim()) {
            try {
                await addDoc(collection(db, "postComments"), {
                    content: comment,
                    postID,
                    parentID: null,
                    userID: user.userID,
                    createdAt: new Date(),
                });
                setComment("");
            } catch (error) {
                console.error("Error adding comment:", error);
            }


            if (onCommentAdded) onCommentAdded();
        }
    };

    return (
        <Form className="create-comment-prompt gap-2 mt-2 mb-2">
            <Image
                className="profile-picture"
                src={user?.profilePicture || defaultProfilePicture}
                roundedCircle
                style={{ minWidth: "45px", height: "45px" }}
            />
            <Form.Control
                className="rounded-5 comment-prompt"
                type="text"
                placeholder="Reply..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <Button
                className="btn btn-pink"
                onClick={handleAddComment}>
                Comment
            </Button>
        </Form>

    );
};

// PropTypes validation
CreateCommentPrompt.propTypes = {
    postID: PropTypes.string.isRequired,
    user: PropTypes.shape({
        userID: PropTypes.string.isRequired,
        profilePicture: PropTypes.string,
        username: PropTypes.string,
    }).isRequired,
    onCommentAdded: PropTypes.func,
};

export default CreateCommentPrompt;