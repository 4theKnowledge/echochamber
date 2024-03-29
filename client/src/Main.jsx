import React, { useEffect, useState } from "react";
import Posts from "./Posts";
import { Grid } from "@mui/material";
import axios from "axios";

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
  });

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

export default Main;
