const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = mongoose.model('Book');
const CustomBook = mongoose.model('CustomBook');
const UserBook = mongoose.model('UserBook');
const { validationResult } = require('express-validator');
const { getBooksValidator } = require('../validators/data');

router.get('/', getBooksValidator, async (req, res) => {

  const limit = Number(req.query.limit) || 1;
  const pageIndex = req.query.pageIndex || 0;
  const skip = pageIndex * limit;
  const exact = req.query.exact;
  const title = (req.query.title || '').toString();
  const userId = res.locals.userId;
  const boardType = req.query.boardType;
  const language = req.query.language || 'en';
  const categoryPaths = req.query.categoryPaths && req.query.categoryPaths.length > 0 && req.query.categoryPaths;
  const sortType = req.query.sortType || 'title';
  const sortDirection = Number(req.query.sortDirection) || 1;

  const result = validationResult(req);
  if (result.isEmpty()) {
    const itemsCount = skip + limit;

  const count = boardType !== 'all' ? await UserBook.find({ userId, bookStatus: boardType }).count() : await Book.count() + await CustomBook.count();

  let result;

  if (boardType !== 'all') {

    result = await UserBook.aggregate([
      { $sort : { [sortType]: sortDirection } },
      { $limit : 10000 },
      { $facet: {
        items: [
          { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'bookDetails' } },
          { $lookup: { from: 'custombooks', localField: 'bookId', foreignField: '_id', as: 'customBookDetails' } },
          { $match : { userId: new mongoose.Types.ObjectId(userId), bookStatus: boardType } },
          { $project: { customBookDetails: { title: 1, authorsList: 1, categoryPath: 1, coverPath: 1, votesCount: 1, pages: 1, language: 1 }, bookDetails: { title: 1, authorsList: 1, categoryPath: 1, coverPath: 1, votesCount: 1, pages: 1, language: 1 }, bookId: 1, added: 1, bookStatus: 1 } },
          { $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$bookDetails", 0 ] }, { $arrayElemAt: [ "$customBookDetails", 0 ] }, "$$ROOT" ] } } },
          { $project: { bookDetails: 0, customBookDetails: 0 } },
          { $match : { language } },
          { $skip : skip },
          { $limit : limit }
        ],
        pagination: [
          { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'bookDetails' } },
          { $lookup: { from: 'custombooks', localField: 'bookId', foreignField: '_id', as: 'customBookDetails' } },
          { $match : { userId: new mongoose.Types.ObjectId(userId), bookStatus: boardType } },
          { $project: { customBookDetails: { title: 1, authorsList: 1, categoryPath: 1, coverPath: 1, votesCount: 1, pages: 1, language: 1 }, bookDetails: { title: 1, authorsList: 1, categoryPath: 1, coverPath: 1, votesCount: 1, pages: 1, language: 1 }, bookId: 1, added: 1, bookStatus: 1 } },
          { $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$bookDetails", 0 ] }, { $arrayElemAt: [ "$customBookDetails", 0 ] }, "$$ROOT" ] } } },
          { $project: { bookDetails: 0, customBookDetails: 0 } },
          { $match : { language } },
          { $count: "totalItems" },
          {
            $project: {
              hasNextPage: {
                $cond: { if: { $gt: [ '$totalItems', itemsCount ] }, then: true, else: false }
              },
              "totalItems": '$totalItems'
            }
          }
        ]
      }},
      { $unwind: '$pagination' }
    ], { allowDiskUse : true });
  } else {
    result = await Book.aggregate([
      { $unionWith: 'custombooks' },
      { $match : { $and: [{ language }, (categoryPaths || []).length > 0 ? { categoryPath: { $in: categoryPaths } } : {}, exact && title ? { title: { $regex: `^${title}$`, $options: 'i' } } : title ? { $or: [ { title: { $regex: title, $options: 'i' }}, { authorsList: { $regex: title, $options: 'i' } } ] } : {} ] } },
      { $sort : { [sortType]: sortDirection } },
      { $limit : 10000 },
      { $facet: {
          items: [
            { $lookup: { 
              from: 'userbooks', 
              let: { bookId: "$_id" },
              pipeline: [
                { $match:
                  { $expr:
                      { $and:
                        [
                          { $eq: [ "$bookId", "$$bookId" ] },
                          { $eq: [ "$userId", new mongoose.Types.ObjectId(userId) ] }
                        ]
                      }
                  }
                },
              ],
              as: 'bookDetails' }
            },
            { $project: { bookDetails: { added: 1, bookStatus: 1}, _id: 0, title: 1, authorsList: 1, bookId: '$_id', categoryPath: 1, coverPath: 1, votesCount: 1, pages: 1 } },
            { $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$bookDetails", 0 ] }, "$$ROOT" ] } } },
            { $project: { bookDetails: 0 } },
            
            { $skip : skip },
            { $limit : limit },
          ],
          pagination: [
            { $unionWith: 'custombooks' },
            { $match : { $and: [{ language }, (categoryPaths || []).length > 0 ? { categoryPath: { $in: categoryPaths } } : {}, exact && title ? { title: { $regex: `^${title}$`, $options: 'i' } } : title ? { $or: [ { title: { $regex: title, $options: 'i' }}, { authorsList: { $regex: title, $options: 'i' } } ] } : {} ] } },
            { $count: "totalItems" },
            {
              $project: {
                hasNextPage: {
                  $cond: { if: { $gt: [ '$totalItems', itemsCount ] }, then: true, else: false }
                },
                totalItems: {
                  $cond: [(categoryPaths || []).length > 0 || !!title, '$totalItems', count ]
                }
              }
            }
          ]
        }
      },
      { $unwind: '$pagination' }
    ], { allowDiskUse : true });
  }

  return res.send(result[0]);
  } else {
    return res.status(500).send({ errors: result.array({ onlyFirstError: true }) });
  }
});

module.exports = router;
