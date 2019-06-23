/**
 * GET /element
 * Elements form page.
 */
exports.getElements = (req, res) => {
    //const unknownUser = !(req.user);
  
    res.render('elements', {
      title: 'Elements',
      //unknownUser,
    });
  };
  
  