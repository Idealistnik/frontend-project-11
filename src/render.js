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

const renderFeeds = (fidsContainer, fids, i18n) => {
  const fidsList = generateContainer(fidsContainer, i18n);
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

const renderModal = (modalContainer, body, ui, posts, modalTitle, modalBody, modalFooter) => {
  body.classList.add('modal-open');
  body.setAttribute('style', 'overflow: hidden; padding-right: 16px;');
  modalContainer.classList.add('show');
  modalContainer.removeAttribute('aria-hidden');
  modalContainer.setAttribute('aria-modal', 'true');
  modalContainer.setAttribute('style', 'display: block;');

  const currentPost = posts.find(({ id }) => id === ui.modalLinkId);
  const postTitle = currentPost.title;
  const postDescription = currentPost.description;
  const postLink = currentPost.link;

  modalTitle.textContent = postTitle;
  modalBody.textContent = postDescription;

  const footerLink = modalFooter.querySelector('a');
  const footerButton = modalFooter.querySelector('button');

  footerLink.outerHTML = `<a class="btn btn-primary full-article" href="${postLink}" role="button" target="_blank" rel="noopener noreferrer">Читать полностью </a>`;

  footerButton.outerHTML = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>';
};

const renderModalClose = (modalContainer, body, ui, posts, modalTitle, modalBody, modalFooter) => {
  body.classList.remove('modal-open');
  body.setAttribute('style', '');
  body.removeAttribute('overflow: hidden; padding-right: 16px;');
  modalContainer.removeAttribute('role');
  modalContainer.classList.remove('show');
  modalContainer.setAttribute('aria-hidden', 'true');
  modalContainer.removeAttribute('aria-modal');
  modalContainer.setAttribute('style', 'display: none;');

  // modalTitle.textContent = '';
  // modalBody.textContent = '';

  const footerLink = modalFooter.querySelector('a');
  const footerButton = modalFooter.querySelector('button');

  footerLink.outerHTML = '<a class="btn btn-primary full-article" href="#" role="button" target="_blank" rel="noopener noreferrer">Читать полностью </a>';

  footerButton.outerHTML = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>';
};

export default (elements, watchedState, i18n, path, currentValue) => {
  const {
    input, errorElement, submitButton, fidsContainer, postsContainer, modalContainer, body, modalTitle, modalBody, modalFooter,
  } = elements;
  const {
    posts, fids, form, ui,
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
        return;
      }

      if (currentValue === 'downloadFinish') {
        renderDownload(input, submitButton, errorElement, i18n, form);
        return;
      }

      if (currentValue === 'rendering') {
        renderFeeds(fidsContainer, fids, i18n);
        renderPosts(postsContainer, posts, i18n, ui);
      }
      break;

    case ('posts'):
      renderPosts(postsContainer, posts, i18n, ui); // получается посты обновляются не только каждые 5 сек, но и сразу полед загрузки нового фида?
      break;

    case ('ui.visitedLinks'):
      renderPosts(postsContainer, posts, i18n, ui);
      break;

    case ('ui.modalLinkId'):
      if (ui.modalLinkId) {
        renderModal(modalContainer, body, ui, posts, modalTitle, modalBody, modalFooter);
        return;
      }
      renderModalClose(modalContainer, body, ui, posts, modalTitle, modalBody, modalFooter);
      break;

    case ('default'):
      break;
  }
};

// const renderVisitedLinks = (ui, posts, postsContainer) => {

//   ui.visitedLinks.forEach((id) => {
//     const currentLink = postsContainer.querySelector(`[data-id="${id}"]`);
//     console.log(currentLink);
//     currentLink.classList.remove('fw-bold');
//     currentLink.classList.add('fw-normal', 'link-secondary');
//   })

// posts.forEach(({ id }) => {
//   if (Object.hasOwn(ui.visitedLinks, id)) {
//     const currentLink = postsContainer.querySelector(`[data-id="${id}"]`);
//     console.log(currentLink);
//     currentLink.classList.remove('fw-bold');
//     currentLink.classList.add('fw-normal', 'link-secondary');
//   }
// })
// };
