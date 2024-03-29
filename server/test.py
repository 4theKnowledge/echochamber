import openai
import os
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

# Retrieve the API key from environment variables
openai_api_key = os.getenv("OPENAI_API_KEY")

# Define the model to use
MODEL = "gpt-4-turbo-preview"  # Example: "gpt-3.5-turbo" or "gpt-4-turbo-preview" for newer models

DIRECTIVES = {
    "post": {
        "system": "Imagine you're a skilled content creator with the unique ability to distil complex and fascinating topics into concise, Reddit-style posts. Your task is to captivate the Reddit community with posts that are short, sharp, and packed with intrigue while also being sometimes controversial. Each post should offer a compelling nugget of information or an engaging question about a specific topic designed to grab attention and spark lively discussions. While brevity is key, your content must still resonate with readers, offering them a reason to pause, think, and engage. Aim to strike a perfect balance between succinctness and substance, ensuring that each post, no matter how brief, is a gateway to deeper curiosity and conversation. Remember, the goal is to generate a post that feels like a must-read on Reddit, prompting users to upvote, comment, and share, all within a few well-chosen words. You should only return the 'title' and 'body'. Do not add a summary or conclusion after the final comment."
    },
    "discussion": {
        "system": """
        As an AI specialized in simulating Reddit's diverse comment sections, generate a layered dialogue responding to a specific post. Craft comments that vary in perspective, tone, and depth, resembling the dynamic interplay of Reddit's community. Comments should: Offer a mix of support, critique, and personal anecdotes. Range from serious analysis to playful banter. Use questions and counterpoints to foster deeper dialogue. Focus on authentic representation, making each comment feel like it's from a unique user. Your goal is to create a genuine, multi-layered discussion that adds value to the initial post, showcasing the rich, community-driven exchange typical on Reddit. You should use @ symbols to let users refer to one another. The discussion should be user#: "comment", where references are @user#. Do not add a summary or conclusion after the final comment.
        """
    },
}


def generate_content(system_message, user_message, max_tokens=1024, temperature=0.7):
    """
    Generic function to generate content using the OpenAI API.
    """
    response = openai.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_message},
            {
                "role": "user",
                "content": user_message,
            },
        ],
        temperature=temperature,
        max_tokens=max_tokens,
        top_p=1.0,
        frequency_penalty=0.5,
        presence_penalty=0.0,
    )
    return response.choices[0].message.content


def parse_and_save_output(posts_data):
    parsed_posts = []
    for post_data in posts_data:
        topic, sub, post, discussions = post_data

        post_parts = post.replace("*", "").split("Body")
        title = post_parts[0].replace("Title: ", "").replace("\n", "")
        body = post_parts[1].replace(": ", "").replace("\n", "")

        parsed_discussions = []

        for discussion in discussions.split("\n"):
            if discussion.startswith("user"):
                user, comment = discussion.split(":", 1)
                comment = comment.replace('"', "").strip()
                parsed_discussions.append({"user": user, "comment": comment})

        parsed_posts.append(
            {
                "topic": topic,
                "sub": sub,
                "title": title,
                "body": body,
                "discussions": parsed_discussions,
            }
        )

    with open("output.json", "w", encoding="utf-8") as f:
        json.dump(parsed_posts, f, indent=4, ensure_ascii=False)


def main():
    if openai_api_key is None:
        raise ValueError("OPENAI_API_KEY is not set in the environment variables.")
    openai.api_key = openai_api_key

    topics = [
        ("Datsun 1200 ute", "cars"),
        ("black coffee", "coffee"),
        (None, "AskReddit"),
        (None, "ELI5"),
        (None, "Showerthoughts"),
        (None, "IAmA"),
    ]

    posts_data = []

    for topic, sub in topics:
        user_message_for_post = (
            f"Create a post about {topic} in the {sub} subreddit."
            if topic
            else f"Create a random post in the {sub} subreddit."
        )
        post = generate_content(DIRECTIVES["post"]["system"], user_message_for_post)

        user_message_for_discussion = f"Respond to this post: {post}"
        discussions = generate_content(
            DIRECTIVES["discussion"]["system"],
            user_message_for_discussion,
            max_tokens=1024,
            temperature=0.9,
        )

        posts_data.append((topic, sub, post, discussions))

    parse_and_save_output(posts_data)


if __name__ == "__main__":
    main()
