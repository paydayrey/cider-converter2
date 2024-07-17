<script setup lang="ts">
import { computed } from "vue";
import SpotifyToApple from "../components/SpotifyToApple.vue";

const cfg = computed(() => {
    return window.CiderApp.config.getRef();
});
</script>
<template>
    <div class="q-pa-lg plugin-base">
        <h1 class="apple-heading">Spotify playlist converter.</h1>
        <p></p>
        <SpotifyToApple />
    </div>
</template>

<style scoped></style>
