export const fadeInUp = {
  initial: { y: 16, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4 }
  },
  exit: {
    y: 16,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const fadeOutUp = {
  initial: { y: 0, opacity: 1 },
  animate: {
    y: -16,
    opacity: 0,
    transition: { duration: 0.4 }
  },
  exit: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

export const fadeInDown = {
  initial: { y: -16, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4 }
  },
  exit: {
    y: -16,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const fadeOutDown = {
  initial: { y: 0, opacity: 1 },
  animate: {
    y: 16,
    opacity: 0,
    transition: { duration: 0.4 }
  },
  exit: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

export const fadeInLeft = {
  initial: { x: -16, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4 }
  },
  exit: {
    x: -16,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const fadeOutLeft = {
  initial: { x: 0, opacity: 1 },
  animate: {
    x: -16,
    opacity: 0,
    transition: { duration: 0.4 }
  },
  exit: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

export const fadeInRight = {
  initial: { x: 16, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4 }
  },
  exit: {
    x: 16,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const fadeOutRight = {
  initial: { x: 0, opacity: 1 },
  animate: {
    x: 16,
    opacity: 0,
    transition: { duration: 0.4 }
  },
  exit: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

export const scaleIn = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4 }
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const scaleOut = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.4 }
  },
  exit: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

