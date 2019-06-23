/**
 * GET /blog
 * Blog form page.
 */
exports.getAbout = (req, res) => {
    //const unknownUser = !(req.user);
  
    res.render('about', {
      title: 'About',
      //unknownUser,
    });
  };
  