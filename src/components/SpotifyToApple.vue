<template>
  <div>
    <form @submit.prevent="convertPlaylist">
      <div>
        <label for="playlistID">Spotify Playlist ID:</label>
        <input type="text" v-model="pref.playlistID" id="playlistID" required />
      </div>
      <div>
        <label for="userToken">Apple Music User Token:</label>
        <input type="text" v-model="pref.userToken" id="userToken" required />
      </div>
      <div>
        <label for="name">Playlist Name (optional):</label>
        <input type="text" v-model="pref.name" id="name" />
      </div>
      <div>
        <label for="description">Playlist Description (optional):</label>
        <input type="text" v-model="pref.description" id="description" />
      </div>
      <button type="submit">Convert Playlist</button>
    </form>
    <div v-if="result">
      <h2>Conversion Result</h2>
      <p>{{ result }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type Preference = {
  playlistID: string,
  userToken: string,
  name: string,
  description: string
}

const pref = ref<Preference>({
  playlistID: '',
  userToken: MusicKit.getInstance().musicUserToken,
  name: '',
  description: ''
});

const result = ref<string | null>(null);

async function convertPlaylist() {
  try {
    let url = `https://converter.yaz.ninja/importPlaylists/spotify/${pref.value.playlistID}?to=am&userToken=${encodeURIComponent(pref.value.userToken)}`;

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
}

</script>

  
<style scoped>
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
}
button:hover {
  background-color: #0056b3;
}
</style>
  