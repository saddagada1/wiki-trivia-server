import pika, json, os

connection = pika.BlockingConnection(pika.ConnectionParameters(os.environ.get("RABBIT_MQ_HOST")))
channel = connection.channel()

channel.queue_declare(queue=os.environ.get("QUESTIONS_QUEUE"), durable=True)

def publish(message, key, retry):
    global connection;
    global channel;
    
    try:
        channel.basic_publish(
            exchange="",
            routing_key=key,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=pika.DeliveryMode.Persistent
            )
        )
    except Exception as err:
        if retry:
            return err
        else:
            connection = pika.BlockingConnection(pika.ConnectionParameters(os.environ.get("RABBIT_MQ_HOST")))
            channel = connection.channel()
            return publish(message, key, True)