// Lazy Load Non-Critical Resources
(function() {
    'use strict';
    
    // Lazy load images with Intersection Observer
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Preconnect to external domains
    const preconnect = (url) => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    };

    // Add preconnect for external resources
    ['https://cdn.tailwindcss.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com']
        .forEach(preconnect);

    // Load CSS asynchronously
    const loadCSS = (href) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = function() { this.media = 'all'; };
        document.head.appendChild(link);
    };

    // Performance monitoring
    if ('PerformanceObserver' in window) {
        const perfObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP:', entry.renderTime || entry.loadTime);
                }
            });
        });
        
        try {
            perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // LCP not supported
        }
    }

    // Log Core Web Vitals
    if (window.performance && performance.getEntriesByType) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const paintMetrics = performance.getEntriesByType('paint');
                paintMetrics.forEach(metric => {
                    console.log(`${metric.name}: ${metric.startTime}ms`);
                });

                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
                    console.log('Load Complete:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
                }
            }, 0);
        });
    }

    // Install PWA prompt enhancement
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Create custom install button (optional)
        console.log('💡 PWA Install available');
    });

    // Track installation
    window.addEventListener('appinstalled', () => {
        console.log('🎉 PWA installed successfully!');
        deferredPrompt = null;
    });

})();
