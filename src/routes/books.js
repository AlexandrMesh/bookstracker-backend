const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = mongoose.model('Book');
const User = mongoose.model('User');
const UserBook = mongoose.model('UserBook');

/* GET users listing. */
router.get('/', async (req, res) => {
  

  // limit = 50
  // skip
  // page = 1,2,3,4,5

  // page 0
  // skip 0
  // limit 50

  // page 1
  // skip 50
  // limit 50

  // page 2
  // skip 100
  // limit 50

  // page * limit - limit -- if start page is 1
  // page * limit -- if start page is 0
  const limit = 5;
  const page = req.query.page || 0;
  const skip = page * limit;
  const title = (req.query.title || '').toString();
  const userId = req.query.userId;
  const boardType = req.query.boardType;
  const categoryIds = req.query.categoryIds && req.query.categoryIds.length && req.query.categoryIds.map(item => Number(item));
  const sortType = req.query.sortType || 'title';
  const sortDirection = Number(req.query.sortDirection) || 1;

  const itemsCount = skip + limit;

  // const condition = await getQuery(userId, bookListStatus, categoryIds, title);

  const user = userId ? await User.findById(userId).lean() : {};
  // const usersBookList = user.usersBookList || {};

  let result;

  console.log(categoryIds, 'categoryIds');
  console.log(title, 'title');
  console.log(boardType, 'boardType');

  if (boardType !== 'all') {
    result = await UserBook.aggregate([
      { $facet: {
        items: [
          // { $sort : { added : -1 } },
          
          { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'bookDetails' } },
          { $match : { userId: mongoose.Types.ObjectId(userId), bookStatus: boardType } },
          { $project: { bookDetails: { title: 1, categoryId: 1, coverPath: 1, rating: 1 }, bookId: 1, added: 1, bookStatus: 1 } },
          { $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$bookDetails", 0 ] }, "$$ROOT" ] } } },
          { $project: { bookDetails: 0 } },
          { $match : { $and: [(categoryIds || []).length > 0 ? { categoryId: { $in: categoryIds } } : {}, title ? { title: { $regex: title, $options: 'i' }} : {} ] } },
          { $sort : { [sortType]: sortDirection, ...(sortType !== 'title' && { title: sortDirection }) } },
          { $skip : skip },
          { $limit : limit }
        ],
        pagination: [
          { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'bookDetails' } },
          { $match : { $and: [{ userId: mongoose.Types.ObjectId(userId) }, { bookStatus: boardType }, (categoryIds || []).length > 0 ? { 'bookDetails.categoryId': { $in: categoryIds } } : {}, title ? { title: { $regex: title, $options: 'i' }} : {} ] } },
          { $count: "totalItems" },
          {
            $project: {
              "hasNextPage": {
                $cond: { if: { $gt: [ '$totalItems', itemsCount ] }, then: true, else: false }
              },
              "totalItems": '$totalItems'
            }
          }
        ]
      }},
      { $unwind: '$pagination' }
    ]);
  } else {
    result = await Book.aggregate([
      { $facet: {
          items: [
            { $sort : { [sortType]: sortDirection } },
            { $lookup: { 
              from: 'userbooks', 
              let: { bookId: "$_id" },
              pipeline: [
                { $match:
                  { $expr:
                      { $and:
                        [
                          { $eq: [ "$bookId", "$$bookId" ] },
                          { $eq: [ "$userId", mongoose.Types.ObjectId(userId) ] }
                        ]
                      }
                  }
                }],
              as: 'bookDetails' }
            },
            { $match : { $and: [(categoryIds || []).length > 0 ? { categoryId: { $in: categoryIds } } : {}, title ? { title: { $regex: title, $options: 'i' }} : {} ] } },
            
            { $project: { bookDetails: { added: 1, bookStatus: 1}, _id: 0, title: 1, bookId: '$_id', categoryId: 1, coverPath: 1, rating: 1 } },
            
            { $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$bookDetails", 0 ] }, "$$ROOT" ] } } },
            { $project: { bookDetails: 0 } },
            { $skip : skip },
            { $limit : limit }
          ],
          pagination: [
            { $match : { $and: [(categoryIds || []).length > 0 ? { categoryId: { $in: categoryIds } } : {}, title ? { title: { $regex: title, $options: 'i' }} : {} ] } },
            { $count: "totalItems" },
            {
              $project: {
                "hasNextPage": {
                  $cond: { if: { $gt: [ '$totalItems', itemsCount ] }, then: true, else: false }
                },
                "totalItems": '$totalItems'
              }
            }
          ]
        }
      },
      { $unwind: '$pagination' }
    ]);
  }

  console.log(result, 'result');

  // const books = await Book.find(condition, null, { skip, limit }).select(['title', 'categoryId', 'coverPath', 'rating']).sort({ [sortType]: sortDirection }).lean();

  // const mappedBookList = books.map(book => {
  //   const isPlanned = (usersBookList.planned || []).some((plannedBook) => book._id.toString() === plannedBook.id) && 'planned';
  //   const isInProgress = (usersBookList.inProgress || []).some((inProgressBook) => book._id.toString() === inProgressBook.id) && 'inProgress';
  //   const isCompleted = (usersBookList.completed || []).some((completedBook) => book._id.toString() === completedBook.id) && 'completed';
  //   const status = isPlanned || isInProgress || isCompleted;
  //   if (status) {
  //     const { added } = (usersBookList[status] || []).find((usersBook) => book._id.toString() === usersBook.id) || {};
  //     return { ...book, status, added };
  //   } else {
  //     return book;
  //   }
  // });

  res.send(result[0]);
  
});

module.exports = router;
