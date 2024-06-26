
import isEmpty from 'lodash/isEmpty.js';

const addPosts = (watchedState, i18n, elements) => {
  const { postsContainer } = elements;
  const { posts } = watchedState;
  postsContainer.innerHTML = '';
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const titleContainer = document.createElement('div');
  titleContainer.classList.add('card-body');
  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = i18n.t('posts.title');
  container.append(titleContainer);
  titleContainer.append(title);
  postsContainer.append(container);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');

  posts.forEach((post) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    listItem.append(link);
    link.outerHTML = `<a href="${post.link}" class="fw-bold" data-id="${post.id}" target="_blank" rel="noopener noreferrer">${post.title}</a>`;
    const button = document.createElement('button');
    listItem.append(button);
    button.outerHTML = `<button type="button" class="btn btn-outline-primary btn-sm" data-id=${post.id} data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('posts.button')}</button>`;
    postsList.append(listItem);
  });
  postsContainer.append(postsList);
};

const addFids = (watchedState, i18n, elements) => {
  const { fidsContainer } = elements;
  const { fids } = watchedState;
  fidsContainer.innerHTML = '';
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const titleContainer = document.createElement('div');
  titleContainer.classList.add('card-body');
  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = i18n.t('fids.title');
  container.append(titleContainer);
  titleContainer.append(title);
  fidsContainer.append(container);

  const fidsList = document.createElement('ul');
  fidsList.classList.add('list-group', 'border-0', 'rounded-0');

  fids.forEach((fid) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = fid.title;
    const text = document.createElement('p');
    text.classList.add('m-0', 'small', 'text-black-50');
    text.textContent = fid.description;
    listItem.append(title, text);
    fidsList.append(listItem);
  });
  fidsContainer.append(fidsList);

};

export default (elements, watchedState, i18n, path, currentValue, previousValue) => {

  const { form, input, errorElement, submitButton } = elements;

  switch (path) {

    case ('form.error'):
      if (currentValue !== '') {
        errorElement.textContent = currentValue;
        errorElement.classList.remove('text-success');
        errorElement.classList.add('text-danger');
        input.classList.add('is-invalid');
        input.focus();
        return;
      }
      if (currentValue === '') {
        errorElement.textContent = '';
        input.classList.remove('is-invalid');
        input.focus();
        errorElement.classList.remove('text-danger');
        return;
      }
      break;

    case ('status'):
      if (currentValue === 'downloading') {
        input.setAttribute('readonly', 'true');
        submitButton.setAttribute('disabled', '');
        return;
      }
      if (currentValue === 'downloadedSuccess') {
        input.removeAttribute('readonly');
        submitButton.removeAttribute('disabled');
        errorElement.classList.remove('text-danger');
        errorElement.classList.add('text-success');
        errorElement.textContent = i18n.t('errors.request.downloaded');
        input.value = '';
        input.focus();
        return;
      }
      if (currentValue === 'downloadedFail') {
        input.removeAttribute('readonly');
        submitButton.removeAttribute('disabled');
        return;
      }
      if (currentValue === 'rendering') {
        addFids(watchedState, i18n, elements);
        addPosts(watchedState, i18n, elements);
      }
      break;

    // case ('posts'):

    //   addPosts(watchedState, i18n, elements);
    //   break;
    case ('default'):
      break;
  }
};
