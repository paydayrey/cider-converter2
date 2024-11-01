<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMusicKit, createModal } from '@ciderapp/pluginkit';
import SongItem from './SongItem.vue';

// Type guards and interfaces
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

interface SpotifyTrack {
  id: string | null;
  type: 'song';
}

interface AMTrack {
  id: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    artwork: {
      url: string;
      width: number;
      height: number;
    };
  };
}

type Preference = {
  playlistLink: string;
  name: string;
  description: string;
};


// Component state
const pref = ref<Preference>({
  playlistLink: '',
  name: '',
  description: ''
});

const result = ref<any>(null);
const tracks = ref<AMTrack[] | null>(null);
const isLoading = ref(false);

const isValidUrl = computed(() => {
  const pattern = /^https:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]{22}/;
  return pattern.test(pref.value.playlistLink);
});

function validateInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  console.log('Input value:', input.value);
  console.log('Is valid URL:', isValidUrl.value); // Debug log
}

// Add this debug watcher
watch(pref, (newVal) => {
  console.log('Playlist link changed:', newVal.playlistLink);
  console.log('Is valid URL:', isValidUrl.value);
}, { deep: true });


type SongImageObj = {
  url: string;
  width: number;
  height: number;
};

interface DebugInfo {
  inputLink: string;
  cleanedLink: string;
  matchResult: RegExpMatchArray | null;
  extractedId: string | null;
}

interface CiderModal {
  openDialog: () => void;
  closeDialog: () => void;
}

// Utility functions
function extractPlaylistID(link: string): string | null {
  console.log('Debug: Received link:', link);
  
  // Check if link exists
  if (!link || typeof link !== 'string') {
    console.log('Debug: Link is empty or invalid');
    return null;
  }

  const cleanLink = link.trim();
  console.log('Debug: Cleaned link:', cleanLink);

  // Extract ID from Spotify URL
  if (cleanLink.includes('open.spotify.com/playlist/')) {
    const parts = cleanLink.split('/');
    const lastPart = parts[parts.length - 1];
    const id = lastPart.split('?')[0];  // Remove query parameters
    console.log('Debug: Extracted ID:', id);
    return id;
  }

  console.log('Debug: No valid ID found');
  return null;
}

