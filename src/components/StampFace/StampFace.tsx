import type { StampDef } from '../../lib/types';

interface Props {
  def: StampDef;
  fill: string;
  className?: string;
  style?: React.CSSProperties;
}

/** The carved design as an inline SVG (or a CSS mask for PNG stamps). */
export default function StampFace({ def, fill, className, style }: Props) {
  if (def.pngMask) {
    return (
      <div
        className={className}
        aria-hidden
        style={{
          ...style,
          background: fill,
          WebkitMask: `url(${def.pngMask}) center / contain no-repeat`,
          mask: `url(${def.pngMask}) center / contain no-repeat`,
        }}
      />
    );
  }
  return (
    <svg className={className} style={style} viewBox="0 0 100 100" aria-hidden>
      <path d={def.svgPath} fill={fill} fillRule="evenodd" />
    </svg>
  );
}
