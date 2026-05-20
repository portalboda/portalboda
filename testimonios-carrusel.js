// TESTIMONIOS CARRUSEL - Auto-avance que se detiene al reproducir video
(function() {
  'use strict';
  
  function iniciarTestimoniosCarrusel() {
    const track = document.querySelector('.testimonios-track');
    if (!track || track.children.length === 0) return;
    
    const items = Array.from(track.children);
    const nextBtn = document.querySelector('.testimonios-carousel-wrapper .carousel-next');
    const prevBtn = document.querySelector('.testimonios-carousel-wrapper .carousel-prev');
    const dotsContainer = document.querySelector('.testimonios-dots');
    
    let itemsPerView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    let currentIndex = 0;
    const totalItems = items.length;
    const maxIndex = Math.max(0, totalItems - itemsPerView);
    let autoScrollInterval;
    let isAutoScrolling = true;
    
    // Crear dots
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonios-dot';
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
        resetAutoScroll();
      });
      dotsContainer.appendChild(dot);
    }
    
    const dots = Array.from(dotsContainer.children);
    
    function updateCarousel() {
      const itemWidth = items[0].getBoundingClientRect().width;
      const gap = 20;
      const offset = currentIndex * (itemWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }
    
    function nextSlide() {
      if (currentIndex < maxIndex) {
        currentIndex++;
      } else {
        currentIndex = 0; // Volver al inicio
      }
      updateCarousel();
    }
    
    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    }
    
    function startAutoScroll() {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
      // Auto-avance lento cada 8 segundos
      autoScrollInterval = setInterval(nextSlide, 8000);
      isAutoScrolling = true;
    }
    
    function stopAutoScroll() {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
      isAutoScrolling = false;
    }
    
    function resetAutoScroll() {
      stopAutoScroll();
      startAutoScroll();
    }
    
    // Detectar cuando se reproduce un video
    const iframes = track.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      // Escuchar eventos de YouTube
      iframe.contentWindow.postMessage('{"event":"listening"}', '*');
    });
    
    window.addEventListener('message', (event) => {
      if (event.origin === 'https://www.youtube.com') {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'onStateChange') {
            if (data.info === 1) { // Video playing
              stopAutoScroll();
            } else if (data.info === 2 || data.info === 0) { // Paused or ended
              startAutoScroll();
            }
          }
        } catch (e) {}
      }
    });
    
    // Agregar enablejsapi a iframes
    iframes.forEach(iframe => {
      const src = iframe.src;
      if (src.indexOf('enablejsapi=1') === -1) {
        iframe.src = src + (src.indexOf('?') > -1 ? '&' : '?') + 'enablejsapi=1';
      }
    });
    
    nextBtn.addEventListener('click', () => {
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
        resetAutoScroll();
      }
    });
    
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoScroll();
    });
    
    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newItemsPerView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
        if (newItemsPerView !== itemsPerView) {
          itemsPerView = newItemsPerView;
          currentIndex = 0;
          dotsContainer.innerHTML = '';
          const newMaxIndex = Math.max(0, totalItems - itemsPerView);
          for (let i = 0; i <= newMaxIndex; i++) {
            const dot = document.createElement('button');
            dot.className = 'testimonios-dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
              currentIndex = i;
              updateCarousel();
              resetAutoScroll();
            });
            dotsContainer.appendChild(dot);
          }
          updateCarousel();
        }
      }, 250);
    });
    
    startAutoScroll();
    updateCarousel();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarTestimoniosCarrusel);
  } else {
    iniciarTestimoniosCarrusel();
  }
})();
