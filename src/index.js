// Key for me: 39270567-a82d11f42742c28a9e6d14c5c
//
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

async function pingPixabay({ q = '', page = '1' }) {
  try {
    const querystring = new URLSearchParams({
      ...DEFAULT_PIXABAY_PARAMS,
      page,
      q,
    });

    const response = await fetch(`${API_PATH}?${querystring}`);
    console.log('30. "response" is OK?: ', response.ok);
    if (!response.ok) {
      console.log('32. Error! "response" is OK?: ', response.ok);

      if (response.status === 400) {
        console.log('35. Error! "response.status" is: ', response.status);
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return [];
      }
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      console.log('44. response.status: ', response.status);
      return [];
      //   return { error: response.status };
    }

    const { hits: photos } = await response.json();

    return photos;
  } catch (e) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    console.log('56. e.toString(): ', e.toString());
    return;
    // return { error: e.toString() };
  }
}

const getPhotoElement = photo => {
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

  const children = photos.map(getPhotoElement);
  photoContainer.append(...children);
}

async function loadPhotos({ q, page }) {
  const photos = await pingPixabay({ q, page });
  if (photos.error) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    // alert(photos.error);
    console.log('99. photos.error: ', photos.error);
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
  if (scrollTop + clientHeight >= scrollHeight) {
    const searchForm = document.querySelector('#search-form');
    const page = parseInt(searchForm.page.value);
    searchForm.page.value = page + 1;
    await loadPhotos({ q: searchForm.q.value, page: searchForm.page.value });
  }
}

const searchForm = document.querySelector('#search-form');
searchForm.addEventListener('submit', searchForPhotos);

scrollHandler();
window.addEventListener('scroll', scrollHandler);

let lightbox = new SimpleLightbox('.gallery a', {
  captionSelector: 'img',
  captionsData: 'alt',
  captionDelay: 250,
});
