/**
 * GET /blog
 * Blog form page.
 */
exports.getGallery = (req, res) => {
    //const unknownUser = !(req.user);
  
    res.render('gallery', {
      title: 'Gallery',
      //unknownUser,
    });
  };
  