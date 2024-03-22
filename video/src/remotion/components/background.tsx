import { AbsoluteFill, Audio } from "remotion";
import { audioBg } from "../../lib/constants";

const Background: React.FC = ({}) => {
  return (
    <AbsoluteFill className="background">
      <Audio volume={0.3} src={audioBg.url} />
    </AbsoluteFill>
  );
};

export default Background;
