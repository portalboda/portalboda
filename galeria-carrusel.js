// GALERÍA CARRUSEL - No toca nada más del sitio
(function() {
  'use strict';
  
  const galeriaFotos = [
    'postboda-01.jpg', 'postboda-02.jpg', 'postboda-03-bn.jpg', 'postboda-04.jpg',
    'postboda-05.jpg', 'postboda-06-cargada.jpg', 'postboda-07.jpg',
    'postboda-08-editorial.jpg', 'postboda-09-brazos.jpg', 'postboda-10-baile.jpg',
    'postboda-11.jpg', 'postboda-12.jpg', 'postboda-13.jpg', 'postboda-14.jpg',
    'postboda-15.jpg', 'postboda-16.jpg', 'postboda-17.jpg', 'postboda-18.jpg',
    'postboda-19.jpg', 'postboda-20.jpg', 'postboda-21.jpg',
    'vinedo-01.jpg', 'vinedo-02.jpg', 'novio-vinedo.jpg',
    'ceremonia-beso.jpg', 'novia-retrato.jpg',
    'drone-vinedo.jpg', 'drone-ceremonia-01.jpg', 'drone-ceremonia-02.jpg', 'drone-ceremonia-03.jpg',
    'cabina-blanca-flores.webp', 'cabina-blanca-interior.webp', 'cabina-negra.webp', 'cabina-libro.webp',
    'estudio-01.jpg', 'estudio-02.jpg', 'sesion-pareja.webp', 'hero-allison-cristian.jpg'
  ];
  
  function iniciarGaleriaCarrusel() {
    const container = document.querySelector('.galeria-carousel-container');
    if (!container) return;
    
    const track = container.querySelector('.galeria-carousel-track');
    const dotsContainer = document.querySelector('.galeria-carousel-dots');
    const prevBtn = document.querySelector('.galeria-prev');
    const nextBtn = document.querySelector('.galeria-next');
    const playPauseBtn = document.querySelector('.galeria-play-pause');
    
    if (!track) return;
    
    // Crear items
    galeriaFotos.forEach(foto => {
      const item = document.createElement('div');
      item.className = 'galeria-carousel-item';
      item.innerHTML = `<img src="img/${foto}" alt="Galería" loading="lazy">`;
      track.appendChild(item);
    });
    
    // Crear dots
    galeriaFotos.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'galeria-carousel-dot';
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarrusel();
        resetAutoPlay();
      });
      dotsContainer.appendChild(dot);
    });
    
    const items = Array.from(track.children);
    const dots = Array.from(dotsContainer.children);
    let currentIndex = 0;
    let autoPlayInterval;
    let isPlaying = true;
    
    function updateCarrusel() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }
    
    function nextSlide() {
      currentIndex = (currentIndex + 1) % items.length;
      updateCarrusel();
    }
    
    function prevSlide() {
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      updateCarrusel();
    }
    
    function startAutoPlay() {
      if (autoPlayInterval) clearInterval(autoPlayInterval);
      autoPlayInterval = setInterval(nextSlide, 5000);
      isPlaying = true;
      playPauseBtn.classList.remove('paused');
    }
    
    function stopAutoPlay() {
      if (autoPlayInterval) clearInterval(autoPlayInterval);
      isPlaying = false;
      playPauseBtn.classList.add('paused');
    }
    
    function resetAutoPlay() {
      if (isPlaying) {
        stopAutoPlay();
        startAutoPlay();
      }
    }
    
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });
    
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });
    
    playPauseBtn.addEventListener('click', () => {
      isPlaying ? stopAutoPlay() : startAutoPlay();
    });
    
    startAutoPlay();
    updateCarrusel();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarGaleriaCarrusel);
  } else {
    iniciarGaleriaCarrusel();
  }
})();
