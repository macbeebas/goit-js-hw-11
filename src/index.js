import axios from 'axios';

import Notiflix from 'notiflix';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_PATH = 'https://pixabay.com/api';
const API_KEY = '39270567-a82d11f42742c28a9e6d14c5c';

const DEFAULT_PIXABAY_PARAMS = {
  key: API_KEY,
  per_page: '40',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
};

async function runPixabay({ q = '', page = '1' }) {
  try {
    const querystring = new URLSearchParams({
      ...DEFAULT_PIXABAY_PARAMS,
      page,
      q,
    });

    const response = await axios.get(`${API_PATH}?${querystring}`);
    if (!response.status === 200) {
      if (response.status === 400) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return [];
      }
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return [];
    }
    const photos = response.data.hits;
    const hits = response.data.totalHits;
    if (hits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else Notiflix.Notify.success(`Hooray! We found ${hits} images.`);
    return photos;
  } catch (e) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
}

const createPhotoElement = photo => {
  const photoElement = document.createElement('a');
  photoElement.href = photo.largeImageURL;
  photoElement.classList.add('photo-card');

  const photoElementContent = `\n<img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" />`;
  const photoElementInfo = `
  <div class="info">
    <p class="info-item"><b>Likes</b><br />${photo.likes}</p>
    <p class="info-item"><b>Views</b><br />${photo.views}</p>
    <p class="info-item"><b>Comments</b><br />${photo.comments}</p>
    <p class="info-item"><b>Downloads</b><br />${photo.downloads}</p>
  </div>
  `;
  photoElement.insertAdjacentHTML('afterbegin', photoElementContent);
  photoElement.insertAdjacentHTML('beforeend', photoElementInfo);

  return photoElement;
};

function drawPhotos({ photos, page }) {
  const photoContainer = document.querySelector('#photos');
  if (page === '1') {
    photoContainer.innerHTML = '';
  }

  const children = photos.map(createPhotoElement);
  photoContainer.append(...children);
  lightbox.refresh();
}

async function loadPhotos({ q, page }) {
  const photos = await runPixabay({ q, page });
  if (photos.error) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  drawPhotos({ photos, page });
  return;
}

async function searchForPhotos(e) {
  e.preventDefault();
  e.target.page.value = '1';
  const q = e.target.q.value;
  await loadPhotos({ q, page: '1' });
}

async function scrollHandler() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (Math.ceil(scrollTop) + clientHeight >= scrollHeight) {
    const searchForm = document.querySelector('#search-form');
    const page = parseInt(searchForm.page.value);
    searchForm.page.value = page + 1;
    await loadPhotos({ q: searchForm.q.value, page: searchForm.page.value });
  }
}

const searchForm = document.querySelector('#search-form');
searchForm.addEventListener('submit', searchForPhotos);

window.addEventListener('scroll', scrollHandler);

let lightbox = new SimpleLightbox('.gallery a', {
  captionSelector: 'img',
  captionsData: 'alt',
  captionDelay: 250,
});
