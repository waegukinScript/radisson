/**
 * GET /
 * Home page.
 */
exports.getUserAdmin = (req, res) => {
  res.render('userAdmin', {
    title: 'userAdmin'
  });
};
