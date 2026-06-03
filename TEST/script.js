// Variables globales
let currentAnime = [];
let currentTab = 'popular';

// Éléments DOM
const animeGrid = document.getElementById('animeGrid');
const upcomingGrid = document.getElementById('upcomingGrid');
const seasonalGrid = document.getElementById('seasonalGrid');
const classicGrid = document.getElementById('classicGrid');
const randomAnimeCard = document.getElementById('randomAnimeCard');
const animeDetails = document.getElementById('animeDetails');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const closeDetails = document.getElementById('closeDetails');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const randomAnimeBtn = document.getElementById('randomAnimeBtn');
const loadRandomAnimeBtn = document.getElementById('loadRandomAnime');
const refreshPopularBtn = document.getElementById('refreshPopular');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadPopularAnime();
    loadUpcomingAnime();
    loadSeasonalAnime();
    loadClassicAnime();
    setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Navigation par onglets
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });

    // Recherche
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Fermer les détails
    closeDetails.addEventListener('click', () => {
        animeDetails.style.display = 'none';
    });
    
    // Fermer les détails en cliquant à l'extérieur
    animeDetails.addEventListener('click', (e) => {
        if (e.target === animeDetails) {
            animeDetails.style.display = 'none';
        }
    });

    // Boutons aléatoires
    randomAnimeBtn.addEventListener('click', loadRandomAnime);
    loadRandomAnimeBtn.addEventListener('click', loadRandomAnime);

    // Rafraîchir les populaires
    refreshPopularBtn.addEventListener('click', loadPopularAnime);

    // Navigation footer
    document.querySelectorAll('.footer-links a[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            switchTab(tab);
        });
    });
}

// Changer d'onglet
function switchTab(tabName) {
    // Mettre à jour la navigation
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });

    // Masquer tous les contenus
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Afficher le contenu sélectionné
    document.getElementById(`${tabName}-tab`).classList.add('active');
    currentTab = tabName;

    // Charger le contenu si nécessaire
    if (tabName === 'random' && !document.getElementById('randomAnimeImage').src) {
        loadRandomAnime();
    }
}

// Charger les anime populaires
async function loadPopularAnime() {
    try {
        animeGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Chargement des anime...</div>';
        
        const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=16');
        
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        
        const data = await response.json();
        
        currentAnime = data.data;
        displayAnime(currentAnime, animeGrid);
    } catch (error) {
        console.error('Erreur lors du chargement des anime:', error);
        animeGrid.innerHTML = '<div class="loading">Erreur de chargement. Veuillez réessayer.</div>';
    }
}

// Charger les prochaines sorties
async function loadUpcomingAnime() {
    try {
        upcomingGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Chargement des prochaines sorties...</div>';
        
        const response = await fetch('https://api.jikan.moe/v4/seasons/upcoming?limit=12');
        
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        
        const data = await response.json();
        
        displayAnime(data.data, upcomingGrid);
    } catch (error) {
        console.error('Erreur lors du chargement des prochaines sorties:', error);
        upcomingGrid.innerHTML = '<div class="loading">Erreur de chargement. Veuillez réessayer.</div>';
    }
}

// Charger les anime de saison
async function loadSeasonalAnime() {
    try {
        seasonalGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Chargement des anime de saison...</div>';
        
        const response = await fetch('https://api.jikan.moe/v4/seasons/now?limit=12');
        
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        
        const data = await response.json();
        
        displayAnime(data.data, seasonalGrid);
    } catch (error) {
        console.error('Erreur lors du chargement des anime de saison:', error);
        seasonalGrid.innerHTML = '<div class="loading">Erreur de chargement. Veuillez réessayer.</div>';
    }
}

