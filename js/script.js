document.addEventListener('DOMContentLoaded', () => {

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing after animation triggers
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up');
    animatedElements.forEach(el => observer.observe(el));

    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Check if it's not a generic "#" link (like social dummy links)
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - (navbar.offsetHeight - 20), // Adjust for sticky header
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Parallax effect for hero image
    const heroImage = document.querySelector('.hero-image');

    if (heroImage) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;

            heroImage.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
        });
    }
const bubbleHost = document.getElementById('bubble-host');
const bubbleCount = 10;
const images = ['/assets/Bubble Illustration.png', '/assets/Bubble Illustration White.png'];

for (let i = 0; i < bubbleCount; i++) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  
  // Choose a random image from your two options
  const randomImg = images[Math.floor(Math.random() * images.length)];
  
  // Generate random values
  const size = Math.floor(Math.random() * (120 - 40 + 1)) + 40 + 'px'; // 40px to 140px
  const left = Math.floor(Math.random() * 90) + '%';                 // 0% to 100%
  const duration = Math.floor(Math.random() * (24 - 12 + 1)) + 12 + 's';
  const delay = Math.floor(Math.random() * (5 - (-5) + 1)) + (-10) + 's';
  
  // Apply random values as CSS variables
  bubble.style.setProperty('--size', size);
  bubble.style.setProperty('--left', left);
  bubble.style.setProperty('--duration', duration);
  bubble.style.setProperty('--delay', delay);
  
  bubble.innerHTML = `<img src="${randomImg}" alt="Bubble">`;
  bubbleHost.appendChild(bubble);
}

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);

// Force Carousel Reflow when the "Works" tab opens
// Replace your existing workTab toggle listener with this:
const workTab = document.getElementById('work-details');
if (workTab) {
  workTab.addEventListener('toggle', () => {
    if (workTab.open) {
      const carousel = document.getElementById('projectCarousel');
      
      // Force a layout reflow
      carousel.style.display = 'none';
      carousel.offsetHeight; 
      carousel.style.display = 'flex';
      
      // Scroll user to the start of the tab so they see the content
      setTimeout(() => {
        workTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  });
}

const slider = document.querySelector('#projectCarousel');
let isDown = false;
let startX;
let scrollLeft;
let isDragging = false;

// CRITICAL: Stop the browser's default "image dragging" ghost effect
slider.addEventListener('dragstart', (e) => e.preventDefault());

slider.addEventListener('mousedown', (e) => {
  isDown = true;
  isDragging = false; 
  slider.style.cursor = 'grabbing';
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});

// Fix: Listen to the WHOLE WINDOW for the mouseup
// This ensures that even if you release the mouse outside the carousel, it stops dragging
window.addEventListener('mouseup', () => {
  if (!isDown) return;
  isDown = false;
  slider.style.cursor = 'grab';
});

slider.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  
  e.preventDefault(); // Stops the "magnet" text selection
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 2; 
  
  // Threshold to determine if it's a "drag" or a "click"
  if (Math.abs(walk) > 5) {
    isDragging = true;
  }
  
  slider.scrollLeft = scrollLeft - walk;
});

// Click Handling: Ensure links only work if we DIDN'T drag
slider.querySelectorAll('.carousel-item').forEach(link => {
  link.addEventListener('click', (e) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
});

document.querySelectorAll('.image-wrapper').forEach(wrapper => {
  const follower = wrapper.querySelector('.cursor-follower');
  const childImg = wrapper.getAttribute('data-child-src');
  
  if (childImg) {
    follower.style.backgroundImage = `url('${childImg}')`;
  }

  // SHOW when entering
  wrapper.addEventListener('mouseenter', () => {
    follower.style.visibility = 'visible';
    follower.style.opacity = '1';
    follower.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  // MOVE while inside
  wrapper.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    requestAnimationFrame(() => {
      follower.style.left = `${x}px`;
      follower.style.top = `${y}px`;
    });
  });
  
  // HIDE when leaving
  wrapper.addEventListener('mouseleave', () => {
    follower.style.opacity = '0';
    follower.style.transform = 'translate(-50%, -50%) scale(0.5)';
    // Wait for the fade animation to finish before hiding visibility
    setTimeout(() => {
        if(follower.style.opacity === '0') {
            follower.style.visibility = 'hidden';
        }
    }, 300);
  });
});

/// Universal Navigation Fix for Details Tabs
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').substring(1);
    const targetTab = document.getElementById(targetId);

    // Only run this logic if the target is a <details> element
    if (targetTab && targetTab.tagName === 'DETAILS') {
      e.preventDefault();

      // 1. Open the tab
      targetTab.open = true;

      // 2. Close other tabs (Accordion effect)
      document.querySelectorAll('details.menu-item').forEach(other => {
        if (other !== targetTab) other.open = false;
      });

      // 3. Precise Scroll with Header Offset
      setTimeout(() => {
        const headerOffset = 100; // Adjust this based on your header height
        const elementPosition = targetTab.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 50); // Small delay to let the 'open' animation start
    }
  });
});


});
