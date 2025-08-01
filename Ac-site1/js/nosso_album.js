// static/js/nosso_album.js

document.addEventListener('DOMContentLoaded', () => {
    

    // --- SETUP INICIAL E VARIÁVEIS GLOBAIS ---
    const photoGrid = document.getElementById('photo-grid');
    if (!photoGrid) return; // Sai se não estiver na página do álbum

    const fileInput = document.getElementById('file-input');
    const uploadCard = document.querySelector('.upload-card');
    const modal = document.getElementById('photo-modal');
    const modalImage = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    const closeModalBtn = document.getElementById('modal-close');
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');

    const csrfToken = photoGrid.dataset.csrfToken;
    const uploadUrl = photoGrid.dataset.uploadUrl;
    const deleteUrlBase = photoGrid.dataset.deleteUrlBase;

    let galleryImages = [];
    let currentIndex = 0;

    function updateGallery() {
        galleryImages = [];
        document.querySelectorAll('.photo-card:not(.upload-card) img').forEach(img => {
            galleryImages.push({
                src: img.src,
                caption: img.dataset.caption,
                date: img.dataset.date
            });
        });
    }

    updateGallery(); // Mapeia todas as imagens quando a página carrega

    // --- LÓGICA DO MODAL (VISUALIZAÇÃO E NAVEGAÇÃO) ---
    function showImage(index) {
        if (index < 0 || index >= galleryImages.length) {
            return;
        }
        currentIndex = index;
        const imageData = galleryImages[currentIndex];
        
        modalImage.src = imageData.src;
        if (imageData.caption || imageData.date) {
            modalCaption.innerHTML = `${imageData.caption} <br> <small>${imageData.date}</small>`;
        } else {
            modalCaption.innerHTML = "";
        }
        modal.style.display = 'flex';
    }
    
    function showNextImage() {
        showImage(currentIndex + 1);
    }
    
    function showPrevImage() {
        showImage(currentIndex - 1);
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    nextBtn.addEventListener('click', showNextImage);
    prevBtn.addEventListener('click', showPrevImage);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
        if (modal.style.display === 'flex') {
            if (event.key === 'Escape') closeModal();
            if (event.key === 'ArrowRight') showNextImage();
            if (event.key === 'ArrowLeft') showPrevImage();
        }
    });

    // --- LÓGICA DE UPLOAD, DELETE E ABRIR MODAL ---
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('imagem', file);

        fetch(uploadUrl, {
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken},
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                const newPhotoCard = document.createElement('div');
                newPhotoCard.classList.add('photo-card');
                newPhotoCard.innerHTML = `
                    <button class="delete-btn" data-id="${data.id}">×</button>
                    <img src="${data.url}" alt="" data-caption="" data-date="">
                `;
                uploadCard.insertAdjacentElement('afterend', newPhotoCard);
                updateGallery(); // ATUALIZA A GALERIA COM A NOVA FOTO
            } else {
                alert('Erro no upload: ' + data.message);
            }
        });
        fileInput.value = '';
    });

    photoGrid.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-btn')) {
            if (!confirm('Tem certeza?')) return;
            const photoId = event.target.dataset.id;
            const finalDeleteUrl = deleteUrlBase.replace('0', photoId);

            fetch(finalDeleteUrl, {
                method: 'POST',
                headers: {'X-CSRFToken': csrfToken},
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    event.target.closest('.photo-card').remove();
                    updateGallery(); // ATUALIZA A GALERIA APÓS DELETAR
                } else {
                    alert('Erro ao excluir: ' + data.message);
                }
            });
        }
        else if (event.target.tagName === 'IMG' && !event.target.closest('.upload-card')) {
            const clickedSrc = event.target.src;
            const imageIndex = galleryImages.findIndex(img => img.src === clickedSrc);
            showImage(imageIndex);
        }
    });
});