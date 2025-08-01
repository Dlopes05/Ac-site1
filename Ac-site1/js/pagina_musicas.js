 let players = {};
        function onYouTubeIframeAPIReady() { initializePlayers(); }
        function initializePlayers() {
            const allMusicCards = document.querySelectorAll('.music-card');
            allMusicCards.forEach((card, index) => {
                const audioPlayer = card.querySelector('.audio-player');
                const ytContainer = card.querySelector('.youtube-player-container');
                const playPauseBtn = card.querySelector('.play-pause-btn');
                const stopBtn = card.querySelector('.stop-btn');
                const playerId = `player-${index}`;
                if (audioPlayer) {
                    players[playerId] = { type: 'audio', player: audioPlayer, card: card };
                    playPauseBtn.addEventListener('click', () => handlePlayPause(playerId));
                    stopBtn.addEventListener('click', () => handleStop(playerId));
                    audioPlayer.addEventListener('ended', () => handleStop(playerId));
                     // NOVO: ATUALIZA A BARRA DE PROGRESSO
    const progressBar = card.querySelector('.progress-bar');
    audioPlayer.addEventListener('timeupdate', () => {
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    });
                } else if (ytContainer) {
                    const videoId = card.dataset.videoId;
                    if (videoId) {
                        const ytPlayer = new YT.Player(ytContainer.id, {
                            height: '1', width: '1', videoId: videoId,
                            playerVars: { 'origin': window.location.origin },
                            events: { 'onStateChange': (event) => { if (event.data === YT.PlayerState.ENDED) handleStop(playerId); } }
                        });
                        players[playerId] = { type: 'youtube', player: ytPlayer, card: card };
                        playPauseBtn.addEventListener('click', () => handlePlayPause(playerId));
                        stopBtn.addEventListener('click', () => handleStop(playerId));
                    }
                }
            });
        }
        function stopAllPlayers(exceptId = null) {
            for (const id in players) {
                if (id !== exceptId) {
                    const p = players[id];
                    if (p.type === 'audio') p.player.pause();
                    else if (p.type === 'youtube' && p.player && typeof p.player.pauseVideo === 'function') p.player.pauseVideo();
                    p.card.querySelector('.play-pause-btn').innerHTML = '▶️';
                }
            }
        }
        function handlePlayPause(playerId) {
            stopAllPlayers(playerId);
            const p = players[playerId];
            if (!p) return;
            const playPauseBtn = p.card.querySelector('.play-pause-btn');
            let isPlaying;
            if (p.type === 'audio') {
                isPlaying = p.player.currentTime > 0 && !p.player.paused;
                if (isPlaying) { p.player.pause(); playPauseBtn.innerHTML = '▶️'; }
                else { p.player.play(); playPauseBtn.innerHTML = '⏸️'; }
            } else if (p.type === 'youtube') {
                if (p.player && typeof p.player.getPlayerState === 'function') {
                    isPlaying = p.player.getPlayerState() === YT.PlayerState.PLAYING;
                    if (isPlaying) { p.player.pauseVideo(); playPauseBtn.innerHTML = '▶️'; }
                    else { p.player.unMute(); p.player.playVideo(); playPauseBtn.innerHTML = '⏸️'; }
                }
            }
        }
        function handleStop(playerId) {
            const p = players[playerId];
            if (!p) return;
            const playPauseBtn = p.card.querySelector('.play-pause-btn');
            if (p.type === 'audio') { p.player.pause(); p.player.currentTime = 0; }
            else if (p.type === 'youtube' && typeof p.player.stopVideo === 'function') { p.player.stopVideo(); }
            playPauseBtn.innerHTML = '▶️';
        }
        if (typeof YT === 'object' && typeof YT.Player === 'function') { onYouTubeIframeAPIReady(); }

        document.addEventListener('DOMContentLoaded', () => {
    const musicList = document.querySelector('.music-list');
    if (!musicList) return;

    const modal = document.getElementById('lyrics-modal');
    const closeModalBtn = document.getElementById('lyrics-close');
    const lyricsBody = document.querySelector('#lyrics-body pre');

    function openLyricsModal(card) {
        const lyricsText = card.querySelector('.lyrics-text').innerHTML;
        lyricsBody.innerHTML = lyricsText;
        modal.style.display = 'flex';
    }

    function closeLyricsModal() {
        modal.style.display = 'none';
    }

    musicList.addEventListener('click', (event) => {
        if (event.target.classList.contains('lyrics-btn')) {
            const card = event.target.closest('.music-card');
            openLyricsModal(card);
        }
    });

    closeModalBtn.addEventListener('click', closeLyricsModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeLyricsModal();
        }
    });
});