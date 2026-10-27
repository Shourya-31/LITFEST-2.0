import type { CSSProperties } from "react";
import WarpBackground from "./components/ui/WarpBackground";

/* ---------------- Styles (inlined, no external CSS file) ---------------- */
const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Poppins:wght@400;500;600&display=swap");

*{box-sizing:border-box}
html,body{min-height:100%}
body{margin:0;font:16px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#fff;background:#003f66;overflow-x:hidden}

#warp{position:fixed;inset:0;width:100%;height:100%;display:block;z-index:0}

.page{position:relative;z-index:1;width:100%;max-width:1200px;min-height:624px;margin:0 auto}
.page>*{position:absolute;margin:0;overflow:hidden}
.page>.heading{overflow:visible}
.heading{display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;text-shadow:0 2px 24px rgba(0,40,60,.35)}
h1.heading{font-family:'Playfair Display',Georgia,serif;font-weight:600;font-size:clamp(34px,6vw,64px);line-height:1.15;letter-spacing:-.01em;white-space:nowrap}
h2.heading{font-family:'Poppins',system-ui,sans-serif;font-weight:500;font-size:clamp(16px,2.4vw,28px);line-height:1.2;letter-spacing:.14em;text-transform:uppercase}
.image{
  background:linear-gradient(165deg, rgba(2, 28, 58, 0.88) 0%, rgba(1, 15, 34, 0.95) 100%);
  border:1px solid rgba(56, 189, 248, 0.4);
  border-radius:18px;
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  transition:transform .3s ease,background .3s ease,border-color .3s ease,box-shadow .3s ease;
  box-shadow:0 16px 40px rgba(0, 10, 26, 0.6);
}
.image:hover{transform:scale(1.03);background:linear-gradient(165deg, rgba(3, 38, 78, 0.94) 0%, rgba(2, 20, 46, 0.98) 100%);border-color:rgba(125, 211, 252, 0.75);box-shadow:0 20px 50px rgba(0, 12, 28, 0.7), 0 0 30px rgba(56, 189, 248, 0.35)}
img.image{display:block;object-fit:cover}
`;

/* ---------------- Page ---------------- */
interface Sponsor {
  name: string;
  left: string; // percentage string, e.g. "5.333%"
}

const SPONSORS: Sponsor[] = [
  { name: "NIT RAIPUR", left: "5.333%" },
  { name: "SBI BANK", left: "50.667%" },
];

export default function SponsorPage() {
  return (
    <>
      <style>{CSS}</style>
      <WarpBackground />

      <div className="page">
        <h1
          className="heading"
          style={{ left: 0, top: 56, width: "100%", height: 96, zIndex: 1 }}
        >
          Our Sponsors
        </h1>

        {SPONSORS.map((s, i) => {
          const imageStyle: CSSProperties = {
            left: s.left, top: 232, width: "30%", height: 240, zIndex: 2 + i,
          };
          return (
            <div
              key={`img-${s.name}`}
              className="image"
              role="img"
              aria-label={s.name}
              style={imageStyle}
            />
          );
        })}

        {SPONSORS.map((s, i) => {
          const labelStyle: CSSProperties = {
            left: s.left, top: 484, width: "30%", height: 72, zIndex: 4 + i,
          };
          return (
            <h2 key={`label-${s.name}`} className="heading" style={labelStyle}>
              {s.name}
            </h2>
          );
        })}
      </div>
    </>
  );
}