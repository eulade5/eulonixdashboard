
const SUPABASE_URL = 'https://ushpbsbvqjtujjoraxzr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHBic2J2cWp0dWpqb3JheHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDU5OTMsImV4cCI6MjA5NTEyMTk5M30.ZVX8cWhTGjeo8_-tftX82RocsiRe5ygDcrzb_P0FsNE';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('projectForm');
const projectsContainer = document.getElementById('projectsContainer');

async function fetchProjects() {
  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  projectsContainer.innerHTML = '';

  data.forEach(project => {
    projectsContainer.innerHTML += `
      <div class="project-card">
        <img src="${project.image_url}" alt="${project.title}">
        <div class="project-content">
          <h4>${project.title}</h4>
          <p>${project.description}</p>
          <small>${project.category}</small>

          <div class="actions">
            <a href="${project.link}" target="_blank">
              <button>Visit</button>
            </a>
            <button class="delete-btn" onclick="deleteProject(${project.id})">Delete</button>
          </div>
        </div>
      </div>
    `;
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;
  const link = document.getElementById('live_url').value;
  const imageFile = document.getElementById('image').files[0];

  const fileName = `${Date.now()}-${imageFile.name}`;

  const { error: uploadError } = await client.storage
    .from('project-images')
    .upload(fileName, imageFile);

  if (uploadError) {
    alert('Image upload failed');
    console.error(uploadError);
    return;
  }

  const { data: publicUrlData } = client.storage
    .from('project-images')
    .getPublicUrl(fileName);

  const image_url = publicUrlData.publicUrl;

  const { error } = await client
    .from('projects')
    .insert([
      {
        title,
        category,
        description,
        live_url,
        image_url
      }
    ]);

  if (error) {
    alert('Failed to save project');
    console.error(error);
    return;
  }

  alert('Project added successfully');
  form.reset();
  fetchProjects();
});

async function deleteProject(id) {
  const confirmed = confirm('Delete this project?');

  if (!confirmed) return;

  const { error } = await client
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(error);
    alert('Failed to delete project');
    return;
  }

  fetchProjects();
}

fetchProjects();
