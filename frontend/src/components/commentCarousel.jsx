import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { collection, query, where, orderBy, limit, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "../../../backend/firebase/firebase.js";
import Comment from "./comment.jsx";

const CommentCarousel = ({ postID }) => {
    const [comments, setComments] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [commentAuthors, setCommentAuthors] = useState({}); // Store authors by userID

    // Use Firestore's onSnapshot to listen for comment updates
    useEffect(() => {
        const commentsRef = collection(db, "postComments");
        const q = query(commentsRef, where("postID", "==", postID), orderBy("createdAt", "desc"), limit(3));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const fetchedComments = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setComments(fetchedComments);

            // Fetch authors for each comment
            const authorsData = {};
            const authorPromises = fetchedComments.map(async (comment) => {
                if (!commentAuthors[comment.userID]) {
                    const userDoc = await getDoc(doc(db, "users", comment.userID));
                    if (userDoc.exists()) {
                        authorsData[comment.userID] = userDoc.data();
                    }
                }
            });

            // Wait for all author fetches to complete
            await Promise.all(authorPromises);
            setCommentAuthors((prevAuthors) => ({ ...prevAuthors, ...authorsData }));
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, [postID, commentAuthors]); // Include commentAuthors to avoid stale state

    // Handle next and previous navigation
    const handlePrevComment = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? comments.length - 1 : prevIndex - 1));
    };

    const handleNextComment = () => {
        setCurrentIndex((prevIndex) => (prevIndex === comments.length - 1 ? 0 : prevIndex + 1));
    };

    return (
        <div className="comment-carousel m-1">
            {comments.length > 0 ? (
                <div className="comment-display p-1 gap-2">
                    {comments.length > 1 && (
                        <div className="d-flex justify-content-between">
                            <Button className="comment-carousel-btn" variant="light" onClick={handlePrevComment}>
                                <i className="bi bi-chevron-left post-icon"></i>
                            </Button>
                        </div>
                    )}
                    <Comment comment={comments[currentIndex]} author={commentAuthors[comments[currentIndex].userID]} />
                    {comments.length > 1 && (
                        <div className="d-flex justify-content-between">
                            <Button className="comment-carousel-btn" variant="light" onClick={handleNextComment}>
                                <i className="bi bi-chevron-right post-icon"></i>
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-muted text-center m-3">No comments yet. Be the first to comment!</p>
            )}
        </div>
    );
};

CommentCarousel.propTypes = {
    postID: PropTypes.string.isRequired,
};

export default CommentCarousel;
