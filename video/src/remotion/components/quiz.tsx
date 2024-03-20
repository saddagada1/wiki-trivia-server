import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { fps } from "../../lib/constants";
import { Audio } from "remotion";
import { useMemo } from "react";
import { BaseQuestion, QuestionWithMetadata, Quiz as QuizType } from "../../lib/types";
import Question from "./question";
import { loadFont as Belanosima } from "@remotion/google-fonts/Belanosima";
import { useGsapTimeline } from "../../lib/hooks";
import gsap from "gsap";

const { fontFamily: bahiana } = Belanosima();

interface QuizProps {
  quiz: QuizType;
}

const Quiz: React.FC<QuizProps> = ({ quiz }) => {
  const frame = useCurrentFrame();

  const audioWithOffsets = useMemo(() => {
    return quiz.audio.map((a, i) => {
      if (i === 0) return { ...a, offset: 0 };
      const offset = quiz.audio.reduce(
        (prev, curr, index) => (index < i ? prev + curr.duration : prev),
        0
      );
      return { ...a, offset };
    });
  }, []);

  const questionsWithMetadata: QuestionWithMetadata[] = useMemo(() => {
    const audioWithoutIntro = audioWithOffsets.filter((_, i) => i !== 0);
    return quiz.questions.map((q, i) => {
      const offset = audioWithoutIntro[i * 3].offset;
      const answerOffset = audioWithoutIntro[i * 3 + 2].offset;
      const duration =
        audioWithoutIntro[i * 3].duration +
        audioWithoutIntro[i * 3 + 1].duration +
        audioWithoutIntro[i * 3 + 2].duration;
      const question = JSON.parse(q) as BaseQuestion;
      return { ...question, offset, answerOffset, duration };
    });
  }, [audioWithOffsets]);

  const animationScopeRef = useGsapTimeline<HTMLDivElement>(() =>
    gsap
      .timeline()
      .fromTo(".logo", { opacity: 0, y: 100 }, { opacity: 1, y: 0 })
      .fromTo(".topic", { opacity: 0, y: 100 }, { opacity: 1, y: 0 })
      .to(".topic", { opacity: 0 }, 7)
      .to(".logo-container", { top: "0%", translateY: "50%" }, 8)
      .to(
        ".logo-container",
        { top: "50%", translateY: "0%" },
        audioWithOffsets[audioWithOffsets.length - 1].offset
      )
      .to(".topic", { opacity: 1 }, audioWithOffsets[audioWithOffsets.length - 1].offset + 1)
  );

  return (
    <AbsoluteFill>
      {audioWithOffsets.map((a, i) => (
        <Sequence key={i} durationInFrames={a.duration * fps} from={a.offset * fps}>
          <Audio src={a.url} />
        </Sequence>
      ))}
      {questionsWithMetadata.map((q, i) => (
        <Sequence key={i} durationInFrames={q.duration * fps} from={q.offset * fps}>
          <Question question={q} />
        </Sequence>
      ))}
      <AbsoluteFill ref={animationScopeRef}>
        <div className="logo-container">
          <div className="logo card">
            <p style={{ fontFamily: bahiana }} className="logo-text">
              WikiTrivia
            </p>
          </div>
          <div className="topic card">
            {frame > audioWithOffsets[audioWithOffsets.length - 1].offset * fps ? (
              <p className="text">Follow to keep playing!</p>
            ) : (
              <>
                <p className="text">Topic</p>
                <p className="text">{quiz.topic}</p>
              </>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Quiz;
