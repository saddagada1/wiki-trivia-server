import logging
import pika, os, json, wikipedia
from flask import Flask, request
from auth import validate, authorize
from lib import rabbit

server = Flask(__name__)

server.logger.setLevel(logging.DEBUG)
    
@server.route("/login", methods=["POST"])
def login():
    auth, err = authorize.login(request)

    if err: 
        return err
    
    return auth

@server.route("/signup", methods=["POST"])
def signup():
    auth, err = authorize.signup(request)

    if err: 
        return err
    
    return auth
    
@server.route("/generate", methods=["POST"])
def generate():
    data = json.loads(request.data)
    topic = data.get("topic", None)

    if not topic:
        return 'no topic', 401
    
    user, err = validate.user(request)

    if err: 
        return err

    try:
        page_query = wikipedia.search(query=topic, results=1)[0]

        page_source = wikipedia.page(title=page_query, auto_suggest=False)

        page = {
            'title': page_source.title,
            'url': page_source.url,
            'content': page_source.content,
            'summary': page_source.summary,
            'images': page_source.images
        }

        message = {
            "user": user,
            "page": page,
            "count": data.get("count", 5)
        }

        connection = rabbit.Connection()
        channel = connection.channel()

        err = rabbit.publish(channel, message, os.environ.get("QUESTIONS_QUEUE"))

        if err: 
            server.logger.error(err)
            return 'failed to publish message', 500
        
        return 'success', 200
    except Exception as err:
        server.logger.error(err)
        return 'wikipedia has never heard of it', 404


if __name__ == "__main__":
    server.run(host="0.0.0.0", port=8080)