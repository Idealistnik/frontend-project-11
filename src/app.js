import * as yup from 'yup';
import onChange from 'on-change';
import renderErrors from './render.js';

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

  const watchedState = onChange(state, (path, currentValue) => renderErrors(elements, watchedState, path, currentValue));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const currentInput = event.target.querySelector('[name="url"]');
    const currentUrl = currentInput.value;

    const schema = yup.string()
      .required('Поле должно быть заполнено')
      .url('Ссылка должна быть валидным URL')
      .notOneOf(state.form.validUrls, 'RSS уже существует');

    schema.validate(currentUrl)
      .then(() => {
        watchedState.form.error = '';
        watchedState.form.validUrls.push(currentUrl);
        watchedState.form.status = 'valid';
      })
      .catch((e) => {
        watchedState.form.error = e.message;
        watchedState.form.status = 'invalid';
        elements.input.focus(); // не получается в рендере обработать случай когда ошибка та же и нужно фокус поставить, тут нельзя?
      });
  });
};
