const token = 'IGAAIkeQMfbehBZAE9LazdEb2tUVFBuQ1ZAjWS13d3N2MXctbkpnbVRjZAmFFeGJfX05VcmlWdDBiQ3lKMS1vY3RyRjhVY1pveWlFZAjk2ZA1NmcTFrS1BjcklWYzZACTE9qWE83QXVpUndtWFp0UlVWMVl2RHkxZA3BRRnRaeVJ5ZAWRvWQZDZD';
const userId = '17841464013121117';
const endpoint = `https://graph.instagram.com/${userId}/media?fields=id,caption,media_url,thumbnail_url,media_type,like_count,comments_count,is_shared_to_feed,permalink&access_token=${token}`;
const profileEndpoint = `https://graph.instagram.com/${userId}?fields=id,username,account_type,media_count,followers_count,profile_picture_url&access_token=${token}`;

let posts = [];
let currentIndex = 0;

async function fetchProfileInfo() {
  try {
    const response = await fetch(profileEndpoint);
    if (!response.ok) throw new Error("Error al obtener la información del perfil");
    const data = await response.json();
    const instagramUrl = `https://www.instagram.com/${data.username}/`;

    document.querySelector('.user-profile-pic a').setAttribute('href', instagramUrl);
    document.querySelector('.user-profile-pic a').setAttribute('title', `${data.username}`);
    document.getElementById('profile-pic').src = data.profile_picture_url || "https://via.placeholder.com/70";                   
    document.getElementById('profile-name').innerText = data.username;
    document.querySelector('.user-info-caption a').setAttribute('href', instagramUrl);
    document.querySelector('.user-info-caption a').setAttribute('title', `${data.username}`);
    document.getElementById('profile-username').innerText = `@${data.username}`;
    document.getElementById('stats-posts-value').innerText = data.media_count || 0;
    document.getElementById('stats-followers-value').innerText = data.followers_count || 0;
    document.getElementById('follow-btn').setAttribute('href', instagramUrl);
  } catch (error) {
    console.error("Error al obtener la información del perfil:", error);
  }
}

async function fetchAllPosts(endpoint, collectedData = []) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    collectedData = [...collectedData, ...data.data];
    
    if (data.paging && data.paging.next) {
      return fetchAllPosts(data.paging.next, collectedData);
    } else {
      return collectedData;
    }
  } catch (error) {
    console.error("Error al obtener todas las publicaciones:", error);
    return collectedData;
  }
}

async function fetchInstagramPosts() {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    posts = await fetchAllPosts(endpoint);
    
    renderPosts();
    displayPost(currentIndex);
    setInterval(nextPost, 150000); // Cambio automático cada 5 segundos
  } catch (error) {
    console.error("Error al obtener los posts:", error);
  }
}

function renderPosts() {
  const carousel = document.getElementById('carousel');
  carousel.innerHTML = posts.map((post, index) => {
    const isVideo = post.media_type === 'VIDEO';
    const isImage = post.media_type === 'IMAGE';
    const isCarousel = post.media_type === 'CAROUSEL_ALBUM';
    const mediaUrl = post.media_url;

    // Usar thumbnail_url para videos
    const thumbnailmediaUrl = isVideo ? post.thumbnail_url : post.media_url;


    // Enlace al post
    const metaUrl = post.permalink;

    
    // Etiquetados (si están disponibles)
    const taggedUsers = post.tagged_users?.map(
      (user) => `<a href="https://www.instagram.com/${user.username}" target="_blank">@${user.username}</a>`
    ).join(', ') || '';

    return `
<div class="post">
        <!-- Fondo desenfocado -->
        <div class="blurred-background" style="background-image: url(${thumbnailmediaUrl});"></div>

        <!-- Contenido multimedia -->
        ${isVideo ? `<video src="${mediaUrl}" autoplay loop muted></video>` : ''}
        ${isImage || isCarousel ? `<img src="${mediaUrl}" alt="Post">` : ''}

        <!-- Tipo de post -->
        <div class="top-row">
          ${isVideo ? '<span class="post-type"><i class="fas fa-video"></i></span>' : ''}
          ${isCarousel ? '<span class="post-type"><i class="fas fa-images"></i></span>' : ''}
        </div>

        <div class="controls">
            <div class="nav-icon left" id="prev-post">
              <i class="fas fa-chevron-left"></i>
            </div>
            <div class="nav-icon right" id="next-post">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>

        <!-- Íconos de interacción -->
        <div class="interaction-icons">

          <div class="icon-group">
            <i class="fa fa-heart-o" aria-hidden="true"></i>
            <span class="icon-text">${post.like_count || "Me gusta"}</span>
          </div>

          <div class="icon-group">
            <i class="fa fa-comment"></i>
            <span class="icon-text">${post.comments_count || 0}</span>
          </div>

          <div class="icon-group">
            <i class="fa fa-share" data-url="${metaUrl}"></i>
          </div>        

        </div>

        <!-- Descripción del Post -->
        <div class="post-info">
          <div class="description">${post.caption || ''}</div>
          <div class="tagged-users">${taggedUsers}</div>
        </div>
        
      </div>
    `;
  }).join('');
}

function displayPost(index) {
  const posts = document.querySelectorAll('.post');
  posts.forEach((post, i) => {
    post.style.display = (i === index) ? 'flex' : 'none';
  });
}

function nextPost() {
  currentIndex = (currentIndex + 1) % posts.length;
  displayPost(currentIndex);
}

function prevPost() {
  currentIndex = (currentIndex - 1 + posts.length) % posts.length;
  displayPost(currentIndex);
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('fa-heart-o')) {
    e.target.classList.toggle('active');
  }

  // Redirigir al post al hacer clic en el ícono de compartir
  if (e.target.classList.contains('fa-share')) {
    const url = e.target.getAttribute('data-url');
    if (url) {
      window.open(url, '_blank'); // Abre en una nueva pestaña
    } else {
      console.error('No URL specified in data-url attribute.');
    }
  }
});


// Listeners para botones de navegación
document.addEventListener('click', (e) => {
    if (e.target.closest('#next-post')) nextPost();
    if (e.target.closest('#prev-post')) prevPost();
});

fetchProfileInfo();
fetchInstagramPosts();

// Actualización automática cada 5 minutos
setInterval(fetchInstagramPosts, 360000);