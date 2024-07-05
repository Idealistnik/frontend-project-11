const createElementWithClasses = (tag, ...classes) => {
  const element = document.createElement(tag);
  element.classList.add(...classes);
  return element;
};

const generateContainer = (container, titleText) => {
  container.innerHTML = '';

  const containerDiv = createElementWithClasses('div', 'card', 'border-0');
  const titleContainer = createElementWithClasses('div', 'card-body');
  const title = createElementWithClasses('h2', 'card-title', 'h4');

  title.textContent = titleText;

  containerDiv.append(titleContainer);
  titleContainer.append(title);
  container.append(containerDiv);

  const list = createElementWithClasses('ul', 'list-group', 'border-0', 'rounded-0');
  return list;
};

const renderPosts = (postsContainer, posts, i18n, ui) => {
  const postsList = generateContainer(postsContainer, i18n.t('posts.title'));

  posts.forEach((post) => {
    const listItem = createElementWithClasses('li', 'list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const linkClassList = ui.visitedLinks.includes(post.id) ? 'fw-normal link-secondary' : 'fw-bold';
    const link = `<a href="${post.link}" class="${linkClassList}" data-id="${post.id}" target="_blank" rel="noopener noreferrer">${post.title}</a>`;

    const button = `<button type="button" class="btn btn-outline-primary btn-sm" data-id=${post.id} data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('posts.button')}</button>`;

    listItem.innerHTML = link + button;
    postsList.append(listItem);
  });
  postsContainer.append(postsList);
};

const renderFeeds = (feedsContainer, feeds, i18n) => {
  const feedsList = generateContainer(feedsContainer, i18n.t('feeds.title'));

  feeds.forEach((feed) => {
    const listItem = createElementWithClasses('li', 'list-group-item', 'border-0', 'border-end-0');

    const title = createElementWithClasses('h3', 'list-group-item', 'border-0', 'border-end-0');
    title.textContent = feed.titleFeed;

    const text = createElementWithClasses('p', 'm-0', 'small', 'text-black-50');
    text.textContent = feed.descriptionFeed;

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
  footerLink.setAttribute('href', `${link}`);
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
  footerLink.setAttribute('href', '#');
};

const renderStatus = (
  statusValue,
  ui,
  i18n,
  {
    input,
    submitButton,
    errorElement,
    form,
    feedsContainer,
    feeds,
    postsContainer,
    posts,
  },
) => {
  switch (statusValue) {
    case ('downloadStart'):
      input.setAttribute('readonly', 'true');
      submitButton.setAttribute('disabled', '');
      break;
    case ('downloadFinish'):
      renderDownload(input, submitButton, errorElement, i18n, form);
      break;
    case ('rendering'):
      renderFeeds(feedsContainer, feeds, i18n);
      renderPosts(postsContainer, posts, i18n, ui);
      break;
    default:
      break;
  }
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
      renderStatus(
        currentValue,
        ui,
        i18n,
        {
          input,
          submitButton,
          errorElement,
          form,
          feedsContainer,
          feeds,
          postsContainer,
          posts,
        },
      );
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
