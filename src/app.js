import * as yup from 'yup';
import onChange from 'on-change';
// import keyBy from 'lodash/keyBy.js';
// import isEmpty from 'lodash/isEmpty.js';

export default () => {

  const state = {
    form: {
      status: 'start',
      // data: {}, использовал если валидация через объект
      validUrls: [],
      error: '',
    },
  };
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    // submit: document.querySelector('button.btn-primary'), не используется
    container: document.querySelector('.text-white'),
  };

  const renderErrors = (elements, watchedState, path, currentValue) => {
    console.log('status================', watchedState.form.status);
    console.log('validUrls==============', watchedState.form.validUrls);
    console.log('errors================', watchedState.form.error);

    const errorElement = document.querySelector('.feedback');

    switch (path) {
      case 'form.status':
        if (currentValue === 'invalid') {
          if (errorElement) {
            errorElement.textContent = watchedState.form.error;
          } else if (!errorElement) {
            const errorElement = document.createElement('p');
            errorElement.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-success', 'text-danger');
            errorElement.textContent = watchedState.form.error; // был undefined если началае менял статус и потом ошикбку отправлял
            elements.container.append(errorElement);
            elements.input.classList.add('is-invalid');
          }
        }
        if (currentValue === 'valid') {
          elements.input.value = '';
          if (errorElement) {
            errorElement.remove();
            elements.input.classList.remove('is-invalid');
          }
        }
        break;
    }
  };

  const watchedState = onChange(state, (path, currentValue) => renderErrors(elements, watchedState, path, currentValue));

  const schema = yup.string()
    .required('Поле должно быть заполнено')
    .url('Ссылка должна быть валидным URL')
    .notOneOf(watchedState.form.validUrls, 'RSS уже существует'); // не работает
  // const schema = yup.object({
  //   url: yup.string().required().url().notOneOf(state.form.validUrls, 'eror'),
  // });
  const clearFormErrors = () => watchedState.form.error = '';

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const currentInput = event.target.querySelector('[name="url"]');
    const currentUrl = currentInput.value;
    // const urlName = currentInput.getAttribute('name');
    // state.form.data[urlName] = currentUrl; // делаем обьект для проверки нужен ли обьект если одно поле всего?

    schema.validate(currentUrl, { abortEarly: false })
      .then(() => {
        clearFormErrors();
        if (!watchedState.form.validUrls.includes(currentUrl)) {
          watchedState.form.validUrls.push(currentUrl);
          watchedState.form.status = 'valid';
        } else if (watchedState.form.validUrls.includes(currentUrl)) {
          watchedState.form.error = 'RSS уже существует';
          watchedState.form.status = 'invalid'; // если вначале ставим статус а потом ошибку отправляем то ничего не работает, почему?
        }
      })
      .catch((e) => {
        clearFormErrors();
        watchedState.form.status = ''; // иначе не обрабатывался случай когда стейт уже invalid и должен был меняться текст
        watchedState.form.error = e.message;
        watchedState.form.status = 'invalid';
      });
  });
};



// const result = urlValidate(currentUrl);
// result
//   .then(() => {
//     clearFormErrors();
//     watchedState.form.validUrls.push(currentUrl)
// })
//   // .catch((e) => console.log(e))
//   .catch((e) => watchedState.form.errors.push(e.message))



// schema.validate(currentUrl, { abortEarly: false })
//   .then(() => {
//     state.form.status = 'valid';
//     state.form.validUrls.push(currentUrl);
//   })
//   .catch((e) => {
//     state.form.status = 'invalid';
//     state.form.errors.push(e.message);
//   });

// console.log(validationResult);

// clearFormErrors();
// if (isEmpty(validationResult)) {
//   state.form.validUrls.push(currentUrl);
// } else {
//   state.form.errors.push(validationResult[urlName].message);
// }




  // const func = (errorElement, currentValue, elements) => {
  //   if (!errorElement && currentValue === 'invalid') {
  //     const errorElement = document.createElement('p');
  //     errorElement.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-success', 'text-danger');
  //     errorElement.textContent = watchedState.form.error; // был undefined если началае менял статус и потом ошикбку отправлял
  //     elements.container.append(errorElement);
  //     elements.input.classList.add('is-invalid');
  //   }
  //   else if (errorElement && currentValue === 'invalid') {
  //     errorElement.textContent = watchedState.form.error;
  //   }
  //   else if (errorElement && currentValue === 'valid') {
  //     errorElement.remove();
  //     elements.input.classList.remove('is-invalid');
  //   }
  // };