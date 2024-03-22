import React from "react";
import { Composition as Remotion } from "remotion";
import Composition from "./composition";
import { audioEffects, audioIntro, audioOutro, fps, sampleQuiz } from "../lib/constants";
import "../index.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Remotion
        id="Trivia"
        component={Composition}
        durationInFrames={60 * fps}
        defaultProps={{
          quiz: sampleQuiz,
        }}
        fps={fps}
        width={720}
        height={1280}
        calculateMetadata={async ({ props }) => {
          const quiz = props.quiz;
          const audio = quiz.audio.flatMap((a, i) => {
            if (i === 0) return [audioIntro, a, ...audioEffects];
            if (i === quiz.audio.length - 1) return [a, ...audioEffects, audioOutro];
            return [a, ...audioEffects];
          });
          const duration = audio.reduce((prev, curr) => prev + curr.duration, 0);
          return {
            durationInFrames: Math.ceil(duration) * fps,
            props: {
              ...props,
              quiz: { ...quiz, audio },
            },
          };
        }}
      />
    </>
  );
};
