import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

// Recursive function to render comments and nested replies
const renderComments = (comments) => {
  return (
    <List>
      {comments.map((comment, index) => (
        <ListItem
          key={index}
          style={{ paddingLeft: `${20 * comment.level}px` }}
        >
          <ListItemText primary={comment.user} secondary={comment.comment} />
          {/* Render nested replies if they exist */}
          {comment.replies && renderComments(comment.replies)}
        </ListItem>
      ))}
    </List>
  );
};

const Post = () => {
  const { id: postId } = useParams();
  const [post, setPost] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (loading) {
        const response = await axios.get(
          `http://localhost:8000/posts/${postId}`
        );

        if (response.status === 200) {
          setPost(response.data);
          setLoading(false);
        }
      }
    };
    fetchPost();
  }, [loading]);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Card sx={{ margin: "20px", padding: "20px" }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {post.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {post.body}
        </Typography>
        <Typography variant="subtitle1" gutterBottom component="div">
          Comments
        </Typography>
        {renderComments(
          post.discussions.map((discussion) => ({ ...discussion, level: 0 }))
        )}
      </CardContent>
    </Card>
  );
};

export default Post;
