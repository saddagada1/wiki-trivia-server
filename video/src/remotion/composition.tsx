import { AbsoluteFill } from "remotion";
import Background from "./components/background";
import Quiz from "./components/quiz";
import { loadFont as Mono } from "@remotion/google-fonts/RobotoMono";
import { Quiz as QuizType } from "../lib/types";
import { CSSProperties } from "react";

const { fontFamily: mono } = Mono();

type CompositionProps = {
  quiz: QuizType;
};

const Composition: React.FC<CompositionProps> = ({ quiz }) => {
  return (
    <AbsoluteFill style={{ fontFamily: mono }}>
      <Background />
      <Quiz quiz={quiz} />
    </AbsoluteFill>
  );
};

export default Composition;
