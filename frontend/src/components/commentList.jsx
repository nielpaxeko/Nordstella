import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { collection, query, where, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../../backend/firebase/firebase.js";
import Comment from "./comment.jsx";

const CommentsList = ({ postID, user }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchComments = async () => {
            const commentsQuery = query(
                collection(db, "postComments"),
                where("postID", "==", postID),
                where("parentID", "==", null)
            );
            const commentsSnapshot = await getDocs(commentsQuery);
            setComments(commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchComments();
    }, [postID]);

    const handleAddComment = async () => {
        if (newComment.trim()) {
            await addDoc(collection(db, "postComments"), {
                content: newComment,
                postID,
                parentID: null,
                userID: user.userID,
                authorUsername: user.username,
                authorProfilePicture: user.profilePicture,
                createdAt: new Date(),
            });
            setNewComment(""); // Reset input field
        }
    };

    const handleReply = async (replyText, parentID) => {
        if (replyText.trim()) {
            await addDoc(collection(db, "postComments"), {
                content: replyText,
                postID,
                parentID,
                userID: user.userID,
                authorUsername: user.username,
                authorProfilePicture: user.profilePicture,
                createdAt: new Date(),
            });
        }
    };

    return (
        <div className="comments-list">
            <Form>
                <Form.Group>
                    <Form.Control
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" onClick={handleAddComment}>
                    Post Comment
                </Button>
            </Form>

            {comments.slice(0, 2).map(comment => (
                <Comment key={comment.id} comment={comment} user={user} onReply={handleReply} />
            ))}
        </div>
    );
};

CommentsList.propTypes = {
    postID: PropTypes.string.isRequired,
    user: PropTypes.shape({
        userID: PropTypes.string.isRequired,
        profilePicture: PropTypes.string,
        username: PropTypes.string,
    }).isRequired,
};


export default CommentsList;