// Charger les classiques
async function loadClassicAnime() {
    try {
        classicGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Chargement des classiques...</div>';
        
        // Récupérer des anime populaires (qui incluent des classiques)
        const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=12');
        
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        
        const data = await response.json();
        
        displayAnime(data.data, classicGrid);
    } catch (error) {
        console.error('Erreur lors du chargement des classiques:', error);
        classicGrid.innerHTML = '<div class="loading">Erreur de chargement. Veuillez réessayer.</div>';
    }
}

// NOUVELLE FONCTION : Charger un anime aléatoire avec l'API Jikan Random
async function loadRandomAnime() {
    try {
        // Animation de chargement
        randomAnimeCard.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i> Recherche d'un anime aléatoire...
            </div>
        `;

        // Utiliser l'endpoint random de l'API Jikan
        const response = await fetch('https://api.jikan.moe/v4/random/anime');
        
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération d\'un anime aléatoire');
        }
        
        const data = await response.json();
        const anime = data.data;
        
        displayRandomAnime(anime);
    } catch (error) {
        console.error('Erreur lors du chargement aléatoire:', error);
        // Afficher un message d'erreur élégant
        displayRandomError();
    }
}

// Afficher un anime aléatoire
function displayRandomAnime(anime) {
    const randomContent = `
        <div class="random-content">
            <div class="random-poster">
                <img id="randomAnimeImage" src="${anime.images?.jpg?.large_image_url || ''}" alt="${anime.title}" 
                     onerror="this.src='https://via.placeholder.com/300x400/333/fff?text=Image+Non+Disponible'">
            </div>
            <div class="random-info">
                <h3 id="randomAnimeTitle">${anime.title || 'Titre non disponible'}</h3>
                <div class="random-meta" id="randomAnimeMeta">
                    ${anime.type ? `<span class="meta-item">${anime.type}</span>` : ''}
                    ${anime.episodes ? `<span class="meta-item">${anime.episodes} épisodes</span>` : ''}
                    ${anime.status ? `<span class="meta-item">${anime.status}</span>` : ''}
                    ${anime.score ? `<span class="meta-item">⭐ ${anime.score}</span>` : ''}
                    ${anime.year ? `<span class="meta-item">${anime.year}</span>` : ''}
                </div>
                <p id="randomAnimeSynopsis">
                    ${anime.synopsis ? 
                        anime.synopsis.replace(/\[[^\]]*\]/g, '').substring(0, 300) + 
                        (anime.synopsis.length > 300 ? '...' : '') : 
                        'Aucun synopsis disponible pour cet anime.'}
                </p>
                <div class="random-stats" id="randomAnimeStats">
                    <div class="stat-item">
                        <div class="stat-value">${anime.score || 'N/A'}</div>
                        <div class="stat-label">Score</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${anime.rank ? `#${anime.rank}` : 'N/A'}</div>
                        <div class="stat-label">Rank</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${anime.popularity ? `#${anime.popularity}` : 'N/A'}</div>
                        <div class="stat-label">Popularité</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${anime.members ? formatNumber(anime.members) : 'N/A'}</div>
                        <div class="stat-label">Membres</div>
                    </div>
                </div>
                <div class="hero-actions" style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="showAnimeDetailsFromRandom(${anime.mal_id})">
                        <i class="fas fa-info-circle"></i>
                        Voir les détails complets
                    </button>
                    <button class="btn btn-secondary" onclick="loadRandomAnime()">
                        <i class="fas fa-random"></i>
                        Découvrir un autre anime
                    </button>
                </div>
            </div>
        </div>
    `;
    
    randomAnimeCard.innerHTML = randomContent;
    
    // Stocker l'anime actuel pour les détails
    randomAnimeCard.currentAnime = anime;
}

// Afficher une erreur dans la section aléatoire
function displayRandomError() {
    randomAnimeCard.innerHTML = `
        <div class="random-content">
            <div class="random-poster">
                <div class="trailer-placeholder" style="height: 350px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-exclamation-triangle fa-3x" style="color: #ff6b6b;"></i>
                </div>
            </div>
            <div class="random-info">
                <h3 style="color: #ff6b6b;">Oups ! Erreur de chargement</h3>
                <div class="random-meta">
                    <span class="meta-item" style="background: rgba(255, 107, 107, 0.2);">Erreur API</span>
                </div>
                <p>Impossible de charger un anime aléatoire pour le moment. L'API peut être temporairement indisponible.</p>
                <div class="random-stats">
                    <div class="stat-item">
                        <div class="stat-value" style="color: #ff6b6b;">😔</div>
                        <div class="stat-label">Erreur</div>
                    </div>
                </div>
                <div class="hero-actions" style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="loadRandomAnime()">
                        <i class="fas fa-redo"></i>
                        Réessayer
                    </button>
                    <button class="btn btn-secondary" onclick="switchTab('popular')">
                        <i class="fas fa-fire"></i>
                        Voir les populaires
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Fonction pour afficher les détails depuis la section aléatoire
async function showAnimeDetailsFromRandom(animeId) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des détails');
        }
        
        const data = await response.json();
        showAnimeDetails(data.data);
    } catch (error) {
        console.error('Erreur:', error);
        // Utiliser les données déjà chargées si disponibles
        if (randomAnimeCard.currentAnime) {
            showAnimeDetails(randomAnimeCard.currentAnime);
        }
    }
}

