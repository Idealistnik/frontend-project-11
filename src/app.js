import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import renderErrors from './render.js';
import resources from './locales/index.js';
import axios from 'axios';
import rssParser from './parser.js';
import uniqueId from 'lodash/uniqueId.js';


const addFidAndPosts = (data, watchedState) => {
  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const newFid = {
    id: uniqueId(),
    title,
    description,
  }
  watchedState.fids.unshift(newFid);
  const posts = data.querySelectorAll('item');
  posts.forEach((post) => {
    const title = post.querySelector('title').textContent;
    const description = post.querySelector('description').textContent;
    const link = post.querySelector('link').textContent;
    const newPost = {
      id: uniqueId(),
      idFid: newFid.id,
      title,
      description,
      link,
    }
    watchedState.posts.unshift(newPost);
    console.log(JSON.stringify(watchedState, null, '    '));
  
  })
};

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
  schema.validate(url)
    .then((validUrl) => {
      watchedState.form.error = '';
      watchedState.status = 'downloading';
      axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(validUrl)}`)
        .then((response) => {
          const data = rssParser(response.data.contents);
          console.log(data)
          const error = data.querySelector('parsererror');
          if (error) {
            watchedState.status = 'downloadedFail';
            watchedState.form.error = i18n.t('errors.request.valid');
          } else if (!error) {
            console.log(data);
            watchedState.form.validUrls.push(url);
            watchedState.status = 'downloadedSuccess';
            addFidAndPosts(data, watchedState);
            watchedState.status = 'rendering';
          }
        })
        .catch(() => {
          watchedState.form.error = i18n.t('errors.request.network');
          watchedState.status = 'downloadedFail';
        });
    })
    .catch((e) => {
      watchedState.form.error = e.message;
      elements.input.focus();
      console.log(JSON.stringify(watchedState, null, '    '));
    });

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
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    errorElement: document.querySelector('.feedback'),
    submitButton: document.querySelector('.rss-form button'),
    postsContainer: document.querySelector('.posts'),
    fidsContainer: document.querySelector('.feeds'),
  };
  const i18n = i18next.createInstance();
  const defaultLang = 'ru';
  i18n.init({
    debug: false,
    lng: defaultLang,
    resources,
  })
    .then(() => {
      const watchedState = onChange(state, (path, currentValue, previousValue) => renderErrors(elements, watchedState, i18n, path, currentValue, previousValue));
      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        watchedState.status = 'filling';
        const currentInput = event.target.querySelector('[name="url"]');
        const currentUrl = currentInput.value;
        validateUrl(currentUrl, watchedState, elements, i18n);
      });
    })
};
