export default (data, watchedState, i18n) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'application/xml');
  const error = parsedData.querySelector('parsererror');
  if (error) {
    watchedState.form.error = i18n.t('errors.request.valid');
    return;
    // return i18n.t('errors.request.valid');
  }

  const titleFeed = parsedData.querySelector('title').textContent;
  const descriptionFeed = parsedData.querySelector('description').textContent;
  const postsRaw = parsedData.querySelectorAll('item');
  const posts = Array.from(postsRaw);
  const newFeedInfo = {
    titleFeed,
    descriptionFeed,
  };

  const postsList = posts.map((currentPost) => {
    const title = currentPost.querySelector('title').textContent;
    const description = currentPost.querySelector('description').textContent;
    const link = currentPost.querySelector('link').textContent;
    return {
      title,
      description,
      link,
    };
  });
  const linkInfo = [newFeedInfo, postsList];
  return linkInfo;
};
