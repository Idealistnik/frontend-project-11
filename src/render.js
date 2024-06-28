
const renderPosts = (postsContainer, posts, i18n) => {
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

const renderFeeds = (fidsContainer, fids, i18n) => {
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

const renderError = (errorElement, input, eror) => {
  errorElement.textContent = eror;
  errorElement.classList.remove('text-success');
  errorElement.classList.add('text-danger');
  input.classList.add('is-invalid');
  input.focus();
};

const clearError = (errorElement, input) => {
  errorElement.textContent = '';
  input.classList.remove('is-invalid');
  errorElement.classList.remove('text-danger');
  input.focus();
};

const renderDownload = (input, submitButton, errorElement, i18n, form) => {

  if (form.error === '') {
    input.removeAttribute('readonly');
    submitButton.removeAttribute('disabled');
    errorElement.classList.remove('text-danger');
    errorElement.classList.add('text-success');
    errorElement.textContent = i18n.t('errors.request.downloaded');
    input.value = '';
    input.focus();
    return;
  }
  input.removeAttribute('readonly');
  submitButton.removeAttribute('disabled');

};

export default (elements, watchedState, i18n, path, currentValue) => {

  const { input, errorElement, submitButton, fidsContainer, postsContainer } = elements;
  const { posts, fids, form } = watchedState;

  switch (path) {

    case ('form.error'):
      if (currentValue) {
        renderError(errorElement, input, currentValue);
        return;
      }
      clearError(errorElement, input);
      break;
   
    case ('status'):
    
      if (currentValue === 'downloadStart') {
        input.setAttribute('readonly', 'true');
        submitButton.setAttribute('disabled', '');
        return;
      }

      if (currentValue === 'downloadFinish') {
        renderDownload(input, submitButton, errorElement, i18n, form);
        return;
      }

      if (currentValue === 'rendering') {
        renderFeeds(fidsContainer, fids, i18n);
        renderPosts(postsContainer, posts, i18n);
      }
      break;

      case ('posts'):
        renderPosts(postsContainer, posts, i18n); // получается посты обновляются не только каждые 5 сек, но и сразу полед загрузки нового фида?
        break;
  
    case ('default'):
      break;
  }
};
