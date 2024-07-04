import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import render from './render.js';
import resources from './locales/index.js';
import rssParser from './parser.js';

const validateUrl = (url, watchedState, elements, schema) => schema.validate(url)
  .then((validUrl) => {
    watchedState.form.error = '';
    watchedState.status = 'downloadStart';
    watchedState.form.validUrls.push(url);
    return validUrl;
  })
  .catch((e) => {
    watchedState.form.error = e.message;
    elements.input.focus();
    return Promise.reject(e);
  });

const getResponse = (url) => {
  const searchParams = `disableCache=true&url=${encodeURIComponent(url)}`;
  return axios.get(`https://allorigins.hexlet.app/get?${searchParams}`);
};

const downloadData = (watchedState, validatedUrl, i18n) => getResponse(validatedUrl)
  .then((response) => {
    const data = rssParser(response.data.contents);
    const error = data.querySelector('parsererror');
    if (error) {
      watchedState.form.error = i18n.t('errors.request.valid');
      watchedState.status = 'downloadFinish';
      return Promise.reject(new Error(i18n.t('errors.request.valid')));
    }
    watchedState.status = 'downloadFinish';
    return data;
  })
  .catch((error) => {
    if (error.message !== i18n.t('errors.request.valid')) {
      watchedState.form.error = i18n.t('errors.request.network');
      watchedState.status = 'downloadFinish';
    }
    return Promise.reject(error);
  });

const processData = (data, watchedState) => {
  const titleFeed = data.querySelector('title').textContent;
  const descriptionFeed = data.querySelector('description').textContent;
  const posts = data.querySelectorAll('item');
  const newFeed = {
    id: uniqueId(),
    title: titleFeed,
    description: descriptionFeed,
  };
  watchedState.feeds.unshift(newFeed);
  posts.forEach((currentPost) => {
    const title = currentPost.querySelector('title').textContent;
    const description = currentPost.querySelector('description').textContent;
    const link = currentPost.querySelector('link').textContent;
    const post = {
      id: uniqueId(),
      idFeed: newFeed.id,
      title,
      description,
      link,
    };
    watchedState.posts.unshift(post);
  });
  watchedState.status = 'rendering';
};
const checkPosts = (validatedUrl, watchedState) => {
  const { feeds, posts } = watchedState;
  return getResponse(validatedUrl)
    .then((response) => {
      const data = rssParser(response.data.contents);
      const titleFeed = data.querySelector('title').textContent;
      const currentPosts = data.querySelectorAll('item');
      currentPosts.forEach((currentPost) => {
        const title = currentPost.querySelector('title').textContent;
        const description = currentPost.querySelector('description').textContent;
        const link = currentPost.querySelector('link').textContent;
        if (!posts.find((post) => post.title === title)) {
          const currentFeedId = feeds.find((feed) => feed.title === titleFeed);
          const newPost = {
            id: uniqueId(),
            idFeed: currentFeedId,
            title,
            description,
            link,
          };
          watchedState.posts.unshift(newPost);
        }
      });
    })
    .catch((e) => Promise.reject(e));
};
const updatePosts = (watchedState) => {
  const promises = watchedState.form.validUrls
    .map((validatedUrl) => checkPosts(validatedUrl, watchedState)
      .catch((e) => console.error(e)));
  const requestInterval = 5000;
  return Promise.all(promises)
    .then(() => setTimeout(() => updatePosts(watchedState), requestInterval));
};

export default () => {
  const state = {
    form: {
      validUrls: [],
      error: '',
    },
    status: '',
    feeds: [],
    posts: [],
    ui: {
      visitedLinks: [],
      modalLinkId: null,
    },
  };
  const elements = {
    body: document.querySelector('body'),
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    errorElement: document.querySelector('.feedback'),
    submitButton: document.querySelector('.rss-form button'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modal: {
      modalContainer: document.querySelector('.modal'),
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      modalCloseButton: document.querySelector('.close'),
      modalFooter: document.querySelector('.modal-footer'),
      modalFooterCloseButton: document.querySelector('[data-bs-dismiss="modal"].btn-secondary'),
    },
  };
  const i18n = i18next.createInstance();
  const defaultLang = 'ru';
  i18n.init({
    debug: false,
    lng: defaultLang,
    resources,
  })
    .then(() => {
      const watchedState = onChange(
        state,
        (path, currentValue) => render(elements, watchedState, i18n, path, currentValue),
      );

      yup.setLocale({
        mixed: {
          required: i18n.t('errors.validation.required'),
          notOneOf: i18n.t('errors.validation.notOneOf'),
        },
        string: {
          url: i18n.t('errors.validation.valid'),
        },
      });

      updatePosts(watchedState);
      watchedState.status = 'filling';

      elements.form.addEventListener('submit', (event) => {
        const schema = yup.string().url().required().notOneOf(watchedState.form.validUrls);
        event.preventDefault();
        const currentData = new FormData(event.target);
        const currentUrl = currentData.get('url');
        validateUrl(currentUrl, watchedState, elements, schema)
          .then((validatedUrl) => downloadData(watchedState, validatedUrl, i18n))
          .then((data) => processData(data, watchedState))
          .catch((e) => console.error(e));
      });

      elements.postsContainer.addEventListener('click', (event) => {
        if (event.target.matches('a')) {
          const { id } = event.target.dataset;
          watchedState.ui.visitedLinks.push(id);
        }
        if (event.target.matches('button')) {
          const link = event.target.previousElementSibling;
          const { id } = link.dataset;
          watchedState.ui.visitedLinks.push(id);
          watchedState.ui.modalLinkId = id;

          elements.modal.modalContainer.querySelectorAll('[data-bs-dismiss="modal"]').forEach((closeButton) => {
            closeButton.addEventListener('click', (e) => {
              e.preventDefault();
              watchedState.ui.modalLinkId = null;
            });
          });
        }
      });
    });
};
