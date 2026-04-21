import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      setVisible(v > 0.02 && v < 0.98);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed top-0 start-0 end-0 h-[3px] z-[9999] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #D4AF37, #f0d060, #b8952a)',
      }}
    />
  );
}
