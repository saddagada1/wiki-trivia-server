import { staticFile } from "remotion";
import { AudioWithMetadata, Quiz } from "./types";

export const sampleQuiz: Quiz = {
  topic: "Brooklyn Nine-Nine",
  userId: 1,
  questions: [
    '{"question": "Which character in Brooklyn Nine-Nine is known for being tough and intimidating, with most of the precinct afraid of them?", "options": [{"id": "1", "body": "Raymond Holt"}, {"id": "2", "body": "Jake Peralta"}, {"id": "3", "body": "Amy Santiago"}, {"id": "4", "body": "Rosa Diaz"}], "answer": "4"}',
    '{"question": "Who becomes the captain of the Nine-Nine in the series finale?",  "options": [{"id": "1", "body": "Jake"}, {"id": "2", "body": "Amy"}, {"id": "3", "body": "Terry"}, {"id": "4", "body": "Raymond Holt"}], "answer": "4"}',
    '{"question": "Who are the two aging, accident-prone detectives in the TV series mentioned in the text?",  "options": [{"id": "1", "body": "Jake Peralta and Charles Boyle"}, {"id": "2", "body": "Deputy Chief Madeline Wuntch and Gina Linetti"}, {"id": "3", "body": "Dirk Blocker and Joel McKinnon Miller"}, {"id": "4", "body": "Michael Hitchcock and Norm Scully"}], "answer": "4"}',
    '{"question": "When did NBC announce that the eighth season of Brooklyn Nine-Nine would be the last?",  "options": [{"id": "1", "body": "February 2019"}, {"id": "2", "body": "November 2020"}, {"id": "3", "body": "June 2020"}, {"id": "4", "body": "February 2021"}], "answer": "4"}',
    '{"question": "Where did the French Canadian adaptation of Brooklyn Nine-Nine, titled Escouade 99, debut?", "options": [{"id": "1", "body": "France"}, {"id": "2", "body": "Quebec City"}, {"id": "3", "body": "Canada"}, {"id": "4", "body": "New York"}], "answer": "2"}',
  ],
  audio: [
    {
      url: "https://peregrine-results.s3.amazonaws.com/pigeon/tA2GVm5VAutCUQrtLC_0.mp3",
      duration: 2,
    },
    {
      url: "https://peregrine-results.s3.amazonaws.com/pigeon/tA2GVm5VAutCUQrtLC_0.mp3",
      duration: 2,
    },
    {
      url: "https://peregrine-results.s3.amazonaws.com/pigeon/tA2GVm5VAutCUQrtLC_0.mp3",
      duration: 2,
    },
    {
      url: "https://peregrine-results.s3.amazonaws.com/pigeon/tA2GVm5VAutCUQrtLC_0.mp3",
      duration: 2,
    },
    {
      url: "https://peregrine-results.s3.amazonaws.com/pigeon/tA2GVm5VAutCUQrtLC_0.mp3",
      duration: 2,
    },
  ],
};

export const audioEffects: AudioWithMetadata[] = [
  {
    url: staticFile("/clock.wav"),
    // duration: 7.304,
    duration: 5.0,
  },
  {
    url: staticFile("/ding.wav"),
    // duration: 2.496,
    duration: 3.0,
  },
];

export const audioIntro: AudioWithMetadata = {
  url: staticFile("/intro.wav"),
  duration: 8.54,
};

export const audioOutro: AudioWithMetadata = {
  url: staticFile("/outro.wav"),
  duration: 4.78,
};

export const audioBg: AudioWithMetadata = {
  url: staticFile("/bg-music.wav"),
  duration: 5.01,
};

export const fps = 30;
