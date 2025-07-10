class Logger {
  static error(...args: any[]) {
    if (__DEV__) {
      console.error(...args);
    }
  }

  static warn(...args: any[]) {
    if (__DEV__) {
      console.warn(...args);
    }
  }

  static log(...args: any[]) {
    if (__DEV__) {
      console.log(...args);
    }
  }
}

export { Logger };
