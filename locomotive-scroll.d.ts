declare module 'locomotive-scroll' {
  export interface LocomotiveScrollOptions {
    el?: HTMLElement;
    smooth?: boolean;
    smoothMobile?: boolean;
    direction?: 'vertical' | 'horizontal';
    inertia?: number;
    class?: string;
    scrollbarContainer?: HTMLElement | false;
    scrollbarClass?: string;
    scrollingClass?: string;
    draggingClass?: string;
    smoothClass?: string;
    initClass?: string;
    getSpeed?: boolean;
    getDirection?: boolean;
    scrollFromAnywhere?: boolean;
    multiplier?: number;
    firefoxMultiplier?: number;
    touchMultiplier?: number;
    resetNativeScroll?: boolean;
    tablet?: {
      smooth?: boolean;
      direction?: 'vertical' | 'horizontal';
      horizontalGesture?: boolean;
      breakpoint?: number;
    };
    smartphone?: {
      smooth?: boolean;
      direction?: 'vertical' | 'horizontal';
      horizontalGesture?: boolean;
      breakpoint?: number;
    };
  }

  export default class LocomotiveScroll {
    constructor(options?: LocomotiveScrollOptions);
    
    init(): void;
    update(): void;
    destroy(): void;
    start(): void;
    stop(): void;
    scrollTo(target: string | number | HTMLElement, options?: any): void;
    setScroll(x: number, y: number): void;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
  }
}