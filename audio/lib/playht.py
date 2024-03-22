import json, os, pika, requests

def generate(message, collection, channel):
    message = json.loads(message)

    questions = message["questions"]
    voice = os.environ.get("PLAYHT_VOICE")

    url = "https://api.play.ht/api/v2/tts"
    headers = {
        "content-type": "application/json",
        "AUTHORIZATION": os.environ.get("PLAYHT_SECRET"),
        "X-USER-ID": os.environ.get("PLAYHT_ID")
    }

    audio = []

    channel.basic_publish(
        exchange="",
        routing_key=os.environ.get("NOTIFICATIONS_QUEUE"),
        body=json.dumps({"status": "Generating audio with PlayHT"}),
        properties=pika.BasicProperties(
            delivery_mode=pika.DeliveryMode.Persistent
        )
    )

    try: 
        for q in questions:
            q = json.loads(q)

            headers["accept"] = "application/json"
            job = requests.post(url, json={
                "text": q["question"],
                "voice": voice,
                "output_format": "mp3",
                "voice_engine": "PlayHT2.0"
            }, headers=headers)

            if not job.status_code == 201:
                raise Exception("could not create audio")
            
            headers["accept"] = "text/event-stream"
            job = job.json()
            
            with requests.get(url + f"/{job["id"]}", headers=headers, stream=True) as response:
                for line in response.iter_lines():
                    if line:
                        line = line.decode("utf-8")
                        data = line.split(" ")[1]
                        try:
                            data = json.loads(data)
                        except:
                            continue
                        if "url" in data and data["stage"] == "complete":
                            audio.append({"url": data["url"], "duration": data["duration"]})
                            break 
        
        quiz = {
            "topic": message["topic"],
            "questions": questions,
            "audio": audio
        }

        channel.basic_publish(
            exchange="",
            routing_key=os.environ.get("VIDEO_QUEUE"),
            body=json.dumps(quiz),
            properties=pika.BasicProperties(
                delivery_mode=pika.DeliveryMode.Persistent
            )
        )

        collection.update_one(message, { "$set": quiz }, upsert=True)
    except Exception as err:
        print(err)