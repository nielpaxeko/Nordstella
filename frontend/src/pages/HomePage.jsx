import React, { useState, useEffect } from "react";
import CreatePostPrompt from "./CreatePostPrompt.jsx";
import { Alert } from "react-bootstrap";
import Post from "../components/post.jsx";
import { useAuth } from "../../../backend/contexts/authContext/index.jsx";
import { db } from "../../../backend/firebase/firebase.js";
import { collection, getDocs, getDoc, doc, query, orderBy, deleteDoc, where } from 'firebase/firestore';
import '../styles/timeline.css';

function HomePage() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const { currentUser } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) {
                setError('No user is currently logged in.');
                return;
            }

            try {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setUser(userDoc.data());
                } else {
                    setError('User profile not found.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Error fetching user data. Please try again later.');
            }
        };

        fetchUserData();
    }, [currentUser]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsCollectionRef = collection(db, "posts");
                const postsQuery = query(postsCollectionRef, orderBy('createdAt', 'desc'));
                const postsSnapshot = await getDocs(postsQuery);

                const postsData = postsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPosts(postsData);
            } catch (error) {
                console.error('Error fetching posts:', error);
                setError('Error fetching posts. Please try again later.');
            }
        };

        fetchPosts();
    }, []);

    // Function to handle adding and deleting posts
    const handleAddPost = (newPost) => {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
    };

    const handleDeletePost = async (postId) => {
        try {
            // First, delete all likes for the post
            const likesRef = collection(db, "postLikes");
            const likeQuery = query(likesRef, where("postID", "==", postId));
            const likeDocs = await getDocs(likeQuery);

            // Delete all likes
            const deleteLikesPromises = likeDocs.docs.map(likeDoc => deleteDoc(likeDoc.ref));
            await Promise.all(deleteLikesPromises);

            // Then, delete the post itself
            await deleteDoc(doc(db, "posts", postId));
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
            setSuccess('Post deleted successfully.');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error('Error deleting post:', error);
            setError('Error deleting post. Please try again later.');
            setTimeout(() => setError(null), 3000);
        }
    };

    return (
        <div className="timeline-container container-lg">
            <div className="timeline-config">

                {success && <Alert variant="success">{success}</Alert>}
                {error && <Alert variant="success">{error}</Alert>}
                {user && <CreatePostPrompt user={user} onAddPost={handleAddPost} />}

                <div className="posts-container gap-3 mt-3">
                    {posts.map((post) => (
                        <Post
                            key={post.id}
                            post={post}
                            user={user}
                            onDeletePost={handleDeletePost}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
