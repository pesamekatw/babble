// Function to convert project title to slug format (matches Decap CMS slug generation)
function titleToSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen
}

// Function to load and display portfolio projects from GitHub
async function loadPortfolio() {
  const masonryContainer = document.getElementById('masonry-portfolio');
  
  // If the container doesn't exist on this page, stop running
  if (!masonryContainer) return;

  const GITHUB_API_URL = 'https://api.github.com/repos/pesamekatw/babble/contents/content/works';

  try {
    const response = await fetch(GITHUB_API_URL);
    
    // If the folder doesn't exist yet
    if (response.status === 404) {
      masonryContainer.innerHTML = '<p class="loading-text">Το portfolio ετοιμάζεται. Προσθέστε το πρώτο έργο από το CMS!</p>';
      return;
    }

    if (!response.ok) throw new Error('API Error');
    
    const files = await response.json();
    masonryContainer.innerHTML = '';

    // Filter only JSON files
    const jsonFiles = files.filter(file => file.name.endsWith('.json'));

    if (jsonFiles.length === 0) {
      masonryContainer.innerHTML = '<p class="loading-text">Δεν βρέθηκαν έργα στον φάκελο content/works.</p>';
      return;
    }

    // Load each project and create masonry item
    for (let index = 0; index < jsonFiles.length; index++) {
      const file = jsonFiles[index];
      const contentRes = await fetch(file.download_url);
      const project = await contentRes.json();

      // Generate slug from title
      const projectSlug = titleToSlug(project.title);

      // Alternate delays for the fade-up animation
      const delayClass = index % 2 === 0 ? 'delay-1' : 'delay-2';

      const item = document.createElement('div');
      item.className = `masonry-item fade-up ${delayClass}`;
      item.style.cursor = 'pointer';
      
      item.innerHTML = `
        <img src="${project.image}" alt="${project.title}">
        <div class="masonry-overlay">
          <h3>${project.title}</h3>
          <p>${project.body || ''}</p>
        </div>
      `;
      
      // Add click handler to navigate to detail page
      item.addEventListener('click', () => {
        window.location.href = `/works/${projectSlug}/`;
      });
      
      masonryContainer.appendChild(item);
    }
  } catch (err) {
    console.error('Λεπτομέρειες σφάλματος:', err);
    masonryContainer.innerHTML = '<p class="loading-text">Σφάλμα σύνδεσης με το GitHub. Βεβαιωθείτε ότι το repo είναι Public.</p>';
  }
}

// Run the function when the page loads
document.addEventListener('DOMContentLoaded', loadPortfolio);