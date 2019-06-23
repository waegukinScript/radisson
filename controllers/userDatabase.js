/**
 * GET /
 * Home page.
 */
exports.getUserDatabase = (req, res) => {
  res.render('userDatabase', {
    title: 'userDatabase'
  });
};
