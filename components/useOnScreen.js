import { useState, useEffect } from 'react';

const useOnScreen = (ref) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting));

    observer.observe(ref.current);

    // remove the observer when the component is unmounted
    return () => observer.disconnect();
  }, []);

  return isIntersecting;
};

export default useOnScreen;