document.addEventListener('DOMContentLoaded', () => {

    // --- VARIÁVEIS GLOBAIS ---
    let galleryPhotos = [];
    let currentPhotoIndex = 0;
    let players = {}; // Guarda UMA instância de cada player (áudio ou vídeo)
    
    // --- FUNÇÃO PARA RENDERIZAR O RODAPÉ (EVITA REPETIÇÃO) ---
    function renderFooter() {
        const footer = document.querySelector('footer');
        if (footer) {
            footer.innerHTML = `
                <nav class="navbar navbar-expand">
                    <div class="container-fluid">
                        <ul class="navbar-nav">
                            <li class="nav-item"><a class="nav-link" href="index.html">Início</a></li>
                            <li class="nav-item"><a class="nav-link" href="album.html">Nosso Álbum</a></li>
                            <li class="nav-item"><a class="nav-link" href="musicas.html">Músicas pra Você</a></li>
                        </ul>
                    </div>
                </nav>
            `;
        }
    }
    renderFooter();
    

    // PONTO CRÍTICO: Inicializando os carrosséis com o SWIPE DESATIVADO
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        new bootstrap.Carousel(carousel, {
            interval: false, // NÃO desliza sozinho
            touch: true,    // NÃO permite arrastar com o dedo
            wrap: true,     // Volta para o início no final
        });
    });

    // --- 1. LÓGICA DA PÁGINA DE FOTOS ---
    const photoGridDesktop = document.getElementById('photo-grid-desktop');
    const photoCarouselMobile = document.querySelector('#photo-carousel-mobile .carousel-inner');
    const photoModal = document.getElementById('photo-modal');

    if (photoGridDesktop && photoCarouselMobile) {
        galleryPhotos = [...galleryData];
        galleryData.forEach((photo, index) => {
            const photoCardHTML = `
                <div class="card h-100 photo-card">
                    <img src="${photo.src}" class="card-img-top" alt="${photo.caption}" data-bs-toggle="modal" data-bs-target="#photo-modal" data-photo-index="${index}">
                </div>`;
            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = photoCardHTML;
            photoGridDesktop.appendChild(col);
            const carouselItem = document.createElement('div');
            carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            carouselItem.innerHTML = photoCardHTML;
            photoCarouselMobile.appendChild(carouselItem);
        });
        document.querySelector('.loading-spinner-wrapper').style.display = 'none';
        document.querySelector('.content-wrapper').classList.remove('visually-hidden');
    }

    if (photoModal) {
        const modalImage = document.getElementById('modal-image');
        const modalCaption = document.getElementById('modal-caption');
        const prevBtn = document.getElementById('modal-prev');
        const nextBtn = document.getElementById('modal-next');
        function showPhotoInModal(index) {
            if (index < 0 || index >= galleryPhotos.length) return;
            currentPhotoIndex = index;
            const photo = galleryPhotos[index];
            modalImage.src = photo.src;
            modalCaption.innerHTML = `${photo.caption}<br><small>${photo.date}</small>`;
        }
        photoModal.addEventListener('show.bs.modal', e => showPhotoInModal(parseInt(e.relatedTarget.dataset.photoIndex)));
        prevBtn.addEventListener('click', () => showPhotoInModal(currentPhotoIndex > 0 ? currentPhotoIndex - 1 : galleryPhotos.length - 1));
        nextBtn.addEventListener('click', () => showPhotoInModal(currentPhotoIndex < galleryPhotos.length - 1 ? currentPhotoIndex + 1 : 0));
    }

    // --- 2. LÓGICA DA PÁGINA DE MÚSICAS ---
    const musicGridDesktop = document.getElementById('music-grid-desktop');
    const musicCarouselMobile = document.querySelector('#music-carousel-mobile .carousel-inner');
    const lyricsModal = document.getElementById('lyrics-modal');

    if (musicGridDesktop && musicCarouselMobile) {
        musicData.forEach((music, index) => {
            const playerId = `player-${index}`;
            const musicCardContentHTML = `
                <div class="cover">
                    <img src="${music.cover}" alt="Capa de ${music.title}">
                </div>
                <div class="info card-body d-flex flex-column">
                    <h2 class="title h5">${music.title}</h2>
                    <p class="artist card-text text-muted small">${music.artist}</p>
                    <div class="mt-auto">
                        <div class="player-controls d-flex align-items-center gap-2">
                            <button class="btn play-pause-btn" data-player-id="${playerId}">▶️</button>
                            <button class="btn stop-btn" data-player-id="${playerId}">⏹️</button>
                            <span class="duration small text-muted">${music.duration}</span>
                            ${music.lyrics ? `<button class="btn lyrics-btn" data-bs-toggle="modal" data-bs-target="#lyrics-modal" data-lyrics-index="${index}">Letra</button>` : ''}
                        </div>
                        ${music.source.type === 'mp3' ? `<div class="progress-container mt-2" data-player-id="${playerId}"><div class="progress-bar"></div></div>` : ''}
                    </div>
                </div>`;
            const col = document.createElement('div');
            col.className = 'col-lg-6';
            col.innerHTML = `<div class="card music-card shadow-sm d-flex flex-row" data-player-id="${playerId}">${musicCardContentHTML}</div>`;
            musicGridDesktop.appendChild(col);
            const carouselItem = document.createElement('div');
            carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            carouselItem.innerHTML = `<div class="card music-card shadow-sm h-100" data-player-id="${playerId}">${musicCardContentHTML}</div>`;
            musicCarouselMobile.appendChild(carouselItem);
        });
        
        initializeMusicPlayers();

         document.querySelector('.loading-spinner-wrapper').style.display = 'none';
        document.querySelector('.content-wrapper').classList.remove('visually-hidden');
    }
    
    function initializeMusicPlayers() {
        musicData.forEach((music, index) => {
            const playerId = `player-${index}`;
            if (music.source.type === 'mp3') {
                const audio = new Audio(music.source.src);
                players[playerId] = { type: 'audio', player: audio };
                
                audio.addEventListener('timeupdate', () => {
                    if (audio.duration) {
                        const progressPercent = (audio.currentTime / audio.duration) * 100;
                        document.querySelectorAll(`.progress-container[data-player-id="${playerId}"] .progress-bar`).forEach(bar => {
                            bar.style.width = `${progressPercent}%`;
                        });
                    }
                });
                audio.addEventListener('ended', () => stopPlayer(playerId, true));
            }
        });
    }

    window.onYouTubeIframeAPIReady = () => {
        musicData.forEach((music, index) => {
            if (music.source.type === 'youtube') {
                const playerId = `player-${index}`;
                players[playerId] = {
                    type: 'youtube',
                    player: new YT.Player(document.createElement('div'), {
                        videoId: music.source.id,
                        events: { 'onStateChange': e => { if (e.data === YT.PlayerState.ENDED) stopPlayer(playerId, true); } }
                    })
                };
            }
        });
    };

    // PONTO CRÍTICO 1: Nova função que apenas pausa um player
    function pausePlayer(playerId) {
        const p = players[playerId];
        if (!p) return;

        if (p.type === 'audio') {
            p.player.pause();
        } else if (p.type === 'youtube' && p.player.pauseVideo) {
            p.player.pauseVideo();
        }
        document.querySelectorAll(`[data-player-id="${playerId}"].play-pause-btn`).forEach(btn => btn.innerHTML = '▶️');
    }

    // PONTO CRÍTICO 2: Função que para e reseta um player
    function stopPlayer(playerId, resetProgress = true) {
        const p = players[playerId];
        if (!p) return;

        if (p.type === 'audio') {
            p.player.pause();
            if (resetProgress) p.player.currentTime = 0;
        } else if (p.type === 'youtube' && p.player.stopVideo) {
            p.player.stopVideo();
        }
        document.querySelectorAll(`[data-player-id="${playerId}"].play-pause-btn`).forEach(btn => btn.innerHTML = '▶️');
        if (resetProgress) {
             document.querySelectorAll(`.progress-container[data-player-id="${playerId}"] .progress-bar`).forEach(bar => bar.style.width = '0%');
        }
    }
    
    document.body.addEventListener('click', event => {
        const target = event.target;

        // PONTO CRÍTICO 3: Lógica de Play/Pause corrigida
        if (target.closest('.play-pause-btn')) {
            const button = target.closest('.play-pause-btn');
            const playerId = button.dataset.playerId;
            const p = players[playerId];
            if (!p) return;

            let isPlaying;
            if (p.type === 'audio') isPlaying = !p.player.paused && p.player.currentTime > 0;
            else isPlaying = p.player.getPlayerState() === YT.PlayerState.PLAYING;
            
            if (isPlaying) {
                // Se já está tocando, apenas pausa.
                pausePlayer(playerId);
            } else {
                // Se não está tocando, para todos os outros e toca este.
                for (const id in players) {
                    if (id !== playerId) stopPlayer(id, true);
                }
                if (p.type === 'audio') p.player.play();
                else { p.player.unMute(); p.player.playVideo(); }
                document.querySelectorAll(`[data-player-id="${playerId}"].play-pause-btn`).forEach(btn => btn.innerHTML = '⏸️');
            }
        }
        
        if (target.closest('.stop-btn')) {
            const button = target.closest('.stop-btn');
            const playerId = button.dataset.playerId;
            stopPlayer(playerId, true); // O botão Stop sempre reseta
        }

        if (target.closest('.progress-container')) {
            const container = target.closest('.progress-container');
            const playerId = container.dataset.playerId;
            const p = players[playerId];
            if (p && p.type === 'audio' && p.player.duration) {
                const width = container.clientWidth;
                const clickX = event.offsetX;
                p.player.currentTime = (clickX / width) * p.player.duration;
            }
        }
    });

    if (lyricsModal) {
        const lyricsBody = lyricsModal.querySelector('#lyrics-body pre');
        lyricsModal.addEventListener('show.bs.modal', e => {
            const music = musicData[parseInt(e.relatedTarget.dataset.lyricsIndex)];
            lyricsBody.textContent = music.lyrics || 'Letra não disponível.';
        });
    }
});