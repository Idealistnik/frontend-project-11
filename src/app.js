import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './render.js';
import resources from './locales/index.js';
import axios from 'axios';
import rssParser from './parser.js';
import uniqueId from 'lodash/uniqueId.js';

const validateUrl = (url, watchedState, elements, i18n) => {
  yup.setLocale({
    mixed: {
      required: i18n.t('errors.validation.required'),
      notOneOf: i18n.t('errors.validation.notOneOf'),
    },
    string: {
      url: i18n.t('errors.validation.valid'),
    }
  });
  const schema = yup.string().url().required().notOneOf(watchedState.form.validUrls);
  return schema.validate(url)
    .then((validUrl) => {
      watchedState.form.error = '';
      // watchedState.form.validUrls.push(validUrl); убрал отсюда т.к. попадали ссылки без rss
      // watchedState.status = 'downloading';
      watchedState.status = 'downloadStart'; // добавил тут
      return validUrl;
      // return Promise.resolve(validUrl);
    })
    .catch((e) => {
      watchedState.form.error = e.message;
      elements.input.focus();
      return Promise.reject(e);
    });
};

const downloadData = (watchedState, validatedUrl, i18n) => {
  return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(validatedUrl)}`)
    .then((response) => {
      const data = rssParser(response.data.contents);
      const error = data.querySelector('parsererror');
      if (error) {
        watchedState.form.error = i18n.t('errors.request.valid');
        watchedState.status = 'downloadFinish';
        console.log(JSON.stringify(watchedState, null, '   '));
        return Promise.reject(new Error(i18n.t('errors.request.valid')));
      } else {
        watchedState.form.validUrls.push(validatedUrl);
        watchedState.status = 'downloadFinish';
        return data;
      }
    })
    .catch((error) => {
      if (error.message !== i18n.t('errors.request.valid')) {
        watchedState.form.error = i18n.t('errors.request.network');
      }
      return Promise.reject(error);
    });
};

const processData = (data, watchedState) => {
  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const posts = data.querySelectorAll('item');
  const newFid = {
    id: uniqueId(),
    title,
    description,
  }
  watchedState.fids.unshift(newFid);
  posts.forEach((currentPost) => {
    const title = currentPost.querySelector('title').textContent;
    const description = currentPost.querySelector('description').textContent;
    const link = currentPost.querySelector('link').textContent;
    const post = {
      id: uniqueId(),
      idFid: newFid.id,
      title,
      description,
      link,
    };
    watchedState.posts.unshift(post);
  });
  watchedState.status = 'rendering';
  return;
};
const checkPosts = (validatedUrl, watchedState) => {
  const { fids, posts } = watchedState;
  return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(validatedUrl)}`)
    .then((response) => {
      const data = rssParser(response.data.contents);
      const titleFid = data.querySelector('title').textContent;
      const currentPosts = data.querySelectorAll('item');
      currentPosts.forEach((post) => {
        const title = post.querySelector('title').textContent;
        const description = post.querySelector('description').textContent;
        const link = post.querySelector('link').textContent;
        if (!posts.find((post) => post.title === title)) {
          const currentFidId = fids.find((fid) => fid.title = titleFid);
          const newPost = {
            id: uniqueId(),
            idFid: currentFidId,
            title,
            description,
            link,
          }
          watchedState.posts.unshift(newPost);
          //  console.log(JSON.stringify(watchedState.posts.length, null, '    '));
        }
      })
    })
    .catch((e) => {
      return Promise.reject(e);
    });
};
const updatePosts = (watchedState) => {
  const promises = watchedState.form.validUrls.map((validatedUrl) => checkPosts(validatedUrl, watchedState)
    .catch((e) => console.log(e)));
  return Promise.all(promises)
    .then(() => setTimeout(() => updatePosts(watchedState), 0));
};

export default () => {
  const state = {
    form: {
      validUrls: [],
      error: '',
    },
    status: '',
    fids: [],
    posts: [],
    ui: {
      visitedLinks: [],
      modalLinkId: null,
    }
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    errorElement: document.querySelector('.feedback'),
    submitButton: document.querySelector('.rss-form button'),
    postsContainer: document.querySelector('.posts'),
    fidsContainer: document.querySelector('.feeds'),
    modalContainer: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalCloseButton: document.querySelector('.close'),
    // modalContent: document.querySelector('.modal-content'),
    modalFooter: document.querySelector('.modal-footer'),
    modalFooterCloseButton: document.querySelector('[data-bs-dismiss="modal"].btn-secondary'),
    body: document.querySelector('body'),

  };
  const i18n = i18next.createInstance();
  const defaultLang = 'ru';
  i18n.init({
    debug: false,
    lng: defaultLang,
    resources,
  })
    .then(() => {

      const watchedState = onChange(state, (path, currentValue, applyData) => render(elements, watchedState, i18n, path, currentValue, applyData));
      watchedState.status = 'filling';
      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const currentInput = event.target.querySelector('[name="url"]');
        const currentUrl = currentInput.value;
        validateUrl(currentUrl, watchedState, elements, i18n)
          .then((validatedUrl) => downloadData(watchedState, validatedUrl, i18n))
          .then((data) => processData(data, watchedState))
          .catch((e) => console.log(e)); // в любом случае нужен кетч даже если он внутри validateUrl?
      });
      setTimeout(() => updatePosts(watchedState), 5000);
      elements.postsContainer.addEventListener('click', (event) => {
        // event.preventDefault();
        if (event.target.matches('a')) { // или event.target.tagName === 'A'
          const id = event.target.dataset.id;
          watchedState.ui.visitedLinks.push(id);
        }
        if (event.target.matches('button')) {
          const link = event.target.previousElementSibling;
          const id = link.dataset.id;
          watchedState.ui.visitedLinks.push(id);
          watchedState.ui.modalLinkId = id;
        }
      });
  
      elements.modalContainer.querySelectorAll('[data-bs-dismiss="modal"]').forEach((closeButton) => {
        closeButton.addEventListener('click', (event) => {
          event.preventDefault();
          watchedState.ui.modalLinkId = null;
        })
      });
    });
};


// console.log(JSON.stringify(watchedState, null, '    '));

// validateUrl(currentUrl, watchedState, elements, i18n)
// .then((validatedUrl) => {
//   setTimeout(function repeat() {
//     newFunc(watchedState, validatedUrl, i18n);
//     setTimeout(repeat, 5000);
//   }, 1000);
// })
// .catch((e) => console.log(e)); // лишний если есть внутри validate?



// const updateFids = (watchedState, i18n) => {
//   const promises = watchedState.form.validUrls.map((url) => downloadData(watchedState, url, i18n)
//     .then((data) => processingCurrentData(data, watchedState))
//     .catch((e) => console.log(e)));
//   return Promise.all(promises)
//     .then(() => setTimeout(() => updateFids(watchedState, i18n), 5000));
// };
