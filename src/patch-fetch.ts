if (typeof window !== 'undefined') {
  try {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (desc && !desc.set) {
      Object.defineProperty(window, 'fetch', {
        ...desc,
        set: () => {
          // Ignore overrides to window.fetch
          console.warn('Ignored attempt to set window.fetch');
        }
      });
    }
  } catch (e) {
    console.error('Failed to patch window.fetch', e);
  }
}
export {};
