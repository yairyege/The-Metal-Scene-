// =========================================================================
// 1. SPOTIFY AUTHENTICATION CONFIG
// =========================================================================
// Paste your fresh 1-hour token inside the quotes below
const SPOTIFY_TOKEN = "BQAr1Zx8OllcLKyiUDCC4umIyqy6gT4BH0gV4x5QEh7eF9ggab6AC1dBj4_araevuIyulbQDhmaMDbEim0WPUnxsXzkVY_IYIp7Gh6EYsC3mR_OqWek8aUCA6CCzOawWQ0UHy-VWw7up";

// =========================================================================
// 2. YOUR FESTIVALS DATA SOURCE
// =========================================================================
const festivals = [
  {
    id: "rip",
    name: "Rock im Park 2026",
    image: "assets/rock-im-park.png",
    bands: ["Parkway Drive", "Architects", "Thornhill", "Bring Me The Horizon"]
  },
  {
    id: "wacken",
    name: "Wacken Open Air 2026",
    image: "assets/wacken.png",
    bands: ["Amon Amarth", "Kreator", "Electric Callboy", "In Flames"]
  }
];

// =========================================================================
// 3. SPOTIFY API FETCH ENGINE
// =========================================================================
async function getSpotifyBandDetails(bandName) {
    const searchUrl = `https://api.spotify.com/v1/search?q=$${encodeURIComponent(bandName)}&type=artist&limit=1`;
    
    try {
        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SPOTIFY_TOKEN}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error("🚨 Spotify Token expired! Run 'node spotify-key.js' in VS Code for a new one.");
            }
            return null;
        }

        const data = await response.json();
        const artist = data.artists?.items[0];

        if (artist) {
            return {
                imageUrl: artist.images[0]?.url || 'assets/placeholder.jpg',
                genres: artist.genres.slice(0, 2) // Grabs the top 2 genre tags
            };
        }
    } catch (error) {
        console.error(`Error connecting to Spotify for ${bandName}:`, error);
    }
    return null;
}

// =========================================================================
// 4. DYNAMIC UI GENERATOR ENGINE
// =========================================================================
async function renderFestivalsApp() {
    // Looks for a primary main or div container in your index.html
    const appContainer = document.getElementById('festivals-container') || document.body;
    
    // Clear out the container before building
    appContainer.innerHTML = ''; 

    // LOOP 1: Go through each festival in your array
    for (const festival of festivals) {
        
        // Create a distinct UI block layout for this specific festival
        const festivalSectionHTML = `
            <section class="festival-section" id="section-${festival.id}" style="margin-bottom: 50px; padding: 20px; border-bottom: 2px solid #222;">
                <div class="festival-header" style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                    <img src="${festival.image}" alt="${festival.name}" style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px;" onerror="this.style.display='none'">
                    <h2 style="font-size: 2rem; color: #fff; margin: 0;">${festival.name}</h2>
                </div>
                <div class="lineup-grid" id="grid-${festival.id}" style="display: flex; flex-wrap: wrap; gap: 15px;">
                    <p style="color: #555;">Loading live lineup details...</p>
                </div>
            </section>
        `;
        
        appContainer.insertAdjacentHTML('beforeend', festivalSectionHTML);
        
        // Grab the empty grid we just created so we can fill it up with cards
        const targetGrid = document.getElementById(`grid-${festival.id}`);
        if (!targetGrid) continue;
        targetGrid.innerHTML = ''; // Clear the loading text

        // LOOP 2: Go through every single band inside this specific festival
        for (const bandName of festival.bands) {
            // Hit the live Spotify API for assets
            const spotifyData = await getSpotifyBandDetails(bandName);
            
            const imgUrl = spotifyData ? spotifyData.imageUrl : 'assets/placeholder.jpg';
            const genres = spotifyData && spotifyData.genres.length > 0 ? spotifyData.genres.join(', ') : 'Metalcore';

            // Generate the visual circular card matching your design direction
            const cardHTML = `
                <div class="band-card" style="text-align: center; padding: 15px; background: #111; border-radius: 12px; border: 1px solid #1a1a1a; width: 150px; transition: transform 0.2s;">
                    <img src="${imgUrl}" alt="${bandName}" style="width: 110px; height: 110px; border-radius: 50