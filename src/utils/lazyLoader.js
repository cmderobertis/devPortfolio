// Lazy loader utility for heavy dependencies
export const loadBootstrap = async () => {
  if (typeof window !== 'undefined' && !window.bootstrapLoaded) {
    await Promise.all([
      import('bootstrap/dist/css/bootstrap.min.css'),
      import('bootstrap/dist/js/bootstrap.bundle.min.js')
    ]);
    window.bootstrapLoaded = true;
  }
};

export const loadHeavyComponents = async () => {
  if (typeof window !== 'undefined' && !window.heavyComponentsLoaded) {
    // This will be loaded on demand by components that need it
    window.heavyComponentsLoaded = true;
  }
};

// Load heavy dependencies after critical path
export const initializeLazyLoading = () => {
  if (typeof window !== 'undefined') {
    // Load Bootstrap after initial render
    setTimeout(loadBootstrap, 300);
  }
};