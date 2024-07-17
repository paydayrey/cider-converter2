<template>
    <div>
      <form @submit.prevent="convertPlaylist">
        <div>
          <label for="playlistID">Spotify Playlist ID:</label>
          <input type="text" v-model="playlistID" id="playlistID" required />
        </div>
        <div>
          <label for="userToken">Apple Music User Token:</label>
          <input type="text" v-model="userToken" id="userToken" required />
        </div>
        <div>
          <label for="name">Playlist Name (optional):</label>
          <input type="text" v-model="name" id="name" />
        </div>
        <div>
          <label for="description">Playlist Description (optional):</label>
          <input type="text" v-model="description" id="description" />
        </div>
        <button type="submit">Convert Playlist</button>
      </form>
      <div v-if="result">
        <h2>Conversion Result</h2>
        <p>{{ result }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'SpotifyToApple',
    setup() {
      const playlistID = ref('');
      const userToken = ref('');
      const name = ref('');
      const description = ref('');
      const result = ref(null);
  
      const convertPlaylist = async () => {
        try {
          const params = new URLSearchParams({
            to: 'am',
            userToken: userToken.value,
          });
  
          if (name.value) {
            params.append('name', name.value);
          }
          if (description.value) {
            params.append('description', description.value);
          }
  
          const response = await fetch(`https://converter.yaz.ninja/importPlaylists/spotify/${playlistID.value}?${params}`);
          const data = await response.json();
          result.value = data;
        } catch (error) {
          console.error('Error converting playlist:', error);
          result.value = 'An error occurred while converting the playlist.';
        }
      };
  
      return {
        playlistID,
        userToken,
        name,
        description,
        result,
        convertPlaylist,
      };
    },
  };
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
  