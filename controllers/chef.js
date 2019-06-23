/**
 * GET /blog
 * Blog form page.
 */
exports.getChef = (req, res) => {
    //const unknownUser = !(req.user);
  
    res.render('chef', {
      title: 'Chef',
      //unknownUser,
    });
  };
  