import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QuestionWithMetadata } from "../../lib/types";
import { fps } from "../../lib/constants";
import { useGsapTimeline } from "../../lib/hooks";
import gsap from "gsap";

interface QuestionProps {
  question: QuestionWithMetadata;
}

const Question: React.FC<QuestionProps> = ({ question }) => {
  const frame = useCurrentFrame();
  const animationScopeRef = useGsapTimeline<HTMLDivElement>(() =>
    gsap
      .timeline()
      .fromTo(".question", { opacity: 0, yPercent: 100 }, { opacity: 1 })
      .to(".question", { yPercent: 0, delay: 2 })
      .fromTo(".answer", { opacity: 0, y: 100 }, { opacity: 1, y: 0, stagger: { each: 0.25 } })
      .to(
        [".question", ".answer"],
        { opacity: 0, scale: 0.9, stagger: { each: 0.1, from: "end" } },
        question.duration - 1
      )
  );

  return (
    <AbsoluteFill
      ref={animationScopeRef}
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: "1.5rem",
        padding: "1.5rem",
        marginTop: "10%",
      }}
    >
      <div
        style={{ display: "flex", gap: "1.5rem", backgroundColor: `rgb(233 213 255 / 0.9)` }}
        className="question card"
      >
        <p className="text">Q:</p>
        <p className="text">{question.question}</p>
      </div>
      {question.options.map((o) => (
        <div
          key={o.id}
          style={{ display: "flex", gap: "1.5rem" }}
          className={`answer card ${
            o.id === question.answer && frame > (question.answerOffset - question.offset) * fps
              ? "highlight-answer"
              : "highlight-wrong-answer"
          } ${!(frame > (question.answerOffset - question.offset) * fps) && "default-answer"}`}
        >
          <p className="text">{o.id}:</p>
          <p className="text">{o.body}</p>
        </div>
      ))}
    </AbsoluteFill>
  );
};
export default Question;
