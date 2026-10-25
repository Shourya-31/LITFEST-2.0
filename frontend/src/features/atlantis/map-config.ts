import { ATLANTIS_LEVELS } from "./levels.js";

export const MAP_WIDTH = 360;
export const MAP_HEIGHT = 2200;
const locations = [[180,205],[267,365],[180,525],[88,750],[180,915],
  [267,1080],[180,1310],[88,1480],[263,1650],[180,1950]] as const;
/** These same coordinates position both SVG curves and HTML touch targets. */
export const MAP_NODES = ATLANTIS_LEVELS.map((level,index) => ({...level,x:locations[index][0],y:locations[index][1]}));
const coordinate = (n: number) => Number(n.toFixed(2));
export const MAP_SEGMENTS = MAP_NODES.slice(0,-1).map((point,index) => {
  const before = MAP_NODES[Math.max(0,index - 1)], next = MAP_NODES[index + 1], after = MAP_NODES[Math.min(9,index + 2)];
  // Catmull–Rom tangents expressed as cubic Bézier handles preserve continuous curves.
  const c1 = {x:coordinate(point.x + (next.x - before.x) / 6),y:coordinate(point.y + (next.y - before.y) / 6)};
  const c2 = {x:coordinate(next.x - (after.x - point.x) / 6),y:coordinate(next.y - (after.y - point.y) / 6)};
  return {from:point.id,to:next.id,start:point,end:next,c1,c2,
    d:`M ${point.x} ${point.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${next.x} ${next.y}`};
});
export const MAP_ZONES = [
  {name:"The Shallow Ruins",label:"I · WHERE SUNLIGHT LINGERS",y:62},
  {name:"The Forgotten City",label:"II · STORIES BENEATH THE TIDE",y:640},
  {name:"The Abyssal Temples",label:"III · INTO THE QUIET DARK",y:1200},
  {name:"The Heart of Atlantis",label:"IV · THE LAST LIGHT",y:1790},
] as const;
