import {useEffect} from "react";

/**
 * useScrollReveal Hook
 * Automatically observes elements with the `.iu-reveal` class and adds `.iu-revealed`
 * when they enter the viewport. Supports prefers-reduced-motion check.
 */
export function useScrollReveal(deps: React.DependencyList = []) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      document.querySelectorAll(".iu-reveal").forEach((el) => {
        el.classList.add("iu-revealed");
      });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      // Fallback for older browsers
      document.querySelectorAll(".iu-reveal").forEach((el) => {
        el.classList.add("iu-revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("iu-revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    // Initial pass + small delay to catch dynamically rendered elements
    const elements = document.querySelectorAll(".iu-reveal:not(.iu-revealed)");
    elements.forEach((el) => observer.observe(el));

    const timeout = setTimeout(() => {
      const lateElements = document.querySelectorAll(".iu-reveal:not(.iu-revealed)");
      lateElements.forEach((el) => observer.observe(el));
    }, 150);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, deps);
}

export default useScrollReveal;
