import json, os, pika
from openai import OpenAI

client = OpenAI()

def split_content(string, n):
    size = len(string)
    chunk_size = size // n
    remainder = size % n

    chunks = []
    cursor = 0
    for i in range(n):
        chunk_size = chunk_size + (1 if i < remainder else 0)
        chunks.append(string[cursor:cursor + chunk_size])
        cursor += chunk_size

    return chunks

def generate(message, collection, channel):
    message = json.loads(message)

    content = message["page"]["content"]
    count = message["count"]

    content_chunks = split_content(content, count)

    questions = []

    try:
        for chunk in content_chunks:
            completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages= [
                {
                "role": "system",
                "content":
                    'You are a helpful assistant that generates a trivia question after reading a given piece of text. Respond with one short question and four plausible options/answers, of which only one is correct. Do not reference the text in the question. Provide your answer in JSON structure like this: {"question": "<The quiz question you generate>", "options": [{"id": "1", "body": "<Plausible option 1>"}, {"id": "2", "body": "<Plausible option 2>"}, {"id": "3", "body": "<Plausible option 3>"}, {"id": "4", "body": "<Plausible option 4>"}], "answer": "<The option id for the correct answer>"}',
                },
                {
                "role": "user",
                "content":
                    'Provide one unique question with four plausible options/answers after reading the text delimited with XML tags. <text>James Marshall "Jimi" Hendrix (born Johnny Allen Hendrix; November 27, 1942 - September 18, 1970) was an American guitarist, songwriter and singer. Although his mainstream career spanned only four years, he is widely regarded as the greatest and one of the most influential electric guitarists in the history of popular music, and one of the most celebrated musicians of the 20th century. The Rock and Roll Hall of Fame describes him as "arguably the greatest instrumentalist in the history of rock music." Born in Seattle, Washington, Hendrix began playing guitar at age 15. In 1961, he enlisted in the US Army, but was discharged the following year. Soon afterward, he moved to Clarksville, then Nashville, Tennessee, and began playing gigs on the chitlin circuit, earning a place in the Isley Brothers backing band and later with Little Richard, with whom he continued to work through mid-1965. He then played with Curtis Knight and the Squires before moving to England in late 1966 after bassist Chas Chandler of the Animals became his manager. Within months, Hendrix had earned three UK top ten hits with his band the Jimi Hendrix Experience: "Hey Joe", "Purple Haze", and "The Wind Cries Mary". He achieved fame in the US after his performance at the Monterey Pop Festival in 1967, and in 1968 his third and final studio album, Electric Ladyland, reached number one in the US. The double LP was Hendrixs most commercially successful release and his first and only number one album. The worlds highest-paid rock musician, he headlined the Woodstock Festival in 1969 and the Isle of Wight Festival in 1970 before his accidental death in London from barbiturate-related asphyxia in September 1970.</text>',
                },
                {
                "role": "assistant",
                "content":
                    '{"question": "What year did Jimi Hendrix start playing guitar?",  "options": [{"id": "1", "body": "27"}, {"id": "2", "body": "5"}, {"id": "3", "body": "15"}, {"id": "4", "body": "19"}], "answer": "3"}',
                },
                {
                "role": "user",
                "content": f"Provide one unique question with four plausible options/answers after reading the text delimited with XML tags. <text>{chunk}</text>"
                },
            ],
            temperature=0.8
            );

            questions.append(completion.choices[0].message.content)

        quiz = {
            "topic": message["page"]["title"],
            "userId": message["user"]["id"],
            "questions": questions
        }
    
        channel.basic_publish(
            exchange="",
            routing_key=os.environ.get("AUDIO_QUEUE"),
            body=json.dumps(quiz),
            properties=pika.BasicProperties(
                delivery_mode=pika.DeliveryMode.Persistent
            )
        )
        collection.insert_one(quiz)
    except Exception as err:
        print(err)
        return err

