<template>
  <div>
    <google-cast-launcher></google-cast-launcher>
    <form @submit.prevent="convertPlaylist">
      <div>
        <label for="playlistID">Spotify Playlist ID:</label>
        <input type="text" v-model="pref.playlistID" id="playlistID" required />
      </div>
      <div>
        <label for="userToken">Apple Music User Token:</label>
        <input type="password" v-model="pref.userToken" id="userToken" required />
      </div>
      <div>
        <label for="name">Playlist Name (optional):</label>
        <input type="text" v-model="pref.name" id="name" />
      </div>
      <div>
        <label for="description">Playlist Description (optional):</label>
        <input type="text" v-model="pref.description" id="description" />
      </div>
      <Button type="submit">Convert Playlist</Button>
    </form>
    <div v-if="result">
      <h2>Conversion Result</h2>
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

<script setup lang="ts">
import { ref } from 'vue';
import SongItem from './SongItem.vue';

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
  document.head.appendChild(script);
})


type Preference = {
  playlistID: string,
  userToken: string,
  name: string,
  description: string
}
type SongImageObj = {
  url: string,
  width: number,
  height: number
}
const pref = ref<Preference>({
  playlistID: '',
  userToken: MusicKit.getInstance().musicUserToken,
  name: '',
  description: ''
});

const result = ref<any>(null);
const tracks = ref<any>(null);

async function convertPlaylist() {
  try {
    let url = `https://converter.yaz.ninja/importPlaylists/spotify/${pref.value.playlistID}?to=am&userToken=${pref.value.userToken}`;

    if (pref.value.name) {
      url += `&name=${encodeURIComponent(pref.value.name)}`;
    }
    if (pref.value.description) {
      url += `&description=${encodeURIComponent(pref.value.description)}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    result.value = data;
  } catch (error) {
    console.error('Error converting playlist:', error);
    result.value = 'An error occurred while converting the playlist.';
  }
  tracks.value = await getAMSongs(result.value.tracks);
}

async function getAMSongs(tracks: [{id: string| null, type: "song"}]) {
  const storefront = MusicKit.getInstance().storefrontCountryCode;
  const songIDs = tracks.filter(track => track.id && track.type === 'song').map(track => track.id);
  const response = await MusicKit.getInstance().api.v3.music(`v1/catalog/${storefront}/songs?ids=${songIDs.join(',')}`);
  return response.data.data;

}

function toImage(artwork: SongImageObj, width?: number, height?: number) {
  return artwork.url.replace('{w}', String(width || artwork.width)).replace('{h}', String(height || artwork.height));
}
</script>

  
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
  &:hover {
    background-color: #0056b3;
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
</style>