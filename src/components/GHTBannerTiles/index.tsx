import React, { useState, useEffect, ReactNode } from "react";
import RGL, { WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import GHTFooter from "../GHTFooter";

const GridLayout = WidthProvider(RGL);

const lumiaColors = [
  "#0099FF",
  "#00BC78",
  "#FFD900",
  "#F7630C",
  "#D83B01",
  "#68217A",
  "#E3008C",
];

const getLumiaColor = () =>
  lumiaColors[Math.floor(Math.random() * lumiaColors.length)];

const getPackedLayout = (
  cols = 12,
  reservedCols: number[] = [5, 6]
): Layout[] => {
  const layout: Layout[] = [];
  const grid = Array.from({ length: 2 }, () => Array(cols).fill(false));
  let id = 0;

  for (let y = 0; y < 2; y++) {
    reservedCols.forEach((col) => (grid[y][col] = true));
  }

  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < cols; ) {
      if (grid[y][x]) {
        x++;
        continue;
      }

      let w = Math.random() > 0.7 && x + 1 < cols && !grid[y][x + 1] ? 2 : 1;
      let h =
        Math.random() > 0.7 &&
        y === 0 &&
        (!grid[1][x] || (w === 2 && !grid[1][x + 1]))
          ? 2
          : 1;

      let canPlace = true;
      for (let dx = 0; dx < w && canPlace; dx++) {
        for (let dy = 0; dy < h; dy++) {
          if (x + dx >= cols || y + dy >= 2 || grid[y + dy][x + dx]) {
            canPlace = false;
          }
        }
      }

      if (!canPlace) {
        x++;
        continue;
      }

      for (let dx = 0; dx < w; dx++) {
        for (let dy = 0; dy < h; dy++) {
          grid[y + dy][x + dx] = true;
        }
      }

      layout.push({ i: `${id++}`, x, y, w, h });
      x += w;
    }
  }

  return layout;
};

type MobileTile = Layout & { color: string };

const generateMobilePackedLayout = (cols = 3, tileCount = 30): MobileTile[] => {
  const layout: MobileTile[] = [];
  const grid: boolean[][] = [];
  let id = 0;
  let y = 0;

  const getCell = (x: number, y: number) => (grid[y] && grid[y][x]) || false;
  const setCell = (x: number, y: number) => {
    if (!grid[y]) grid[y] = [];
    grid[y][x] = true;
  };

  const canPlace = (x: number, y: number, w: number, h: number) => {
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        if (x + dx >= cols || getCell(x + dx, y + dy)) return false;
      }
    }
    return true;
  };

  const place = (x: number, y: number, w: number, h: number) => {
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        setCell(x + dx, y + dy);
      }
    }
  };

  while (layout.length < tileCount) {
    for (let x = 0; x < cols; x++) {
      if (getCell(x, y)) continue;

      const rand = Math.random();
      let w = 1,
        h = 1;

      if (rand > 0.75 && x + 1 < cols && canPlace(x, y, 2, 1)) w = 2;
      else if (rand > 0.5 && canPlace(x, y, 1, 2)) h = 2;
      else if (rand > 0.3 && x + 1 < cols && canPlace(x, y, 2, 2)) w = h = 2;

      if (!canPlace(x, y, w, h)) continue;

      place(x, y, w, h);
      layout.push({ i: `${id++}`, x, y, w, h, color: getLumiaColor() });
    }
    y++;
  }

  return layout;
};

type Props = {
  children: ReactNode;
};

const GHTBannerTiles: React.FC<Props> = ({ children }) => {
  const [mobileLayout, setMobileLayout] = useState<MobileTile[]>([]);
  const [showMobileTiles, setShowMobileTiles] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 640;
      setIsMobile(mobile);
      if (mobile) setMobileLayout(generateMobilePackedLayout(3, 30));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const desktopLayout = getPackedLayout(12, [5, 6]);
  const desktopColors = desktopLayout.map(() => getLumiaColor());
  const TILE_SIZE = 100;

  return (
    <div className="relative min-h-screen flex flex-col">
      {isMobile && showMobileTiles && (
        <div
          className="relative w-full overflow-y-auto z-10"
          style={{ backgroundColor: getLumiaColor() }}
        >
          <div
            className="relative"
            style={{
              width: "100%",
              height:
                Math.max(...mobileLayout.map((t) => t.y + t.h)) * TILE_SIZE,
            }}
          >
            {mobileLayout.map((tile) => (
              <div
                key={tile.i}
                className="absolute flex items-center justify-center font-bold text-white"
                style={{
                  backgroundColor: tile.color,
                  width: `${(100 / 3) * tile.w}%`,
                  height: TILE_SIZE * tile.h,
                  left: `${(100 / 3) * tile.x}%`,
                  top: TILE_SIZE * tile.y,
                }}
              >
                Tile {tile.i}
              </div>
            ))}
          </div>
          <button
            className="fixed bottom-4 right-4 z-20 bg-white text-black rounded-full w-10 h-10 text-xl font-bold shadow-lg"
            onClick={() => setShowMobileTiles(false)}
          >
            ×
          </button>
        </div>
      )}

      {!showMobileTiles && (
        <div className="block md:hidden w-full py-8 flex justify-center items-center text-white font-bold text-2xl bg-black">
          GETHELPTOOLS
        </div>
      )}

      {!isMobile && (
        <div className="relative w-full h-[200px]">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-42 h-42 bg-black text-white font-bold rounded-full flex items-center justify-center z-10 text-1xl">
            GETHELPTOOLS
          </div>
          <GridLayout
            className="layout"
            layout={desktopLayout}
            cols={12}
            rowHeight={100}
            margin={[8, 8]}
            containerPadding={[8, 8]}
            isDraggable={false}
            isResizable={false}
            useCSSTransforms={true}
            style={{ width: "100%", height: "100%" }}
          >
            {desktopLayout.map((item, index) => (
              <div
                key={item.i}
                className="flex items-center justify-center text-white font-bold tile"
                style={{
                  background: desktopColors[index],
                  borderRadius: "6px",
                }}
              >
                <div>Tile {item.i}</div>
              </div>
            ))}
          </GridLayout>
        </div>
      )}

      {(!isMobile || !showMobileTiles) && (
        <>
          <div className="p-4 text-center flex-1">{children}</div>
          <GHTFooter />
        </>
      )}
    </div>
  );
};

export default GHTBannerTiles;
