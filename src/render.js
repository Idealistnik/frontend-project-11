const generateContainer = (container, i18n) => {
  container.innerHTML = '';
  const container1 = document.createElement('div');
  container1.classList.add('card', 'border-0');
  const titleContainer = document.createElement('div');
  titleContainer.classList.add('card-body');
  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = i18n.t('posts.title');
  container1.append(titleContainer);
  titleContainer.append(title);
  container.append(container1);
  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');
  return list;
};

const renderPosts = (postsContainer, posts, i18n, ui) => {
  const postsList = generateContainer(postsContainer, i18n);
  posts.forEach((post) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    listItem.append(link);
    const currentClassList = ui.visitedLinks.includes(post.id) ? 'fw-normal link-secondary' : 'fw-bold';
    link.outerHTML = `<a href="${post.link}" class="${currentClassList}" data-id="${post.id}" target="_blank" rel="noopener noreferrer">${post.title}</a>`;
    const button = document.createElement('button');
    listItem.append(button);
    button.outerHTML = `<button type="button" class="btn btn-outline-primary btn-sm" data-id=${post.id} data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('posts.button')}</button>`;
    postsList.append(listItem);
  });
  postsContainer.append(postsList);
};

const renderFeeds = (feedsContainer, feeds, i18n) => {
  const feedsList = generateContainer(feedsContainer, i18n);
  feeds.forEach((feed) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;
    const text = document.createElement('p');
    text.classList.add('m-0', 'small', 'text-black-50');
    text.textContent = feed.description;
    listItem.append(title, text);
    feedsList.append(listItem);
  });
  feedsContainer.append(feedsList);
};

const renderError = (errorElement, input, error) => {
  errorElement.textContent = error;
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
  input.removeAttribute('readonly');
  submitButton.removeAttribute('disabled');
  if (form.error === '') {
    errorElement.classList.remove('text-danger');
    errorElement.classList.add('text-success');
    errorElement.textContent = i18n.t('errors.request.downloaded');
    input.value = '';
    input.focus();
  }
};

const renderModal = (modalContainer, body, ui, posts, modalTitle, modalBody, modalFooter) => {
  body.classList.add('modal-open');
  body.setAttribute('style', 'overflow: hidden; padding-right: 16px;');
  modalContainer.classList.add('show');
  modalContainer.removeAttribute('aria-hidden');
  modalContainer.setAttribute('aria-modal', 'true');
  modalContainer.setAttribute('style', 'display: block;');

  const currentPost = posts.find(({ id }) => id === ui.modalLinkId);
  const { title, description, link } = currentPost;

  modalTitle.textContent = title;
  modalBody.textContent = description;

  const footerLink = modalFooter.querySelector('a');
  const footerButton = modalFooter.querySelector('button');
  footerLink.outerHTML = `<a class="btn btn-primary full-article" href="${link}" role="button" target="_blank" rel="noopener noreferrer">Читать полностью </a>`;
  footerButton.outerHTML = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>';
};

const renderModalClose = (modalContainer, body) => {
  body.classList.remove('modal-open');
  body.setAttribute('style', '');
  body.removeAttribute('overflow: hidden; padding-right: 16px;');
  modalContainer.removeAttribute('role');
  modalContainer.classList.remove('show');
  modalContainer.setAttribute('aria-hidden', 'true');
  modalContainer.removeAttribute('aria-modal');
  modalContainer.setAttribute('style', 'display: none;');

  const footerLink = document.querySelector('.modal-footer a');
  const footerButton = document.querySelector('.modal-footer button');

  footerLink.outerHTML = '<a class="btn btn-primary full-article" href="#" role="button" target="_blank" rel="noopener noreferrer">Читать полностью </a>';
  footerButton.outerHTML = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>';
};

export default (elements, watchedState, i18n, path, currentValue) => {
  const {
    input, errorElement, submitButton, feedsContainer,
    postsContainer, body,
  } = elements;
  const {
    modalContainer, modalTitle, modalFooter, modalBody,
  } = elements.modal;
  const {
    posts, feeds, form, ui,
  } = watchedState;

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
      }

      if (currentValue === 'downloadFinish') {
        renderDownload(input, submitButton, errorElement, i18n, form);
      }

      if (currentValue === 'rendering') {
        renderFeeds(feedsContainer, feeds, i18n);
        renderPosts(postsContainer, posts, i18n, ui);
      }
      break;

    case ('posts'):
    case ('ui.visitedLinks'):
      renderPosts(postsContainer, posts, i18n, ui);
      break;

    case ('ui.modalLinkId'):
      if (ui.modalLinkId) {
        renderModal(modalContainer, body, ui, posts, modalTitle, modalBody, modalFooter);
        return;
      }
      renderModalClose(modalContainer, body);
      break;

    default:
      break;
  }
};
