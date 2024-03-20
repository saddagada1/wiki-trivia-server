import { CSSProperties } from "react";
import { AbsoluteFill, Audio } from "remotion";
import { audioBg } from "../../lib/constants";

interface BackgroundProps {
  bg: CSSProperties;
}

const Background: React.FC<BackgroundProps> = ({ bg }) => {
  return (
    <AbsoluteFill style={bg}>
      <Audio volume={0.3} src={audioBg.url} />
    </AbsoluteFill>
  );
};

export default Background;
