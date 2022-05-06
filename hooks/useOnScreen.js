import { useState, useEffect } from 'react';

/**
 * Observes the position of the provided ref on the screen.
 *
 * @param {React.Ref} ref - the ref to observe
 * @returns {[boolean, string]} whether the ref is on the screen and the position
 */
const useOnScreen = (ref) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const [position, setPosition] = useState(false);

  useEffect(() => {
    if (!ref.current) { return; }

    const observer = new IntersectionObserver(([entry]) => {
      setPosition(entry.intersectionRect.y < entry.boundingClientRect.y ? 'below' : 'above');
      setIntersecting(entry.isIntersecting);
    });

    observer.observe(ref.current);

    // remove the observer when the component is unmounted
    return () => observer.disconnect();
  }, []);

  return [isIntersecting, position];
};

export default useOnScreen;