async function convertPlaylist() {
  let loadingModal: CiderModal | undefined;

  try {
    // Add console log to check the value
    console.log('Current playlist link:', pref.value.playlistLink);

    // Validate that the input exists and is not empty
    if (!pref.value.playlistLink || pref.value.playlistLink.trim() === '') {
      throw new Error('Please enter a Spotify playlist link');
    }

    const playlistID = extractPlaylistID(pref.value.playlistLink);
    console.log('Extracted playlist ID:', playlistID);

    if (!playlistID) {
      throw new Error('Invalid Spotify playlist link format');
    }

    // Create loading modal after validation passes
    const loadingElement = document.createElement('div');
    loadingElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h3>Converting Playlist</h3>
        <p>Please wait while we process your playlist...</p>
      </div>
    `;

    loadingModal = createModal({
      escClose: false,
      element: loadingElement
    });

    isLoading.value = true;
    loadingModal.openDialog();


    let url = `https://converter.yaz.ninja/importPlaylists/spotify/${playlistID}?to=am`;
    if (pref.value.name) url += `&name=${encodeURIComponent(pref.value.name)}`;
    if (pref.value.description) url += `&description=${encodeURIComponent(pref.value.description)}`;

    // Debug log the URL (remove sensitive info)
    console.log('Conversion URL:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch playlist data');
    }

    const data = await response.json();
    result.value = data;

    // Get the full track details
    const convertedTracks = await getAMSongs(data.tracks);
    tracks.value = convertedTracks;

    // Create the playlist in Cider 2
    const playlistName = pref.value.name || `Spotify Import - ${new Date().toLocaleDateString()}`;
    
    // Use MusicKit API to create playlist
    const playlist = await MusicKit.api.music('v1/me/library/playlists', {
      method: 'POST',
      body: JSON.stringify({
        attributes: {
          name: playlistName,
          description: pref.value.description || 'Imported from Spotify'
        }
      })
    });

    // Add tracks to the playlist
    const playlistId = playlist.data.id;
    await MusicKit.api.music(`v1/me/library/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({
        data: convertedTracks.map((track: { id: any; }) => ({
          id: track.id,
          type: 'songs'
        }))
      })
    });

    loadingModal.closeDialog();

    const successElement = document.createElement('div');
    successElement.innerHTML = `
      <div style="padding: 20px; text-align: center; background: #ddffdd; color: #333;">
        <h3>Success</h3>
        <p>Playlist "${playlistName}" created with ${convertedTracks.length} tracks</p>
      </div>
    `;

    const successModal = createModal({
      escClose: true,
      element: successElement
    });
    successModal.openDialog();

  } catch (error: unknown) {
    console.error('Error converting playlist:', error);
    
    const errorMessage = isError(error) 
      ? error.message 
      : 'An unexpected error occurred while converting the playlist';

    const errorElement = document.createElement('div');
    errorElement.innerHTML = `
      <div style="padding: 20px; text-align: center; background: #ffdddd; color: #333;">
        <h3>Error</h3>
        <p>${errorMessage}</p>
      </div>
    `;

    const errorModal = createModal({
      escClose: true,
      element: errorElement
    });
    errorModal.openDialog();
  } finally {
    isLoading.value = false;
    if (loadingModal) {
      loadingModal.closeDialog();
    }
  }
}

async function getAMSongs(tracks: Array<{id: string | null, type: "song"}>) {
  const musicKit = useMusicKit();
  const storefront = musicKit.storefrontCountryCode;
  const songIDs = tracks
    .filter(track => track.id && track.type === 'song')
    .map(track => track.id);

  if (songIDs.length === 0) {
    throw new Error('No valid songs found in playlist');
  }

  const response = await musicKit.api.v3.music(
    `v1/catalog/${storefront}/songs`, 
    { ids: songIDs.join(',') }
  );

  if (!response?.data?.data) {
    throw new Error('Failed to fetch song details');
  }

  return response.data.data;
}

function toImage(artwork: SongImageObj, width?: number, height?: number) {
  return artwork.url
    .replace('{w}', String(width || artwork.width))
    .replace('{h}', String(height || artwork.height));
}
</script>

<template>
  <div>
    <google-cast-launcher></google-cast-launcher>
    <form @submit.prevent="convertPlaylist" :class="{ 'is-loading': isLoading }">
      <div>
        <label for="playlistLink">Spotify Playlist Link: *</label>
        <input 
          type="text" 
          v-model.trim="pref.playlistLink" 
          id="playlistLink" 
          required 
          placeholder="https://open.spotify.com/playlist/..."
          @="validateInput"
        />
        <small class="help-text">
          Format: https://open.spotify.com/playlist/PLAYLIST_ID
        </small>
      </div>
      <div>
        <label for="name">Playlist Name (optional):</label>
        <input 
          type="text" 
          v-model.trim="pref.name" 
          id="name" 
        />
      </div>
      <div>
        <label for="description">Playlist Description (optional):</label>
        <input 
          type="text" 
          v-model.trim="pref.description" 
          id="description" 
        />
      </div>
      <button 
  type="submit" 
  :disabled="!isValidUrl || isLoading"
  @click="console.log('Button clicked', { isValidUrl: isValidUrl, isLoading: isLoading })"
>
  {{ isLoading ? 'Converting...' : 'Convert Playlist' }}
  <span v-if="!isValidUrl" class="validation-message">(Invalid URL)</span>
      </button>
    </form>
    <div v-if="result">
      <h3>Conversion Result</h3>
      <div v-if="tracks" class="songs-container">
        <div class="title">Tracks</div>
        <template v-for="item in tracks" :key="item.id">
          <SongItem 
            :image="toImage(item.attributes.artwork)"
            :title="item.attributes.name" 
            :artist="item.attributes.artistName" 
            :album="item.attributes.albumName" 
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
form {
  margin-bottom: 20px;
}
label {
  display: block;
  margin: 5px 0;
}
input {
  width: 100%;
  padding: 8px;
  margin: 5px 0 15px 0;
  box-sizing: border-box;
}
button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
.songs-container {
  padding: 0.2rem 2rem;
  background-color: #232323;
  .title {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    margin-block: 0.8rem;
  }
  border-radius: 1rem;
}
.help-text {
  font-size: 0.8em;
  color: #666;
  margin-top: 4px;
  display: block;
}
.is-loading {
  opacity: 0.7;
  pointer-events: none;
}
</style>
