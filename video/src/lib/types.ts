export interface BaseQuestion {
  question: string;
  options: { id: number; body: string }[];
  answer: number;
}

export interface QuestionWithMetadata {
  question: string;
  options: { id: number; body: string }[];
  answer: number;
  offset: number;
  answerOffset: number;
  duration: number;
}

export interface AudioWithMetadata {
  url: string;
  duration: number;
}

export interface Quiz {
  topic: string;
  userId: number;
  questions: string[];
  audio: AudioWithMetadata[];
}
