import React, { useEffect, useState } from "react";
import { Modal, Button, Card, Image, Dropdown, NavLink } from "react-bootstrap";
import CreateCommentPrompt from "../prompts/CreateCommentPrompt.jsx";
import defaultProfilePicture from "../assets/default-profile-picture.jpeg";
import { collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase/firebase.js";
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/timeline.css'; // Ensure this path is correct
import Comment from "../components/comment.jsx";

dayjs.extend(relativeTime);

const getTimeAgo = (date) => {
    return dayjs(date).fromNow();
};

const ViewPostModal = ({ show, onHide, post, user }) => {
    const [postAuthor, setPostAuthor] = useState(null);
    const [comments, setComments] = useState([]);
    const [likesCount, setLikesCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const postDate = post.createdAt instanceof Date ? post.createdAt : post.createdAt.toDate();
    const timeAgo = getTimeAgo(postDate);
    const [commentAuthors, setCommentAuthors] = useState({});

    useEffect(() => {
        const fetchCommentAuthors = async () => {
            const fetchedComments = comments.map(async (comment) => {
                const authorDocRef = doc(db, "users", comment.userID);
                const authorDoc = await getDoc(authorDocRef);
                if (authorDoc.exists()) {
                    return authorDoc.data();
                }
            });

            const authors = await Promise.all(fetchedComments);
            setCommentAuthors(authors);
        };

        fetchCommentAuthors();
    }, [comments]);

    useEffect(() => {
        const fetchPostAuthor = async () => {
            if (post.userID) {
                const userDocRef = doc(db, "users", post.userID);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setPostAuthor(userDoc.data());
                }
            }
        };
        fetchPostAuthor();
    }, [post.userID]);

    const fetchComments = async () => {
        const commentsRef = collection(db, "postComments");
        const commentsQuery = query(commentsRef, where("postID", "==", post.id));
        const commentsSnapshot = await getDocs(commentsQuery);
        const fetchedComments = commentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setComments(fetchedComments);
    };

    const handleCommentAdded = () => {
        fetchComments();
    };

    const fetchLikes = async () => {
        const likesRef = collection(db, "postLikes");
        const likesQuery = query(likesRef, where("postID", "==", post.id));
        const likesSnapshot = await getDocs(likesQuery);
        setLikesCount(likesSnapshot.docs.length);

        const userLikeQuery = query(likesRef, where("postID", "==", post.id), where("userID", "==", user.userID));
        const userLikeSnapshot = await getDocs(userLikeQuery);
        setHasLiked(!userLikeSnapshot.empty);
    };

    useEffect(() => {
        fetchLikes();
    }, [post.id, user.userID]);

    useEffect(() => {
        const fetchComments = async () => {
            const commentsRef = collection(db, "postComments");
            const commentsQuery = query(commentsRef, where("postID", "==", post.id));
            const commentsSnapshot = await getDocs(commentsQuery);

            console.log("Comments Query:", commentsQuery);
            console.log("Comments Snapshot:", commentsSnapshot);
            console.log("Comments Length:", commentsSnapshot.docs.length);

            const fetchedComments = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Fetched Comments:", fetchedComments);
            setComments(fetchedComments);
        };
        fetchComments();
    }, [post.id]);



    const handleLikeToggle = async () => {
        const likesRef = collection(db, "postLikes");
        const hasLiked = await hasUserLikedPost(post.id, user.userID);

        if (hasLiked) {
            const likeQuery = query(likesRef, where("postID", "==", post.id), where("userID", "==", user.userID));
            const likeDoc = await getDocs(likeQuery);

            if (!likeDoc.empty) {
                await deleteDoc(likeDoc.docs[0].ref);
                setHasLiked(false);
                fetchLikes(); // Re-fetch likes count
            }
        } else {
            await addDoc(likesRef, { postID: post.id, userID: user.userID });
            setHasLiked(true);
            fetchLikes();
        }
    };

    const hasUserLikedPost = async (postId, userId) => {
        const likesRef = collection(db, "postLikes");
        const likeQuery = query(likesRef, where("postID", "==", postId), where("userID", "==", userId));
        const likeDoc = await getDocs(likeQuery);
        return !likeDoc.empty;
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="view-post-modal">
            <Modal.Header closeButton>
                <Modal.Title>View Post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Card className="post-card border border-dark rounded-2">
                    <Card.Header className="post-header">
                        <div className="d-flex align-items-center">
                            <div className="d-flex align-items-center post-info">
                                <a href={`/profile/${post?.userID}`}>
                                    <Image
                                        className="profile-picture"
                                        src={postAuthor?.profilePicture || defaultProfilePicture}
                                        roundedCircle
                                        style={{ width: "45px", height: "45px" }}
                                    />
                                </a>
                                <div className="post-info ms-2">
                                    <NavLink href={`/profile/${post?.userID}`} className="text-decoration-none text-dark fw-bold">
                                        {postAuthor?.username}
                                    </NavLink>
                                    <div className="secondary text-muted small d-flex gap-1 ">
                                        {timeAgo + " · "}
                                        {post?.privacy === "public" && (
                                            <i className="bi bi-globe-americas post-icon"></i>
                                        )}
                                        {post?.privacy === "friends" && (
                                            <i className="bi bi-people-fill post-icon"></i>
                                        )}
                                        {post?.privacy === "private" && (
                                            <i className="bi bi-lock-fill post-icon"></i>
                                        )}

                                        {post.updatedAt && (
                                            <span className="text-muted updatedDate"> · (Edited)</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text>{post.content}</Card.Text>
                        {post.mediaUrl && (
                            post.mediaType?.startsWith('image') ? (
                                <Image src={post.mediaUrl} alt="Post media" fluid />
                            ) : (
                                <video src={post.mediaUrl} controls className="w-100" />
                            )
                        )}
                    </Card.Body>
                    <Card.Footer className="post-footer">
                        <div className="post-footer-options">
                            <Button
                                className={`social-btn gap-1 rounded-5 ${hasLiked ? 'liked' : ''}`}
                                onClick={handleLikeToggle}
                                style={{ backgroundColor: hasLiked ? '#DC143C' : '', }}
                            >
                                <span className="secondary">{likesCount}</span>
                                <i className="bi bi-hand-thumbs-up-fill post-icon"></i>
                            </Button>
                            <Button className="social-btn gap-1 rounded-5">
                                <span className="post-action">Share</span>
                                <i className="bi bi-send-fill post-icon"></i>
                            </Button>
                        </div>
                        <CreateCommentPrompt
                            postID={post.id}
                            user={user}
                            onCommentAdded={handleCommentAdded}
                        />
                        <div className="comment-section mt-1">
                            <h5>Comment Section: </h5>
                            {comments.length > 0 ? (
                                comments.map((comment, index) => (
                                    <Comment
                                        key={index}
                                        comment={comment}
                                        author={commentAuthors[index]}
                                    />
                                ))
                            ) : (
                                <p>No comments yet.</p>
                            )}
                        </div>
                    </Card.Footer>
                </Card>
            </Modal.Body>
        </Modal>
    );
};
ViewPostModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    post: PropTypes.shape({
        id: PropTypes.string.isRequired,
        userID: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        mediaUrl: PropTypes.string,
        mediaType: PropTypes.string,
        createdAt: PropTypes.object,
        updatedAt: PropTypes.object,
        privacy: PropTypes.string,
    }).isRequired,
    user: PropTypes.object.isRequired
};

export default ViewPostModal;
