<template>
    <div class="q-pa-lg plugin-base">
        <form @submit.prevent="convertPlaylist">
            <div>
                <label for="playlistID">Spotify Playlist ID:</label>
                <input type="text" v-model="playlistID" required />
            </div>

            <div>
                <label for="userToken">Apple Music User Token:</label>
                <input type="text" v-model="userToken" required />
            </div>

            <div>
                <label for="name">Name (optional):</label>
                <input type="text" v-model="name" />
            </div>

            <div>
                <label for="description">Description (optional):</label>
                <input type="text" v-model="description" />
            </div>

            <button type="submit">Convert Playlist</button>
        </form>

        <div v-if="result" class="result">
            <h2>{{ result.name }}</h2>
            <p>{{ result.description }}</p>
            <ul>
                <li v-for="(track, index) in result.tracks" :key="index">
                    {{ track.id }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

const playlistID = ref("");
const userToken = ref("");
const name = ref("");
const description = ref("");
const result = ref(null);

const convertPlaylist = async () => {
    try {
        const response = await axios.post(
            `https://converter.yaz.ninja/importPlaylists/spotify/${playlistID.value}?to=am&userToken=${userToken.value}&name=${name.value}&desc=${description.value}`,
            {},
            {
                headers: {
                    "User-Agent": "CiderApp",
                    "Content-Type": "application/json",
                },
            },
        );
        result.value = response.data;
    } catch (error) {
        result.value = error.response ? error.response.data : error.message;
    }
};
</script>

<style scoped>
.plugin-base {
    max-width: 600px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
}

label {
    display: block;
    margin-top: 10px;
}

input {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    box-sizing: border-box;
}

button {
    margin-top: 15px;
    padding: 10px 20px;
}

.result {
    margin-top: 20px;
}

.result h2,
.result p {
    font-size: 16px;
    margin: 5px 0;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    padding: 5px 0;
    border-bottom: 1px solid #ccc;
}
</style>
