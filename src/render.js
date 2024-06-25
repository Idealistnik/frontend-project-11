export default (elements, watchedState, path, currentValue) => {
  switch (path) {

    case ('form.error'):
      if (currentValue === '') {
        elements.errorElement.textContent = '';
        elements.input.value = '';
        elements.input.classList.remove('is-invalid');
        elements.input.focus();
        return;
      }
      elements.errorElement.textContent = currentValue;
      elements.input.classList.add('is-invalid');
      elements.input.focus();
      break;

    case ('default'):
      break;
  }
};
