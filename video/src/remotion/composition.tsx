import { AbsoluteFill } from "remotion";
import Background from "./components/background";
import Quiz from "./components/quiz";
import { loadFont as Inter } from "@remotion/google-fonts/Inter";
import { Quiz as QuizType } from "../lib/types";
import { CSSProperties } from "react";

const { fontFamily: inter } = Inter();

type CompositionProps = {
  quiz: QuizType;
  bg: CSSProperties;
};

const Composition: React.FC<CompositionProps> = ({ quiz, bg }) => {
  return (
    <AbsoluteFill style={{ fontFamily: inter }}>
      <Background bg={bg} />
      <Quiz quiz={quiz} />
    </AbsoluteFill>
  );
};

export default Composition;
