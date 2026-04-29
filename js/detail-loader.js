// Function to convert slug back to potential titles (for finding JSON file)
// Since we don't have a database of exact slugs, we fetch all files and search
async function loadProjectDetail() {
  const projectContainer = document.getElementById('project-detail');
  const galleryContainer = document.getElementById('gallery-container');
  
  if (!projectContainer || !galleryContainer) return;

  // Extract project slug from URL pathname (e.g., /works/pnoe-running-club/ -> pnoe-running-club)
  const pathParts = window.location.pathname.split('/').filter(p => p);
  const projectSlug = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];

  const GITHUB_API_URL = 'https://api.github.com/repos/pesamekatw/babble/contents/content/works';

  try {
    // Fetch all project files
    const response = await fetch(GITHUB_API_URL);
    
    if (!response.ok) throw new Error('Could not fetch projects list');
    
    const files = await response.json();
    const jsonFiles = files.filter(file => file.name.endsWith('.json'));

    // Search for the matching project by comparing slugs
    let projectFile = null;
    let project = null;

    for (const file of jsonFiles) {
      const contentRes = await fetch(file.download_url);
      const data = await contentRes.json();
      
      // Generate slug from the project title and compare
      const fileSlug = slugify(data.title);
      
      if (fileSlug === projectSlug) {
        project = data;
        projectFile = file;
        break;
      }
    }

    if (!project) {
      projectContainer.innerHTML = '<p style="text-align: center; width: 100%; padding: 50px;">Το έργο δεν βρέθηκε.</p>';
      return;
    }

    // Render project detail
    renderProjectDetail(project, galleryContainer, projectContainer);

  } catch (err) {
    console.error('Error loading project detail:', err);
    projectContainer.innerHTML = '<p style="text-align: center; width: 100%; padding: 50px;">Σφάλμα κατά τη φόρτωση του έργου.</p>';
  }
}

// Helper function to generate slug from title (must match script.js version)
function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
}

// Function to render the project details and gallery
function renderProjectDetail(project, galleryContainer, projectContainer) {
  // Clear containers
  galleryContainer.innerHTML = '';
  projectContainer.innerHTML = '';

  // Create gallery: use gallery array if available, otherwise just use featured image
  const images = project.gallery && project.gallery.length > 0 
    ? project.gallery.map(item => item.photo)
    : [project.image];

  // Create gallery grid or carousel
  createGalleryDisplay(images, galleryContainer);

  // Create project info section
  const projectInfo = document.createElement('div');
  projectInfo.className = 'project-info';
  projectInfo.innerHTML = `
    <h1>${project.title}</h1>
    <p class="project-date">${new Date(project.date).toLocaleDateString('el-GR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
    <div class="project-description">
      ${project.body || 'Δεν υπάρχει περιγραφή για αυτό το έργο.'}
    </div>
    <a href="/" class="btn-secondary">← Επιστροφή στο Portfolio</a>
  `;

  projectContainer.appendChild(projectInfo);
}

// Function to create gallery display (grid with lightbox)
function createGalleryDisplay(images, container) {
  const gallery = document.createElement('div');
  gallery.className = 'gallery-grid';

  images.forEach((imageUrl, index) => {
    const imageItem = document.createElement('div');
    imageItem.className = 'gallery-item fade-up';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = `Project image ${index + 1}`;
    img.style.cursor = 'pointer';
    
    // Add click handler for lightbox
    img.addEventListener('click', () => {
      openLightbox(imageUrl);
    });
    
    imageItem.appendChild(img);
    gallery.appendChild(imageItem);
  });

  container.appendChild(gallery);
}

// Simple lightbox implementation
function openLightbox(imageUrl) {
  // Check if lightbox already exists
  let lightbox = document.getElementById('lightbox');
  
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <span class="lightbox-close">&times;</span>
      <img class="lightbox-image" src="" alt="Enlarged image">
      <span class="lightbox-prev">&#10094;</span>
      <span class="lightbox-next">&#10095;</span>
    `;
    document.body.appendChild(lightbox);
    
    // Close button
    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    
    // Click outside image to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  
  // Set image and show lightbox
  document.querySelector('.lightbox-image').src = imageUrl;
  lightbox.style.display = 'block';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) lightbox.style.display = 'none';
}

// Run on page load
document.addEventListener('DOMContentLoaded', loadProjectDetail);

// Close lightbox with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
