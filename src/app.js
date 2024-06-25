import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import renderErrors from './render.js';
import resources from './locales/index.js';

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
    .then(() => {
      watchedState.form.error = '';
      watchedState.form.validUrls.push(url);
      watchedState.form.status = 'valid';
    })
    .catch((e) => {
      watchedState.form.error = e.message;
      console.log(watchedState.form.error);
      watchedState.form.status = 'invalid';
      elements.input.focus();
    });
};

export default () => {

  const state = {
    form: {
      status: null,
      validUrls: [],
      error: '',
    },
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    errorElement: document.querySelector('.feedback'),
  };

  const i18n = i18next.createInstance();
  const defaultLang = 'ru';

  i18n.init({
    debug: false,
    lng: defaultLang,
    resources,
  })
    .then(() => {
      const watchedState = onChange(state, (path, currentValue) => renderErrors(elements, watchedState, path, currentValue));
      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const currentInput = event.target.querySelector('[name="url"]');
        const currentUrl = currentInput.value;
        validateUrl(currentUrl, watchedState, elements, i18n);
      });
    })
};
