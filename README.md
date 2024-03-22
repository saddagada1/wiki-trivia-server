# WikiTrivia

WikiTrivia is a microservice-based automation tool designed to generate trivia questions based on a specified Wikipedia topic and produce a video short of these questions.

## How It Works

WikiTrivia consists of several interconnected services:

- **Flask Server**: Handles the API logic as a gateway.

- **Python Applications**: Each interface with OpenAI and PlayHT respectively to generate questions and audio through TTS.

- **Node.js Server**: Utilized for video generation through the Remotion library.

- **React Application**: Frontend UI.

## Technologies Used

- **MongoDB**: To store trivia quizzes.

- **RabbitMQ**: To facilitate communication between these services.

- **S3**: To store video files.

## Deployment

WikiTrivia is deployed using Minikube and Docker.
