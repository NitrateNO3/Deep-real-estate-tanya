import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StackCard = {
  id: string | number;
  src: string;
  alt: string;
  title: string;
  description?: string;
};

export type CardStackProps = {
  cards: StackCard[];
  className?: string;
  /** Frame shape. Master plans are wider than they are tall. */
  aspect?: string;
  /**
   * Fires when the front card is clicked rather than dragged. Given the index
   * of that card in `cards`. Omit and the pile stays drag-only.
   */
  onCardOpen?: (index: number) => void;
};

/* Stack geometry. Each card behind the front one steps down, shrinks and dims,
   which is what makes the pile read as depth rather than as a misaligned grid. */
const OFFSET = 10; // % of height each card sits above the one in front
const SCALE_STEP = 0.06;
const DIM_STEP = 0.15;
const SWIPE_THRESHOLD = 50;
const SPRING = { type: 'spring' as const, stiffness: 170, damping: 26 };

/**
 * A draggable pile of cards.
 *
 * Drag the front card up or down to cycle, or use the arrows. The arrows are
 * not a nicety: dragging is invisible to keyboard and assistive tech, and on a
 * page section — unlike a demo — the interaction has to be reachable without a
 * pointer.
 */
export const CardStack = ({
  cards: initialCards,
  className,
  aspect = 'aspect-[4/3]',
  onCardOpen,
}: CardStackProps) => {
  const [cards, setCards] = useState<StackCard[]>(initialCards);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<'up' | 'down' | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const dragY = useMotionValue(0);
  const rotateX = useTransform(dragY, [-200, 0, 200], [15, 0, -15]);

  /* A drag ends in a click event too, so the two have to be told apart or
     every swipe would also open the card. Anything past a few pixels is a
     drag; below that it was a press that happened to wobble. */
  const movedRef = useRef(false);
  const DRAG_SLOP = 4;

  /** The card currently on top, as an index into the caller's own array. */
  const openFront = () => {
    if (movedRef.current || !onCardOpen) return;
    onCardOpen(index);
  };

  const next = () => {
    setCards((prev) => [...prev.slice(1), prev[0]]);
    setIndex((i) => (i + 1) % initialCards.length);
  };
  const prev = () => {
    setCards((p) => [p[p.length - 1], ...p.slice(0, -1)]);
    setIndex((i) => (i - 1 + initialCards.length) % initialCards.length);
  };

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    const { y: offset } = info.offset;
    const { y: velocity } = info.velocity;

    if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 500) {
      const up = offset < 0 || velocity < 0;
      setLeaving(up ? 'up' : 'down');
      window.setTimeout(() => {
        if (up) next();
        else prev();
        setLeaving(null);
      }, 150);
    }
    dragY.set(0);
  };

  return (
    <div className={cn('flex flex-col items-center gap-5', className)}>
      {/* The pile leans up out of its own box, so the container needs headroom
          for the cards behind the front one. */}
      <div className={cn('relative w-full', aspect)} style={{ paddingTop: `${OFFSET * (Math.min(cards.length, 3) - 1)}%` }}>
        <ul className="relative m-0 h-full w-full list-none p-0">
          <AnimatePresence>
            {cards.map((card, i) => {
              const isFront = i === 0;
              return (
                <motion.li
                  key={card.id}
                  className="absolute h-full w-full overflow-hidden rounded-2xl border bg-card shadow-[0_18px_44px_-24px_rgb(0_0_0/0.45)]"
                  style={{
                    // a pile you can open says so with the pointer
                    cursor: isFront ? (onCardOpen ? 'pointer' : 'grab') : 'auto',
                    touchAction: 'none',
                    rotateX: isFront ? rotateX : 0,
                    transformPerspective: 1000,
                  }}
                  animate={{
                    top: `${i * -OFFSET}%`,
                    scale: 1 - i * SCALE_STEP,
                    filter: `brightness(${Math.max(0.85, 1 - i * DIM_STEP)})`,
                    zIndex: cards.length - i,
                    opacity: leaving && isFront ? 0 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  transition={SPRING}
                  drag={isFront ? 'y' : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.7}
                  onPointerDown={() => {
                    movedRef.current = false;
                  }}
                  onDrag={(_, info) => {
                    if (!isFront) return;
                    if (Math.abs(info.offset.y) > DRAG_SLOP) movedRef.current = true;
                    dragY.set(info.offset.y);
                  }}
                  onDragEnd={handleDragEnd}
                  onClick={() => isFront && openFront()}
                  /* Reachable without a pointer: the pile is a list of maps and
                     the front one is a control, so it takes a role, a label and
                     Enter/Space. Dragging is invisible to assistive tech. */
                  role={isFront && onCardOpen ? 'button' : undefined}
                  tabIndex={isFront && onCardOpen ? 0 : undefined}
                  aria-label={isFront && onCardOpen ? `Open ${card.title} full size` : undefined}
                  onKeyDown={(e) => {
                    if (!isFront || !onCardOpen) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCardOpen(index);
                    }
                  }}
                  whileDrag={isFront ? { zIndex: cards.length + 1, cursor: 'grabbing', scale: 1.03 } : {}}
                  onHoverStart={() => isFront && setShowInfo(true)}
                  onHoverEnd={() => setShowInfo(false)}
                >
                  {/* A map is a document — contain, never crop, or the title
                      block and legend go over the edge. */}
                  <img
                    src={card.src}
                    alt={card.alt}
                    draggable={false}
                    className="pointer-events-none h-full w-full select-none bg-muted object-contain p-3"
                  />

                  <motion.div
                    className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.82),transparent)] p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: isFront && showInfo ? 1 : 0,
                      y: isFront && showInfo ? 0 : 20,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-base font-bold text-white">{card.title}</h3>
                    {card.description && (
                      <p className="text-sm text-white/80">{card.description}</p>
                    )}
                  </motion.div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      {/* controls — arrows either side of the position dots */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous map"
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {initialCards.map((c, i) => (
            <span
              key={c.id}
              aria-hidden="true"
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index ? 'w-6 bg-primary' : 'w-1.5 bg-border',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next map"
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
