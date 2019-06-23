const Event = require('../models/Event');

const ITEMS_PER_PAGE = 10;
exports.getEventDatabase = (req, res) => {
  const page = +req.query.page || 1;
  let totalItem;
  Event.find()
    .countDocuments()
    .then((numberTest) => {
      totalItem = numberTest;
      return Event.find({})
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then((events) => {
      // res.send(`${event.length}`);
      res.render('eventDatabase', {
        title: ' eventDatabase',
        events,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItem,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItem / ITEMS_PER_PAGE)
      });
    });
};
