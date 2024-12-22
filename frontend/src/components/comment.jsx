import React from "react";
import { Card, Image, Button, Dropdown, NavLink } from "react-bootstrap";
import PropTypes from "prop-types";
import defaultProfilePicture from "../assets/default-profile-picture.jpeg";
import dayjs from "dayjs"; // For time formatting

const Comment = ({ comment, author }) => {
    const getTimeAgo = (date) => dayjs(date.toDate()).fromNow();

    return (
        <div className="d-flex comment rounded-4">
            {/* Profile Picture */}
            <Image
                src={author?.profilePicture || defaultProfilePicture}
                roundedCircle
                className="profile-picture"
                style={{ width: "40px", height: "40px", marginRight: "10px" }}
            />
            <div className="comment-body">
                {/* Username and Time */}
                <div className="d-flex align-items-center mb-1">
                    <strong style={{ fontSize: "12px", color: "#0f0f0f" }}>
                        {author?.username + " · "}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#606060", marginLeft: "3px" }}>
                        {getTimeAgo(comment.createdAt)}
                    </span>
                    {comment.updatedAt && (
                        <span className="text-muted updatedDate"> · (Edited)</span>
                    )}
                </div>
                {/* Comment Text */}
                <div className="comment-text rounded-4">
                    <p style={{ fontSize: ".75rem", color: "#0f0f0f", margin: 0 }}>
                        {comment.content}
                    </p>
                </div>
            </div>
        </div>
    );
};

Comment.propTypes = {
    comment: PropTypes.shape({
        id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        createdAt: PropTypes.object.isRequired,
        updatedAt: PropTypes.object,
        userID: PropTypes.string.isRequired,
    }).isRequired,
    author: PropTypes.shape({
        username: PropTypes.string.isRequired,
        profilePicture: PropTypes.string,
    }),
};

export default Comment;