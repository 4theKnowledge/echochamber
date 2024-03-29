import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Outlet,
} from "react-router-dom";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import moment from "moment";
import HomeIcon from "@mui/icons-material/Home";

const Layout = () => {
  return (
    <Container maxWidth="sm" sx={{ my: 8 }}>
      <Outlet />
    </Container>
  );
};

const Posts = ({ posts }) => {
  return (
    <div>
      {posts.map((post, index) => (
        <Card sx={{ marginBottom: 2 }} variant="outlined">
          <CardContent>
            <Stack direction="column" spacing={1}>
              <Link
                to={`/post/${index}`}
                key={index}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Typography variant="paragraph" gutterBottom fontWeight="bold">
                  {post.title}
                </Typography>
              </Link>
              <Typography variant="caption" color="textSecondary">
                submitted {moment(new Date()).fromNow()} by{" "}
                <strong>{post.username || "Anonymous"}</strong> from{" "}
                <strong>/{post.sub}</strong>
              </Typography>
              <Typography variant="body2" gutterBottom>
                {post.body.substring(0, 250)}
                {post.body.length > 250 && "..."}
              </Typography>
            </Stack>
          </CardContent>
          <CardActions disableSpacing>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ ml: 1 }}
            >
              <Link>
                <Typography variant="caption">Like</Typography>
              </Link>
              <Link>
                <Typography variant="caption">Dislike</Typography>
              </Link>
              <Link
                to={`/post/${index}`}
                key={index}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {post.discussions.length} Comments
                </Typography>
              </Link>
            </Stack>
          </CardActions>
        </Card>
      ))}
    </div>
  );
};

const Main = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (loading) {
        const response = await axios.get("http://localhost:8000/posts");
        if (response.status === 200) {
          setPosts(response.data);
          setLoading(false);
        }
      }
    };
    fetchPosts();
  }, [loading]);

  return (
    <Grid container>
      {/* Header */}
      {/* <Grid item xs={12}></Grid> */}
      {/* Posts */}
      <Grid item xs={12}>
        <Posts posts={posts} />
      </Grid>
    </Grid>
  );
};

const HighlightUserTags = ({ text }) => {
  // Regular expression to find @user tags
  const userTagRegex = /(@\w+)/g;

  // Split the text into an array, capturing @user tags as separate elements
  const parts = text.split(userTagRegex);

  // Map over the array, wrapping @user tags with <strong> and leaving other text unchanged
  const processedText = parts.map((part, index) =>
    userTagRegex.test(part) ? <strong key={index}>{part}</strong> : part
  );

  return <p>{processedText}</p>;
};

const renderComments = (comments) => {
  return (
    <List>
      {comments.map((comment, index) => (
        <ListItem
          key={index}
          style={{ paddingLeft: `${20 * comment.level}px` }}
        >
          <ListItemText
            primary={
              <>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="body2">{comment.user}</Typography>
                  <Link
                    key={index}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    <Typography variant="caption">reply</Typography>
                  </Link>
                </Stack>
              </>
            }
            secondary={HighlightUserTags({ text: comment.comment })}
          />
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
  }, [loading, postId]);

  if (loading || post === null) return <Typography>Loading...</Typography>;

  return (
    <>
      <Box p={2} flexDirection="column" display="flex" gap={1}>
        <Typography
          variant="body1"
          component="div"
          fontWeight="bold"
          gutterBottom
        >
          {post.title}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {post.body}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="caption" color="textSecondary">
            submitted {moment(new Date()).fromNow()} by{" "}
            <strong>{post.username || "Anonymous"}</strong> from{" "}
            <strong>/{post.sub}</strong>
          </Typography>
          <Link
            to="/"
            key={postId}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Chip icon={<HomeIcon />} label={"home"} size="small" clickable />
          </Link>
        </Stack>
      </Box>
      <Divider flexItem />
      <Box p={2}>
        <Typography variant="caption" gutterBottom component="div">
          Comments ({post.discussions.length})
        </Typography>
        <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
          {renderComments(
            post.discussions.map((discussion) => ({ ...discussion, level: 0 }))
          )}
        </Box>
      </Box>
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Updated to use the Outlet component to render nested routes */}
          <Route index element={<Main />} />
          <Route path="post/:id" element={<Post />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
