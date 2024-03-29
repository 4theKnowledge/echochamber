from fastapi import FastAPI, HTTPException
from typing import List, Optional
from pydantic import BaseModel, ValidationError
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# List of origins allowed to make cross-origin requests
origins = ["http://localhost:3000"]

# Add CORSMiddleware to the application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Comment(BaseModel):
    user: str
    comment: str
    replies: Optional[List["Comment"]] = []


class Post(BaseModel):
    topic: Optional[str]
    sub: str
    title: str
    body: str
    discussions: List[Comment]


# Function to load posts from a JSON file
def load_posts_from_json():
    with open("output.json", "r", encoding="utf-8") as file:
        data = json.load(file)
    try:
        return [Post(**item) for item in data]
    except ValidationError as e:
        print(f"Error loading posts: {e}")
        return []  # Return an empty list if there's an error


# Load mock posts_db from JSON file on startup
posts_db = load_posts_from_json()


@app.get("/posts", response_model=List[Post])
async def get_posts():
    return posts_db


@app.get("/posts/{post_id}", response_model=Post)
async def get_post(post_id: int):
    if 0 <= post_id < len(posts_db):
        return posts_db[post_id]
    else:
        raise HTTPException(status_code=404, detail="Post not found")
