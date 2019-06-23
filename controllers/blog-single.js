/**
 * GET /blog
 * Blog form page.
 */
exports.getBlogSingle = (req, res) => {
    //const unknownUser = !(req.user);
  
    res.render('blog-single', {
      title: 'Blog Single',
      //unknownUser,
    });
  };
  