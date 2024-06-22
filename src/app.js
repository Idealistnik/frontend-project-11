import * as yup from 'yup';
import onChange from 'on-change';
import keyBy from 'lodash/keyBy.js';
import resources from './locales/index.js';
import i18next from 'i18next';



// yup.setLocale({
//   mixed: {
//     required: () => ({ key: 'errors.validation.valid' }),
//   },
// });


// const validate = (fields) => {
//   try {
//     schema.validateSync(fields, { abortEarly: false });
//     return {};
//   } catch (e) {
//     return keyBy(e.inner, 'path');
//   }
// };

export default async () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    urlInput: document.querySelector('#url-input'),
    submitInput: document.querySelector('button.btn-primary'),
  };
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  });
  
  const schema = yup.object({
    url: yup.string().required().url(),
  });

  
  const state = {
    form: {
      state: null,
      data: {},
      errors: [],
    },
    fidList: [],
  };
  const render = (path, currentValue) => {
    if (path === 'form.state') {
      if (currentValue === 'valid') {
        watchedState.form.errors = [];
      } else if (currentValue === 'invalid') {
        const errorMessage = document.createElement('p');
        errorMessage.class.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');
        errorMessage.textContent = i18next.t('errors.validation.valid');

      }

    }
  };


  const watchedState = onChange(state, render);

  elements.form.addEventListener('change', async (event) => {
    event.preventDefault();

    watchedState.form.state = 'filling';
    const currentUrl = event.target.value;
    const urlName = event.target.getAttribute('name');
    try {
      await schema.validate(currentUrl, { abortEarly: false });
      watchedState.form.data[urlName] = currentUrl;
    } catch (error) {
      watchedState.form.errors[urlName] = error.inner;
    }
    console.log(watchedState.form.errors);





    // state.form.state = 'valid';




    // try {
    //   await schema.validate(watchedState.form.data, { abortEarly: false });
    //   watchedState.form.errors = [];
    //   watchedState.form.valid = true;
    // } catch (err) {
    //   const validationErrors = err.inner.reduce((acc, cur) => {
    //     const { path, message } = cur;
    //     return { ...acc, [path]: [...acc[path] || [], message] };
    //   }, {});
    //   watchedState.form.errors = validationErrors;
    // }



    // urlInput.setAttribute('readonly', 'true');
    // submitInput.setAttribute('disabled');
  });
};