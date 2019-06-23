/**
 * GET /blog
 * Blog form page.
 */
exports.getBlogHome = (req, res) => {
    //const unknownUser = !(req.user);
  
    res.render('blog-home', {
      title: 'Blog Home',
      //unknownUser,
    });
  };
  