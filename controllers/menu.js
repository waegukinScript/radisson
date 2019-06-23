/**
 * GET /blog
 * Blog form page.
 */
exports.getMenu = (req, res) => {
    //const unknownUser = !(req.user);
  
    res.render('menu', {
      title: 'Menu',
      //unknownUser,
    });
  };
  