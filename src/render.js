
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
      break;

    case ('default'):
      break;
  }
};






// elements.errorElement.textContent = '';
// elements.input.value = '';
// elements.input.classList.remove('is-invalid');
// elements.input.focus();
// elements.errorElement.classList.remove('text-danger');
// elements.errorElement.classList.add('text-success');
// elements.errorElement.textContent = i18n.t('errors.request.downloaded');
// return;
// }

// if (currentValue === '') {
// elements.errorElement.textContent = '';
// elements.input.value = '';
// elements.input.classList.remove('is-invalid');
// elements.input.focus();
// elements.errorElement.classList.remove('text-danger');
// elements.errorElement.classList.add('text-success');
// elements.errorElement.textContent = i18n.t('errors.request.downloaded');
// return;
// }
// elements.errorElement.textContent = currentValue;
// elements.errorElement.classList.remove('text-success');
// elements.errorElement.classList.add('text-danger');
// elements.input.classList.add('is-invalid');
// elements.input.focus();
// break;
