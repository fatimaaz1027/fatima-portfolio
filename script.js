document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Mobile Navigation Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isHidden = navLinks.classList.toggle('hidden');
      menuToggle.setAttribute('aria-expanded', String(!isHidden));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.add('hidden');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Portfolio Filtering
  const filterButtons = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      projectCards.forEach(card => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Image & Video Preview Lightbox Modal
  const modal = document.getElementById('preview-modal');
  const previewCloseBtn = document.getElementById('preview-close');
  const previewElements = document.querySelectorAll('.preview-image, .preview-video');

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    previewElements.forEach(el => {
      el.classList.add('hidden');
      if (el.tagName.toLowerCase() === 'video') {
        el.pause();
      }
    });
  };

  projectCards.forEach(card => {
    card.addEventListener('click', (event) => {
      event.preventDefault();
      const modalId = card.dataset.modal;
      const cardImg = card.querySelector('img');
      let targetElement = modalId ? (document.getElementById(`preview-image-${modalId}`) || document.getElementById(`preview-video-${modalId}`)) : null;

      if (!targetElement && previewElements.length > 0) {
        targetElement = previewElements[0];
      }

      if (modal && targetElement) {
        if (cardImg && cardImg.src && targetElement.tagName.toLowerCase() === 'img') {
          targetElement.src = cardImg.src;
          targetElement.alt = cardImg.alt || 'Portfolio Project Preview';
        }

        previewElements.forEach(el => {
          el.classList.add('hidden');
          if (el.tagName.toLowerCase() === 'video') {
            el.pause();
          }
        });

        targetElement.classList.remove('hidden');

        if (targetElement.tagName.toLowerCase() === 'video') {
          targetElement.currentTime = 0;
          targetElement.play().catch(err => console.log('Preview video play prevented:', err));
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        if (previewCloseBtn) {
          previewCloseBtn.focus();
        }
      }
    });
  });

  if (previewCloseBtn) {
    previewCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.classList.contains('modal-wrapper')) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Resume PDF Download Feature
  const downloadResumeBtn = document.getElementById('download-resume');
  const resumeFeedback = document.getElementById('resume-feedback');

  if (downloadResumeBtn) {
    downloadResumeBtn.addEventListener('click', async (event) => {
      event.preventDefault();

      // Prevent multiple trigger clicks while loading
      if (downloadResumeBtn.classList.contains('is-loading')) return;

      const pdfPath = 'resume/My Resume.pdf';
      const originalText = 'Download Resume';
      const btnSpan = downloadResumeBtn.querySelector('span');
      const btnIcon = downloadResumeBtn.querySelector('i');

      // Clear previous feedback
      if (resumeFeedback) {
        resumeFeedback.classList.add('hidden');
        resumeFeedback.textContent = '';
      }

      // Enter loading state
      downloadResumeBtn.classList.add('is-loading', 'btn-clicking');
      downloadResumeBtn.setAttribute('aria-busy', 'true');

      if (btnSpan) btnSpan.textContent = 'Preparing...';

      if (btnIcon) {
        btnIcon.setAttribute('data-lucide', 'loader-2');
        btnIcon.classList.add('spin-icon');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }

      try {
        // Verify PDF availability if running over HTTP/HTTPS
        if (window.location.protocol.startsWith('http')) {
          const checkResponse = await fetch(pdfPath, { method: 'HEAD' });
          if (!checkResponse.ok) {
            throw new Error(`File unavailable (${checkResponse.status})`);
          }
        }

        // Brief smooth loading transition (400ms)
        await new Promise(resolve => setTimeout(resolve, 400));

        // Create direct download trigger link (forced filename: Resume.pdf, no new tab)
        const link = document.createElement('a');
        link.href = 'resume/My Resume.pdf';
        link.download = 'Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Transition to success state
        downloadResumeBtn.classList.remove('is-loading');
        downloadResumeBtn.classList.add('is-success');
        downloadResumeBtn.setAttribute('aria-busy', 'false');

        if (btnSpan) btnSpan.textContent = 'Downloaded!';

        if (btnIcon) {
          btnIcon.classList.remove('spin-icon');
          btnIcon.setAttribute('data-lucide', 'check');
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // Reset button state after 2.5 seconds
        setTimeout(() => {
          downloadResumeBtn.classList.remove('btn-clicking', 'is-success');
          if (btnSpan) btnSpan.textContent = originalText;
          if (btnIcon) {
            btnIcon.setAttribute('data-lucide', 'download');
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }
        }, 2500);

      } catch (error) {
        console.error('Resume download failed:', error);

        // Reset button loading state
        downloadResumeBtn.classList.remove('is-loading', 'btn-clicking');
        downloadResumeBtn.setAttribute('aria-busy', 'false');

        if (btnSpan) btnSpan.textContent = originalText;

        if (btnIcon) {
          btnIcon.classList.remove('spin-icon');
          btnIcon.setAttribute('data-lucide', 'download');
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // Display user-friendly error message
        const errorMsg = 'Unable to download resume. Please make sure the PDF file exists at resume/My Resume.pdf.';
        if (resumeFeedback) {
          resumeFeedback.textContent = errorMsg;
          resumeFeedback.classList.remove('hidden');
        } else {
          alert(errorMsg);
        }
      }
    });
  }

  // Back to Top Button
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      const homeSection = document.getElementById('home');
      if (homeSection) {
        homeSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
});
