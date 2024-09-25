export class Spotifish {
    constructor(musics = [], playlists = [], currentMusic = 0, isLoop = false) {
        this.musics = musics;
        this.playlists = playlists;
        this.audio = null;
        this.currentMusic = currentMusic;
        this.isLoop = isLoop;
    }
    updatecurrentMusicsActive() {
        this.musics.map((music) => music.updateIsActive());
    }
}

export class Playlist {
    constructor(name, musics = [], isActive = false) {
        this.name = name;
        this.musics = musics;
        this.isActive = isActive;
    }
    addMusics(music) {
        this.musics.add(music);
        music.addPlaylist(this);
    }
    deleteMusics(music) {
        newMusics = this.musics.filter((m) => m !== music);
        if (newMusics.length !== this.musics.length) {
            music.deletePlaylist(this);
        }
        this.musics = newMusics;
    }
    changeActive() {
        this.isActive = !this.isActive;
        this.musics.map((music) => music.updateIsActive());
    }
}

export class Music {
    constructor(name, path, youtubeLink, duration, playlists = [], isActive = false) {
        this.name = name;
        this.path = path;
        this.youtubeLink = youtubeLink;
        this.playlists = playlists;
        this.duration = duration;
        this.isActive = isActive;
    }
    addPlaylist(playlist) {
        this.playlists.add(playlist);
    }
    deletePlaylist(playlist) {
        newPlaylists = this.playlists.filter((pl) => pl !== playlist);
        if (newMusics.length !== this.playlists.length) {
            playlist.deleteMusics(this);
        }
        this.playlists = newPlaylists;
    }
    updateIsActive() {
        this.isActive = this.playlists.any((playlist) => playlist.isActive);
    }
}
