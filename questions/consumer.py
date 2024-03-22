import pika, sys, os
from pymongo import MongoClient
from lib import gpt

def main():
    client = MongoClient(os.environ.get("MONGO_HOST"), int(os.environ.get("MONGO_PORT")))
    db = client[os.environ.get("MONGO_DB")]
    collection = db[os.environ.get("MONGO_COLLECTION")]

    connection = pika.BlockingConnection(pika.ConnectionParameters(os.environ.get("RABBIT_MQ_HOST")))
    channel = connection.channel()

    channel.queue_declare(queue=os.environ.get("QUESTIONS_QUEUE"), durable=True)
    channel.queue_declare(queue=os.environ.get("NOTIFICATIONS_QUEUE"), durable=True)

    def callback(ch, method, __properties__, body):
        err = gpt.generate(body, collection, ch)

        if err:
            ch.basic_nack(delivery_tag=method.delivery_tag)
            return

        ch.basic_ack(delivery_tag=method.delivery_tag)


    channel.basic_consume(
        queue=os.environ.get("QUESTIONS_QUEUE"),
        on_message_callback=callback
    )

    print("Listening for messages. Press CTRL+C to exit.")

    channel.start_consuming()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Exiting...")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)