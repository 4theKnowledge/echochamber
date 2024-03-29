import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Posts = ({ posts }) => {
  return (
    <div>
      {posts.map((post, index) => (
        <Link
          to={`/post/${index}`}
          key={index}
          style={{ textDecoration: "none" }}
        >
          <Card key={index} sx={{ marginBottom: 2 }}>
            <CardContent>
              <Typography variant="h5">{post.title}</Typography>
              <Typography variant="body2">
                {post.body.substring(0, 250)}...
              </Typography>
              {/* Display number of comments */}
              <Typography>Comments: {post.discussions.length}</Typography>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default Posts;
