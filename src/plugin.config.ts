import { createId } from "@paralleldrive/cuid2"

export default {
    ce_prefix: createId(),
    identifier: 'org.ciderspotify.converter',
    name: 'Spotify to Cider 2 Converter',
    description: 'A fixed version of the plugin to convert Spotify playlists to Apple Music',
    version: '1.0',
    author: 'Payday',
    repo: 'https://github.com/paydayrey/cider-converter2',
    requirements: {
        minApiVersion: '2.0.0'
    },
    permissions: [
        'musickit',
        'playlists:modify',
        'library:modify'
    ],
    entry: {
        'plugin.js': {
            type: 'main',
        }
    }
}


