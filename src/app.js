import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import renderErrors from './render.js';
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
      watchedState.form.validUrls.push(validUrl);
      watchedState.status = 'downloading';
      return Promise.resolve(validUrl);
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
        watchedState.status = 'downloadedFail';
        watchedState.form.error = i18n.t('errors.request.valid');
        return Promise.reject(i18n.t('errors.request.valid'));
      } else if (!error) {
        // watchedState.form.validUrls.push(validatedUrl);
        watchedState.status = 'downloadedSuccess';
        // console.log(data);
        // console.log(JSON.stringify(watchedState, null, '    '));
        return Promise.resolve(data);
      }
    })
    .catch((e) => {
      watchedState.form.error = i18n.t('errors.request.network');
      watchedState.status = 'downloadedFail';
      return Promise.reject(e);
    });
};
const processingData = (data, watchedState) => {
  const { fids, posts } = watchedState;

  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const newPosts = data.querySelectorAll('item');

  if (!fids.find((fid) => fid.title === title)) {
    const newFid = {
      id: uniqueId(),
      title,
      description,
    }
    watchedState.fids.unshift(newFid);

    newPosts.forEach((post) => {
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
      // console.log(JSON.stringify(watchedState, null, '    '));
    })
    watchedState.status = 'rendering';
    return;
  }
  const currentFid = fids.find((fid) => fid.title === title);
  console.log(currentFid);
  newPosts.forEach((post) => {
    const title = post.querySelector('title').textContent;
    const description = post.querySelector('description').textContent;
    const link = post.querySelector('link').textContent;

    if (!posts.find((post) => post.title === title)) {
      const newPost = {
        id: uniqueId(),
        idFid: currentFid.id,
        title,
        description,
        link,
      }
      watchedState.posts.unshift(newPost);
    }
  })
  watchedState.status = 'rendering';
};

// const newFunc = (watchedState, validatedUrl, i18n) => {
//   downloadData(watchedState, validatedUrl, i18n)
//     .then((data) => processingData(data, watchedState))
// };
const updateFids = (watchedState, i18n) => {
  const promises = watchedState.form.validUrls.map((url) => downloadData(watchedState, url, i18n)
    .then((data) => processingData(data, watchedState))
    .catch((e) => console.log(e)));
  return Promise.all(promises)
    .then(() => setTimeout(() => updateFids(watchedState, i18n), 5000));
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
        validateUrl(currentUrl, watchedState, elements, i18n)
          .then((validatedUrl) => downloadData(watchedState, validatedUrl, i18n))
          .then((data) => processingData(data, watchedState))
          .catch((e) => console.log(e)); // лишний если есть внутри validate?
      });
      setTimeout(() => updateFids(watchedState, i18n), 5000);
    })
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
