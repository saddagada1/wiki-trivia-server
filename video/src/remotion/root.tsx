import React, { CSSProperties } from "react";
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
          bg: {
            background: `linear-gradient(238.72deg, #ffb864 0%, #006c4c 100%),
            radial-gradient(100% 224.43% at 0% 0%, #fcc482 0%, #002e74 100%),
            linear-gradient(121.28deg, #ffeab6 0%, #00563c 100%),
            linear-gradient(229.79deg, #7534ff 0%, #248900 94.19%),
            radial-gradient(56.26% 101.79% at 50% 0%, #8f00ff 0%, #493500 100%),
            linear-gradient(65.05deg, #6f0072 0%, #ffd600 100%)`,
            backgroundBlendMode: `overlay, screen, color-burn, hard-light, screen, normal`,
          } as CSSProperties,
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
