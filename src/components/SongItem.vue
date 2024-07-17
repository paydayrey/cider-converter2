<template>
	<div class="song-item">
		<div class="img-container">
			<img :src="image" alt="Album Art" />
		</div>
		<div class="content-container">
			<div class="title">{{ title }}</div>
			<div class="subtitle">{{ artist }} • {{ album }}</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.song-item {
	display: flex;
	align-items: center;
	margin-bottom: 1rem;
}
.img-container {
	width: 50px;
	height: auto;
	aspect-ratio: 1/1;
	overflow: hidden;
	border-radius: 0.50rem;
	object-fit: contain;
	img {
		max-width: 100%;
		max-height: 100%;
	
	}
}
.content-container {
	display: flex;
	flex-direction: column;
	margin-left: 1rem;
	gap:0;
	justify-content: center;
	.title {
		font-size: 1rem;
		font-weight: bold;
	}
	.subtitle {
		font-size: 0.8rem;
		opacity: 0.65;
	}
}
</style>

<script setup lang="ts">
defineProps<{
	image: string,
	title: string,
	artist: string,
	album: string
}>();
</script>
