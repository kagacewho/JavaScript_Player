class MusicPlayer {
    constructor(config) {
        this.tracks = config.tracks;
        this.currentTrackIndex = 0;
        this.playbackMode = "normal";
        this.isPlaying = false;
        this.volume = 1;
        this.showingLyrics = false;

        this.audioElement = document.getElementById('audio-element');
        this.miniPlayer = document.getElementById('mini-player');
        this.miniCoverImage = document.getElementById('mini-cover-img');
        this.miniTrackTitle = document.getElementById('mini-track-title');
        this.miniTrackArtist = document.getElementById('mini-track-artist');
        this.miniPlayButton = document.getElementById('mini-play-btn');
        this.miniPlayIcon = document.getElementById('mini-play-icon');
        this.miniPrevButton = document.getElementById('mini-prev-btn');
        this.miniNextButton = document.getElementById('mini-next-btn');

        this.fullPlayer = document.getElementById('full-player');
        this.fullCoverImage = document.getElementById('full-cover-img');
        this.fullTrackTitle = document.getElementById('full-track-title');
        this.fullTrackArtist = document.getElementById('full-track-artist');
        this.fullPlayButton = document.getElementById('full-play-btn');
        this.fullPlayIcon = document.getElementById('full-play-icon');
        this.fullPrevButton = document.getElementById('full-prev-btn');
        this.fullNextButton = document.getElementById('full-next-btn');
        this.progressSlider = document.getElementById('progress-slider');
        this.currentTimeDisplay = document.getElementById('current-time-display');
        this.totalTimeDisplay = document.getElementById('total-time-display');
        this.volumeSlider = document.getElementById('volume-slider');
        this.closePlayerButton = document.getElementById('close-player');

        this.startPlaybackButton = document.getElementById('start-playback');
        this.playbackModeButton = document.getElementById('playback-mode');
        this.modeIcon = document.getElementById('mode-icon');

        this.songsList = document.getElementById('songs-list');

        this.trackDetailView = document.getElementById('track-detail');
        this.albumDisplay = document.querySelector('.album-display');
        this.backToListButton = document.getElementById('back-to-list');
        this.detailCoverImage = document.getElementById('detail-cover-img');
        this.detailTrackTitle = document.getElementById('detail-track-title');
        this.detailTrackArtist = document.getElementById('detail-track-artist');
        this.detailPlayButton = document.getElementById('detail-play');
        this.detailPlayIcon = document.getElementById('detail-play-icon');
        this.detailPrevButton = document.getElementById('detail-prev');
        this.detailNextButton = document.getElementById('detail-next');
        this.detailShuffleButton = document.getElementById('detail-shuffle');
        this.detailVolumeSlider = document.getElementById('detail-volume-slider');
        this.lyricsButton = document.getElementById('lyrics-btn');
        this.downloadButton = document.getElementById('download-btn');
        this.lyricsSection = document.getElementById('lyrics-section');
        this.lyricsText = document.getElementById('lyrics-text');

        this.initializeEventListeners();
        this.renderTrackList();
        this.updateModeDisplay();
        this.updatePlayButtons();
        this.setVolume(this.volume);
    }

    initializeEventListeners() {
        this.miniPlayButton.addEventListener('click', () => this.togglePlayback());
        this.fullPlayButton.addEventListener('click', () => this.togglePlayback());
        this.detailPlayButton.addEventListener('click', () => this.togglePlayback());
        
        this.miniPrevButton.addEventListener('click', () => this.playPreviousTrack());
        this.miniNextButton.addEventListener('click', () => this.playNextTrack());
        this.fullPrevButton.addEventListener('click', () => this.playPreviousTrack());
        this.fullNextButton.addEventListener('click', () => this.playNextTrack());
        this.detailPrevButton.addEventListener('click', () => this.playPreviousTrack());
        this.detailNextButton.addEventListener('click', () => this.playNextTrack());
        
        this.progressSlider.addEventListener('input', (e) => this.seekAudio(e));
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.detailVolumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        this.closePlayerButton.addEventListener('click', () => this.hideFullPlayer());
        this.startPlaybackButton.addEventListener('click', () => this.startAlbumPlayback());
        this.playbackModeButton.addEventListener('click', () => this.switchPlaybackMode());
        this.backToListButton.addEventListener('click', () => this.showTrackList());
        this.detailShuffleButton.addEventListener('click', () => this.toggleShuffle());
        this.lyricsButton.addEventListener('click', () => this.toggleLyrics());
        this.downloadButton.addEventListener('click', () => this.downloadTrack());
        
        this.audioElement.addEventListener('loadedmetadata', () => this.updateAudioDuration());
        this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
        this.audioElement.addEventListener('ended', () => this.handleTrackEnd());
        this.audioElement.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButtons();
        });
        this.audioElement.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButtons();
        });

        this.fullPlayer.addEventListener('click', (e) => {
            if (e.target === this.fullPlayer) {
                this.hideFullPlayer();
            }
        });

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(event) {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePlayback();
                break;
            case 'ArrowRight':
                if (event.ctrlKey) this.playNextTrack();
                break;
            case 'ArrowLeft':
                if (event.ctrlKey) this.playPreviousTrack();
                break;
            case 'Escape':
                this.hideFullPlayer();
                if (this.trackDetailView.classList.contains('active')) {
                    this.showTrackList();
                }
                break;
        }
    }

    formatTime(seconds) {
        if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    getCurrentTrack() {
        return this.tracks[this.currentTrackIndex];
    }

    updateModeDisplay() {
        const modeIcons = {
            normal: "Downloads/repeat-icon.png",
            repeat: "Downloads/repeat-one-icon.png", 
            shuffle: "Downloads/shuffle-icon.png"
        };
        
        this.modeIcon.src = modeIcons[this.playbackMode];
        
        if (this.playbackMode === "shuffle") {
            this.detailShuffleButton.classList.add('active');
        } else {
            this.detailShuffleButton.classList.remove('active');
        }
    }

    updatePlayButtons() {
        const playIcon = "Downloads/play-icon.png";
        const pauseIcon = "Downloads/pause-icon.png";
        
        this.miniPlayIcon.src = this.isPlaying ? pauseIcon : playIcon;
        this.fullPlayIcon.src = this.isPlaying ? pauseIcon : playIcon;
        this.detailPlayIcon.src = this.isPlaying ? pauseIcon : playIcon;
    }

    renderTrackList() {
        this.songsList.innerHTML = "";
        
        this.tracks.forEach((track, index) => {
            const trackElement = document.createElement("div");
            trackElement.className = "track-item";
            trackElement.innerHTML = `
                <div class="track-number">${index + 1}</div>
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <button class="track-play-btn">
                    <img src="Downloads/play-track-icon.png" alt="Play Track" class="btn-icon">
                </button>
            `;
            
            const playButton = trackElement.querySelector(".track-play-btn");
            playButton.addEventListener("click", (e) => {
                e.stopPropagation();
                this.currentTrackIndex = index;
                this.playCurrentTrack();
                this.showTrackDetail();
            });
            
            trackElement.addEventListener("click", (e) => {
                if (e.target !== playButton && !playButton.contains(e.target)) {
                    this.currentTrackIndex = index;
                    this.playCurrentTrack();
                    this.showTrackDetail();
                }
            });
            
            this.songsList.appendChild(trackElement);
        });
    }

    playCurrentTrack() {
        const currentTrack = this.getCurrentTrack();
        
        if (!currentTrack || !currentTrack.src) return;
        
        this.audioElement.src = currentTrack.src;
        this.audioElement.play().then(() => {
            this.isPlaying = true;
            this.miniPlayer.classList.add('active');

            document.querySelectorAll('.track-item').forEach(item => {
                item.classList.remove('playing');
            });
            
            const trackItems = document.querySelectorAll('.track-item');
            if (trackItems[this.currentTrackIndex]) {
                trackItems[this.currentTrackIndex].classList.add('playing');
            }

            const coverImagePath = "Downloads/kai.jpg";
            this.miniCoverImage.src = coverImagePath;
            this.miniTrackTitle.textContent = currentTrack.title;
            this.miniTrackArtist.textContent = currentTrack.artist;
            
            this.fullCoverImage.src = coverImagePath;
            this.fullTrackTitle.textContent = currentTrack.title;
            this.fullTrackArtist.textContent = currentTrack.artist;
            
            this.updateDetailView();
            this.updatePlayButtons();
        });
    }

    playNextTrack() {
        if (this.playbackMode === "shuffle") {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * this.tracks.length);
            } while (newIndex === this.currentTrackIndex && this.tracks.length > 1);
            this.currentTrackIndex = newIndex;
        } else if (this.playbackMode === "repeat") {
            this.audioElement.currentTime = 0;
            if (this.isPlaying) {
                this.audioElement.play();
            }
            return;
        } else {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        }
        this.playCurrentTrack();
    }

    playPreviousTrack() {
        if (this.audioElement.currentTime > 3) {
            this.audioElement.currentTime = 0;
            if (this.isPlaying) {
                this.audioElement.play();
            }
            return;
        }
        
        if (this.playbackMode === "shuffle") {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * this.tracks.length);
            } while (newIndex === this.currentTrackIndex && this.tracks.length > 1);
            this.currentTrackIndex = newIndex;
        } else if (this.playbackMode === "repeat") {
            this.audioElement.currentTime = 0;
            if (this.isPlaying) {
                this.audioElement.play();
            }
            return;
        } else {
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        }
        this.playCurrentTrack();
    }

    togglePlayback() {
        if (this.audioElement.paused) {
            if (!this.audioElement.src) {
                this.playCurrentTrack();
            } else {
                this.audioElement.play();
            }
        } else {
            this.audioElement.pause();
        }
    }

    showFullPlayer() {
        this.fullPlayer.classList.add("show");
    }

    hideFullPlayer() {
        this.fullPlayer.classList.remove("show");
    }

    startAlbumPlayback() {
        this.currentTrackIndex = 0;
        this.playCurrentTrack();
    }

    switchPlaybackMode() {
        if (this.playbackMode === "normal") {
            this.playbackMode = "repeat";
        } else if (this.playbackMode === "repeat") {
            this.playbackMode = "shuffle";
        } else {
            this.playbackMode = "normal";
        }
        this.updateModeDisplay();
    }

    toggleShuffle() {
        if (this.playbackMode === "normal") {
            this.playbackMode = "shuffle";
        } else if (this.playbackMode === "shuffle") {
            this.playbackMode = "repeat";
        } else {
            this.playbackMode = "normal";
        }
        this.updateModeDisplay();
    }

    updateAudioDuration() {
        this.totalTimeDisplay.textContent = this.formatTime(this.audioElement.duration);
    }

    updateProgress() {
        if (this.audioElement.duration && isFinite(this.audioElement.duration)) {
            const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
            this.progressSlider.value = progress;
            this.currentTimeDisplay.textContent = this.formatTime(this.audioElement.currentTime);
        }
    }

    seekAudio(event) {
        if (this.audioElement.duration && isFinite(this.audioElement.duration)) {
            const seekTime = this.audioElement.duration * (parseInt(event.target.value, 10) / 100);
            this.audioElement.currentTime = seekTime;
        }
    }

    setVolume(value) {
        this.volume = parseFloat(value);
        this.audioElement.volume = this.volume;
        this.volumeSlider.value = this.volume;
        this.detailVolumeSlider.value = this.volume;
    }

    handleTrackEnd() {
        if (this.playbackMode === "repeat") {
            this.playCurrentTrack();
        } else {
            this.playNextTrack();
        }
    }

    showTrackDetail() {
        this.albumDisplay.classList.remove('active');
        this.trackDetailView.classList.add('active');
        this.miniPlayer.classList.remove('active');
        this.updateDetailView();
    }

    showTrackList() {
        this.trackDetailView.classList.remove('active');
        this.albumDisplay.classList.add('active');
        if (this.isPlaying) {
            this.miniPlayer.classList.add('active');
        }
        this.hideLyrics();
    }

    updateDetailView() {
        const currentTrack = this.getCurrentTrack();
        if (currentTrack) {
            this.detailCoverImage.src = "Downloads/kai.jpg";
            this.detailTrackTitle.textContent = currentTrack.title;
            this.detailTrackArtist.textContent = currentTrack.artist;
        }
    }

    toggleLyrics() {
        this.showingLyrics = !this.showingLyrics;
        if (this.showingLyrics) {
            this.showLyrics();
        } else {
            this.hideLyrics();
        }
    }

    showLyrics() {
        this.lyricsSection.classList.add('active');
        const currentTrack = this.getCurrentTrack();
        
        const lyricsExamples = {
            "are you happy": `Are you happy with your life?
Looking in the mirror late at night
Wondering if you got it right
Are you happy with your life?`,

            "im all blessed the fuck up": `I'm all blessed the fuck up
Feeling high, can't get enough
Living life, feeling tough
I'm all blessed the fuck up`,

            "basement": `In the basement where we hide
All the secrets deep inside
Where the broken hearts reside
In the basement where we hide`,

            "amy": `Amy, with your golden hair
Dancing without any care
Living like you own the air
Amy, with your golden hair`,

            "mirrors": `Mirrors on the wall
Tell me who I am after all
When the night begins to fall
Mirrors on the wall`,

            "chelsea smile": `Chelsea smile on a rainy day
Watching all the world decay
Having nothing left to say
Chelsea smile on a rainy day`,

            "444": `444 in my dreams
Nothing is what it seems
Flowing like the deepest streams
444 in my dreams`,

            "parasocial freestyle": `Parasocial, can't you see?
You don't really know me
Living through your fantasy
Parasocial, can't you see?`,

            "designer's paradise": `Designer's paradise, so divine
Living on this perfect line
Making everything look fine
Designer's paradise, so divine`,

            "fire walk with me": `Fire walk with me tonight
Through the darkness, towards the light
Making everything feel right
Fire walk with me tonight`,

            "madam": `Madam, with your eyes so cold
Selling stories never told
Worth much more than silver or gold
Madam, with your eyes so cold`,

            "sirens": `Sirens in the distance cry
As the night is passing by
Under this celestial sky
Sirens in the distance cry`,

            "slave to the rhythm": `Slave to the rhythm, can't break free
This is all that I can be
For everyone and all to see
Slave to the rhythm, can't break free`,

            "drive": `Drive through the city lights
Through these endless, lonely nights
Chasing all the fading sights
Drive through the city lights`,

            "welcome to forever": `Welcome to forever, take my hand
In this eternal, promised land
Where time turns into sand
Welcome to forever, take my hand`,

            "0 tears": `0 tears left to cry
Under this indifferent sky
Watching all the world go by
0 tears left to cry`,

            "damage": `All this damage in my heart
Tearing my soul apart
I'm trying to make a brand new start
But all this damage in my heart`
        };
        
        const lyrics = lyricsExamples[currentTrack.title] || 
                      `Текст песни для "${currentTrack.title}"\n\nТекст пока недоступен.`;
        
        this.lyricsText.textContent = lyrics;
    }

    hideLyrics() {
        this.lyricsSection.classList.remove('active');
        this.showingLyrics = false;
    }

    downloadTrack() {
        const currentTrack = this.getCurrentTrack();
        if (currentTrack && currentTrack.src) {
            const link = document.createElement('a');
            link.href = currentTrack.src;
            link.download = `${currentTrack.artist} - ${currentTrack.title}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            const originalText = this.downloadButton.querySelector('span');
            const originalHTML = originalText.innerHTML;
            originalText.innerHTML = '✓ Скачано!';
            
            setTimeout(() => {
                originalText.innerHTML = originalHTML;
            }, 2000);
        }
    }
}

const trackList = [
    { id: 1, title: "are you happy", artist: "Kai Angel", src: "Music/Kai Angel - are you happy.mp3" },
    { id: 2, title: "im all blessed the fuck up", artist: "Kai Angel", src: "Music/Kai Angel - im all blessed the fuck up.mp3" },
    { id: 3, title: "basement", artist: "Kai Angel", src: "Music/Kai Angel - basement.mp3" },
    { id: 4, title: "amy", artist: "Kai Angel", src: "Music/Kai Angel - amy.mp3" },
    { id: 5, title: "mirrors", artist: "Kai Angel", src: "Music/Kai Angel - mirrors.mp3" },
    { id: 6, title: "chelsea smile", artist: "Kai Angel", src: "Music/Kai Angel - chelsea smile.mp3" },
    { id: 7, title: "444", artist: "Kai Angel", src: "Music/Kai Angel - 444.mp3" },
    { id: 8, title: "parasocial freestyle", artist: "Kai Angel", src: "Music/Kai Angel - parasocial freestyle.mp3" },
    { id: 9, title: "designer's paradise", artist: "Kai Angel", src: "Music/Kai Angel - designer's paradise.mp3" },
    { id: 10, title: "fire walk with me", artist: "Kai Angel", src: "Music/Kai Angel - fire walk with me.mp3" },
    { id: 11, title: "madam", artist: "Kai Angel", src: "Music/Kai Angel - madam.mp3" },
    { id: 12, title: "sirens", artist: "Kai Angel", src: "Music/Kai Angel - sirens.mp3" },
    { id: 13, title: "slave to the rhythm", artist: "Kai Angel", src: "Music/Kai Angel - slave to the rhythm.mp3" },
    { id: 14, title: "drive", artist: "Kai Angel", src: "Music/Kai Angel - drive.mp3" },
    { id: 15, title: "welcome to forever", artist: "Kai Angel", src: "Music/Kai Angel - welcome to forever.mp3" },
    { id: 16, title: "0 tears", artist: "Kai Angel", src: "Music/Kai Angel - 0 tears.mp3" },
    { id: 17, title: "damage", artist: "Kai Angel", src: "Music/Kai Angel - damage.mp3" }
];

document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer({ tracks: trackList });
});