// Afficher les anime dans une grille
function displayAnime(animeList, container) {
    if (!animeList || animeList.length === 0) {
        container.innerHTML = '<div class="loading">Aucun anime trouvé.</div>';
        return;
    }
    
    container.innerHTML = '';
    
    animeList.forEach(anime => {
        const animeCard = document.createElement('div');
        animeCard.className = 'anime-card';
        
        // Déterminer le type de badge
        let badgeText = '';
        if (anime.rank <= 10) badgeText = 'Top 10';
        else if (anime.rank <= 50) badgeText = 'Populaire';
        else if (anime.score >= 8.5) badgeText = 'Excellent';
        
        const genres = anime.genres ? anime.genres.slice(0, 2).map(g => g.name) : [];
        
        animeCard.innerHTML = `
            <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" class="anime-cover"
                 onerror="this.src='https://via.placeholder.com/300x400/333/fff?text=Image+Non+Disponible'">
            ${badgeText ? `<div class="anime-badge">${badgeText}</div>` : ''}
            <div class="anime-info">
                <div class="anime-title">${anime.title}</div>
                <div class="anime-meta">
                    <span>${anime.type || 'N/A'}</span>
                    <span>${anime.episodes ? `${anime.episodes} eps` : 'N/A'}</span>
                </div>
                <div class="anime-score">
                    <i class="fas fa-star"></i>
                    <span>${anime.score || 'N/A'}</span>
                </div>
                ${genres.length > 0 ? `
                    <div class="anime-genres">
                        ${genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        animeCard.addEventListener('click', () => {
            showAnimeDetails(anime);
        });
        
        container.appendChild(animeCard);
    });
}

// Gérer la recherche
async function handleSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        loadPopularAnime();
        return;
    }
    
    try {
        animeGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Recherche en cours...</div>';
        
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=16`);
        
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        
        const data = await response.json();
        
        currentAnime = data.data;
        displayAnime(currentAnime, animeGrid);
        
        // Basculer vers l'onglet populaires pour afficher les résultats
        switchTab('popular');
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        animeGrid.innerHTML = '<div class="loading">Erreur de recherche. Veuillez réessayer.</div>';
    }
}

// Afficher les détails d'un anime
function showAnimeDetails(anime) {
    // Si anime est une string (venant de random), le parser
    if (typeof anime === 'string') {
        try {
            anime = JSON.parse(anime);
        } catch (e) {
            console.error('Erreur de parsing anime:', e);
            return;
        }
    }
    
    // Image avec fallback
    const imageUrl = anime.images?.jpg?.large_image_url || 'https://via.placeholder.com/300x400/333/fff?text=Image+Non+Disponible';
    document.getElementById('detailsImage').src = imageUrl;
    document.getElementById('detailsImage').alt = anime.title;
    
    // Titre
    document.getElementById('detailsTitle').textContent = anime.title || 'Titre non disponible';
    
    // Métadonnées
    const metaContainer = document.getElementById('detailsMeta');
    metaContainer.innerHTML = '';
    
    if (anime.type) {
        const typeElement = document.createElement('span');
        typeElement.className = 'meta-item';
        typeElement.textContent = anime.type;
        metaContainer.appendChild(typeElement);
    }
    
    if (anime.episodes) {
        const episodesElement = document.createElement('span');
        episodesElement.className = 'meta-item';
        episodesElement.textContent = `${anime.episodes} épisodes`;
        metaContainer.appendChild(episodesElement);
    }
    
    if (anime.status) {
        const statusElement = document.createElement('span');
        statusElement.className = 'meta-item';
        statusElement.textContent = anime.status;
        metaContainer.appendChild(statusElement);
    }
    
    if (anime.rating) {
        const ratingElement = document.createElement('span');
        ratingElement.className = 'meta-item';
        ratingElement.textContent = anime.rating.replace(' - ', ' ');
        metaContainer.appendChild(ratingElement);
    }
    
    if (anime.genres && anime.genres.length > 0) {
        const genresElement = document.createElement('span');
        genresElement.className = 'meta-item';
        genresElement.textContent = anime.genres.map(genre => genre.name).join(', ');
        metaContainer.appendChild(genresElement);
    }
    
    if (anime.studios && anime.studios.length > 0) {
        const studiosElement = document.createElement('span');
        studiosElement.className = 'meta-item';
        studiosElement.textContent = `Studio: ${anime.studios[0].name}`;
        metaContainer.appendChild(studiosElement);
    }
    
    // Synopsis
    const synopsisElement = document.getElementById('detailsSynopsis');
    synopsisElement.textContent = anime.synopsis ? 
        anime.synopsis.replace(/\[[^\]]*\]/g, '') : 'Aucun synopsis disponible.';
    
    // Statistiques
    const statsContainer = document.getElementById('detailsStats');
    statsContainer.innerHTML = '';
    
    const stats = [
        { label: 'Score', value: anime.score || 'N/A', icon: 'star' },
        { label: 'Rank', value: anime.rank ? `#${anime.rank}` : 'N/A', icon: 'trophy' },
        { label: 'Popularité', value: anime.popularity ? `#${anime.popularity}` : 'N/A', icon: 'fire' },
        { label: 'Membres', value: anime.members ? formatNumber(anime.members) : 'N/A', icon: 'users' },
        { label: 'Favorites', value: anime.favorites ? formatNumber(anime.favorites) : 'N/A', icon: 'heart' }
    ];
    
    stats.forEach(stat => {
        const statElement = document.createElement('div');
        statElement.className = 'stat-item';
        statElement.innerHTML = `
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        `;
        statsContainer.appendChild(statElement);
    });
    
    // Trailer
    const trailerContainer = document.getElementById('detailsTrailer');
    if (anime.trailer && anime.trailer.embed_url) {
        trailerContainer.innerHTML = `
            <h3>Bande-annonce</h3>
            <iframe 
                width="100%" 
                height="400" 
                src="${anime.trailer.embed_url}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        trailerContainer.innerHTML = `
            <div class="trailer-placeholder">
                <i class="fas fa-film fa-2x"></i>
                <p>Aucune bande-annonce disponible</p>
            </div>
        `;
    }
    
    // Afficher les détails
    animeDetails.style.display = 'flex';
}

// Formater les grands nombres
function formatNumber(num) {
    if (!num) return 'N/A';
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
});

// Gestion des promesses non catchées
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse non catchée:', event.reason);
});