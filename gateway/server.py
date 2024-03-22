import logging
import os, json, wikipedia, threading, pika
from flask import Flask, request
from flask_socketio import SocketIO
from flask_pymongo import PyMongo
from flask_cors import CORS
from lib import rabbit

server = Flask(__name__)

server.logger.setLevel(logging.DEBUG)

CORS(server, resources={r"/*": {"origins": os.environ.get("CLIENT_URL"), "supports_credentials": True}})

socketio = SocketIO(server, cors_allowed_origins=os.environ.get("CLIENT_URL"))

server.config['MONGO_URI'] = f"mongodb://{os.environ.get("MONGO_HOST")}:{os.environ.get("MONGO_PORT")}/{os.environ.get("MONGO_DB")}"

mongo = PyMongo(server)
collection = mongo.db[os.environ.get("MONGO_COLLECTION")]

status = "idle"

@server.route("/videos", methods=["GET"])
def get():
    cursor = collection.find({}).sort('_id', -1).limit(10)
    videos = []
    for video in cursor:
        video['_id'] = str(video['_id'])
        videos.append(video)

    videos_json = json.dumps(videos)
    response_data = videos_json.encode('utf-8')
    return {"status": status, "videos": response_data}, 200, {'Content-Type': 'application/json'}
    
@server.route("/generate", methods=["POST"])
def generate():
    if status != "idle":
        return 'server is busy', 503
    
    data = json.loads(request.data)
    topic = data.get("topic", None)

    if not topic:
        return 'no topic', 401
    
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
            "page": page,
            "count": data.get("count", 5)
        }

        err = rabbit.publish(message, os.environ.get("QUESTIONS_QUEUE"), False)

        if err: 
            server.logger.error(err)
            return 'failed to publish message', 500
        
        rabbit.publish({"status": "Got topic from Wikipedia"}, os.environ.get("NOTIFICATIONS_QUEUE"), False)
        
        return 'success', 200
    except Exception as err:
        server.logger.error(err)
        return 'wikipedia has never heard of it', 404
    
def consume_notifications():
    def callback(__ch__, __method__, __properties__, body):
        message = json.loads(body)
        if status == "completed":
            status = "idle"
        else:
            status = message["status"]
        socketio.emit('notification', status)

    try: 
        connection = pika.BlockingConnection(pika.ConnectionParameters(os.environ.get("RABBIT_MQ_HOST")))
        channel = connection.channel()
        channel.queue_declare(queue=os.environ.get("NOTIFICATIONS_QUEUE"), durable=True)

        channel.basic_consume(queue=os.environ.get("NOTIFICATIONS_QUEUE"), on_message_callback=callback, auto_ack=True)

        print('Waiting for notifications from RabbitMQ...')
        channel.start_consuming()
    except Exception as err:
        server.logger.error(err)


if __name__ == "__main__":
    notifications_thread = threading.Thread(target=consume_notifications)
    notifications_thread.daemon = True
    notifications_thread.start()

    server.run(host='0.0.0.0', port=8080)