// import * as yup from 'yup';
// // import onChange from 'on-change';
// import keyBy from 'lodash/keyBy.js';
// import resources from './locales/index.js';
// import i18next from 'i18next';

// const schema = yup.object({
//   url: yup.string().required().url(),
// });

// const validate = (urlObject) => {
// try {
//   schema.validateSync(urlObject, { abortEarly: false });
//   return {};
// }
// catch (e) {
//   return keyBy(e.inner, 'path');
//   // }
//    const promise = new Promise((resolve, reject) => {
//     const result = schema.validate(urlObject, { abortEarly: false })
//     resolve(result);
//   });

//   promise
//   .then(() => console.log('yes'))
//   .catch(() => console.log('no'));
// };


// const func = (url) => {
//   return validate(url);
// };
// const url = { 
//   url: 'https://hello' 
// };
// console.log(func(url));

// // yup.setLocale({
// //   mixed: {
// //     required: () => ({ key: 'errors.validation.valid' }),
// //   },
// // });


// // const validate = (fields) => {
// //   try {
// //     schema.validateSync(fields, { abortEarly: false });
// //     return {};
// //   } catch (e) {
// //     return keyBy(e.inner, 'path');
// //   }
// // };

// export default async () => {
//   const elements = {
//     form: document.querySelector('.rss-form'),
//     urlInput: document.querySelector('#url-input'),
//     submitInput: document.querySelector('button.btn-primary'),
//   };
//   const defaultLanguage = 'ru';
//   const i18nextInstance = i18next.createInstance();
//   await i18nextInstance.init({
//     lng: defaultLanguage,
//     debug: true,
//     resources,
//   });

//   const schema = yup.object({
//     url: yup.string().required().url(),
//   });

//   const state = {
//     form: {
//       state: null,
//       data: {},
//       errors: [],
//     },
//     fidList: [],
//   };
//   const render = (path, currentValue) => {
//     if (path === 'form.state') {
//       if (currentValue === 'valid') {
//         watchedState.form.errors = [];
//       } else if (currentValue === 'invalid') {
//         const errorMessage = document.createElement('p');
//         errorMessage.class.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');
//         errorMessage.textContent = i18next.t('errors.validation.valid');

//       }

//     }
//   };


//   const watchedState = onChange(state, render);

//   elements.form.addEventListener('change', async (event) => {
//     event.preventDefault();

//     watchedState.form.state = 'filling';
//     const currentUrl = event.target.value;
//     const urlName = event.target.getAttribute('name');
//     try {
//       await schema.validate(currentUrl, { abortEarly: false });
//       watchedState.form.data[urlName] = currentUrl;
//     } catch (error) {
//       watchedState.form.errors[urlName] = error.inner;
//     }
//     console.log(watchedState.form.errors);



// state.form.errors.push(keyBy(e.inner, 'path')[urlName].message);




//     // state.form.state = 'valid';




//     // try {
//     //   await schema.validate(watchedState.form.data, { abortEarly: false });
//     //   watchedState.form.errors = [];
//     //   watchedState.form.valid = true;
//     // } catch (err) {
//     //   const validationErrors = err.inner.reduce((acc, cur) => {
//     //     const { path, message } = cur;
//     //     return { ...acc, [path]: [...acc[path] || [], message] };
//     //   }, {});
//     //   watchedState.form.errors = validationErrors;
//     // }



//     // urlInput.setAttribute('readonly', 'true');
//     // submitInput.setAttribute('disabled');
//   });
// };

// <!-- <div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="modal" aria-hidden="true">
// <div class="modal-dialog" role="document">
//   <div class="modal-content">
//     <div class="modal-header">
//       <h5 class="modal-title"></h5>
//       <button type="button" class="btn-close close" data-bs-dismiss="modal" aria-label="Close"></button>
//     </div>
//     <div class="modal-body text-break"></div>
//     <div class="modal-footer">
//       <a class="btn btn-primary full-article" href="#" role="button" target="_blank"
//         rel="noopener noreferrer">Читать полностью </a><button type="button" class="btn btn-secondary"
//         data-bs-dismiss="modal">
//         Закрыть
//       </button>
//     </div>
//   </div>
// </div>
// </div> -->


// <!-- <section class="container-fluid container-xxl p-5">
// <div class="row">
//   <div class="col-md-10 col-lg-8 order-1 mx-auto posts"></div>
//   <div class="col-md-10 col-lg-4 mx-auto order-0 order-lg-1 feeds"></div>
// </div>
// </section> -->

// <footer class="footer border-top py-3 mt-5 bg-light">
// <div class="container-xl">
//   <div class="text-center">
//     created by
//     <a href="https://ru.hexlet.io/professions/frontend/projects/11" target="_blank">Hexlet</a>
//   </div>
// </div>
// </footer>

