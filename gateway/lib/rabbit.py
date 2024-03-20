import pika, json, threading, os

class Connection:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._connection = pika.BlockingConnection(pika.ConnectionParameters(os.environ.get("RABBIT_MQ_HOST")))
        return cls._instance

    def channel(self):
        return self._connection.channel()

def publish(channel, message, key):
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
        return err