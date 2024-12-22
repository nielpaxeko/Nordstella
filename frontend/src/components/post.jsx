import React, { useEffect, useState } from "react";
import { Card, Image, Button, Dropdown, NavLink } from "react-bootstrap";
import defaultProfilePicture from "../assets/default-profile-picture.jpeg";
import PropTypes from "prop-types";
import { db } from "../../../backend/firebase/firebase.js";
import EditPostModal from "../modals/EditPostModal.jsx";
import CreateCommentPrompt from "../prompts/CreateCommentPrompt.jsx";
import CommentCarousel from "./commentCarousel.jsx";
import ViewPostModal from "../modals/ViewPostModal.jsx";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    getDoc,
} from "firebase/firestore";
// This code is for calculating a post's age
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

// Utility function to calculate the post's age
const getTimeAgo = (date) => {
    return dayjs(date).fromNow();
};

// Get the likes of a post
const formatLikesCount = (likesCount) => {
    if (likesCount < 1000) {
        return `${likesCount}`;
    } else if (likesCount < 1000000) {
        return `${(likesCount / 1000).toFixed(1)}K`;
    } else {
        return `${(likesCount / 1000000).toFixed(1)}M`;
    }
};


const Post = ({ post, user, onDeletePost }) => {
    const { content, createdAt, updatedAt } = post;
    const [hasLiked, setHasLiked] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [postAuthor, setPostAuthor] = useState(null);
    // Get time ago string
    const postDate = post.createdAt instanceof Date ? post.createdAt : post.createdAt.toDate();
    const updateDate = post?.createdAt instanceof Date ? post?.createdAt : post?.createdAt.toDate();
    const timeAgo = getTimeAgo(postDate);
    const updatedTimeAgo = getTimeAgo(updateDate);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [showViewPostModal, setShowViewPostModal] = useState(false);

    const toggleComments = () => {
        setShowComments((prev) => !prev);
    };

    useEffect(() => {
        const checkUserLikedPost = async () => {
            const liked = await hasUserLikedPost(post.id, user.userID);
            setHasLiked(liked);
        };

        checkUserLikedPost();
    }, [post.id, user.userID]);

    // This use effect get's the post's data
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

    useEffect(() => {
        const getLikesCount = async () => {
            const likesRef = collection(db, "postLikes");
            const likesQuery = query(likesRef, where("postID", "==", post.id));
            const likesDoc = await getDocs(likesQuery);
            setLikesCount(likesDoc.docs.length);
        };
        getLikesCount();
    }, [post.id]);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            onDeletePost(post.id);
        }
    };

    const handleEditPost = (updatedPost) => {
        setShowEditModal(false);
    };

    const hasUserLikedPost = async (postId, userId) => {
        const likesRef = collection(db, "postLikes");
        const likeQuery = query(likesRef, where("postID", "==", postId), where("userID", "==", userId));
        const likeDoc = await getDocs(likeQuery);
        return !likeDoc.empty;
    };

    const handleLikeToggle = async (postId, userId, setHasLiked) => {
        const likesRef = collection(db, "postLikes");
        const hasLiked = await hasUserLikedPost(postId, userId);

        if (hasLiked) {
            const likeQuery = query(likesRef, where("postID", "==", postId), where("userID", "==", userId));
            const likeDoc = await getDocs(likeQuery);

            if (!likeDoc.empty) {
                await deleteDoc(likeDoc.docs[0].ref);
                setHasLiked(false);
                getLikesCount(); // Re-fetch likes count
            }
        } else {
            await addDoc(likesRef, { postID: postId, userID: userId });
            setHasLiked(true);
            getLikesCount();
        }
    };

    const getLikesCount = async () => {
        const likesRef = collection(db, "postLikes");
        const likesQuery = query(likesRef, where("postID", "==", post.id));
        const likesDoc = await getDocs(likesQuery);
        setLikesCount(likesDoc.docs.length);
    };

    useEffect(() => {
        getLikesCount();
    }, [post.id]);


    // Comments
    const fetchComments = async () => {
        const commentsRef = collection(db, "postComments");
        const commentsQuery = query(commentsRef, where("postID", "==", post.id));
        const commentsSnapshot = await getDocs(commentsQuery);
        const fetchedComments = commentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setComments(fetchedComments);
    };

    useEffect(() => {
        fetchComments();
    }, [post.id]);

    const handleCommentAdded = () => {
        fetchComments();
    };


    return (
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
                    <div className="ms-auto">
                        <Dropdown className="post-dropdown">
                            <Dropdown.Toggle variant="link" className="text-muted">
                                <i className="bi bi-three-dots"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {user.userID === post.userID ? (
                                    <>
                                        <Dropdown.Item onClick={() => setShowEditModal(true)}>
                                            <i className="bi bi-pencil-fill post-icon"></i> Edit Post
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            onClick={handleDelete}
                                            href="#"
                                            className="text-danger"
                                            style={{ backgroundColor: "rgba(255, 0, 0, 0.1)" }}
                                        >
                                            <i className="bi bi-trash3-fill post-icon"></i>  Delete Post
                                        </Dropdown.Item>
                                    </>
                                ) : (
                                    <Dropdown.Item
                                        href="#"
                                        className="text-warning"
                                        style={{ backgroundColor: "rgba(255, 165, 0, 0.1)" }}
                                    >
                                        <i className="bi bi-flag-fill post-icon"></i>  Report Post
                                    </Dropdown.Item>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                <Card.Text className="post-content secondary">{content}</Card.Text>
                {post.mediaUrl && (
                    <div className="post-media">
                        {post.mediaType?.startsWith('image') ? (
                            <Image src={post.mediaUrl} alt="Post media" fluid />
                        ) : (
                            <video src={post.mediaUrl} controls className="w-100" />
                        )}
                    </div>
                )}
            </Card.Body>
            <Card.Footer className="post-footer">
                <div className="post-footer-options">
                    <Button
                        className={`social-btn gap-1 rounded-5 ${hasLiked ? 'liked' : ''}`}
                        onClick={() => handleLikeToggle(post.id, user.userID, setHasLiked)}
                        style={{ backgroundColor: hasLiked ? '#DC143C' : '', }}
                    >
                        <span className="secondary">{formatLikesCount(likesCount)}</span>
                        <i className="bi bi-hand-thumbs-up-fill post-icon"></i>
                    </Button>
                    <Button onClick={() => setShowViewPostModal(true)} className="social-btn gap-1 rounded-5">
                        <span className="post-action">Comments</span>
                        <i className="bi bi-chat-dots-fill post-icon"></i>
                    </Button>
                    <Button className="social-btn gap-1 rounded-5">
                        <span className="post-action">Share</span>
                        <i className="bi bi-send-fill post-icon"></i>
                    </Button>
                </div>
                {/* Create Comment Input */}
                <CreateCommentPrompt
                    postID={post.id}
                    user={user}
                    onCommentAdded={handleCommentAdded}
                />
                <CommentCarousel postID={post.id} />
            </Card.Footer>

            <EditPostModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                user={user}
                post={post}
                onUpdatePost={handleEditPost}
            />
            <ViewPostModal
                show={showViewPostModal}
                onHide={() => setShowViewPostModal(false)}
                post={post}
                user={user}
            />
        </Card>
    );
};

Post.propTypes = {
    onDeletePost: PropTypes.func.isRequired,
    post: PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        userID: PropTypes.string.isRequired,
        createdAt: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.object]).isRequired,
        updatedAt: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.object]),
        mediaUrl: PropTypes.string,
        mediaType: PropTypes.string,
        privacy: PropTypes.string,
    }).isRequired,
    user: PropTypes.shape({
        userID: PropTypes.string.isRequired,
        profilePicture: PropTypes.string,
        username: PropTypes.string.isRequired,
    }).isRequired,
};

export default Post;
