const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const webp = require('webp-converter');
const Book = mongoose.model('Book');
const CustomBook = mongoose.model('CustomBook');
const User = mongoose.model('User');
const UserBook = mongoose.model('UserBook');
const UserVote = mongoose.model('UserVote');

const getBook = async (req, res) => {
  const { bookId } = req.query;

  const userId = res.locals.userId;

  if (!bookId) {
    return res.status(500).send('Must provide id');
  }

  try {
    const bookDetails = await Book.findById(bookId).lean() || await CustomBook.findById(bookId).lean();
    const book = await UserBook.findOne({ userId, bookId }) || {};
    if (book.bookStatus) {
      res.send({ ...bookDetails, bookStatus: book.bookStatus, added: book.added });
    } else {
      res.send(bookDetails);
    }
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

const getBooksList = async (req, res) => {
  const { ids } = req.body;
  if (ids || [].length === 0) {
    return res.status(500).send('Must provide ids');
  }

  try {
    const books = await Book.find({ _id: { $in: ids } });
    res.send(books);
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

const removeUserBook = async (bookId, userId) => {
  try {
    await User.updateOne(
      { _id: userId },
      { $pull: { 'usersBookList.planned': { id: bookId }, 'usersBookList.inProgress': { id: bookId }, 'usersBookList.completed': { id: bookId } } }
    );
    return { bookId };
  } catch (err) {
    console.log(err, 'removeUserBook err');
    console.log('Something went wrong');
  }
}

const addBookToList = async (bookId, userId, bookStatus) => {
  try {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const book = await Book.findById(bookId).select(['title', 'categoryId', 'coverPath', 'rating']).lean();
    const usersBook = { ...book, id: bookId, status: bookStatus, added: timestamp };
    const usersBookList = `usersBookList.${bookStatus}`;
    await User.updateOne(
      { _id: userId },
      { $addToSet: { [usersBookList]: usersBook } }
    );
    return usersBook;
  } catch (err) {
    console.log('Something went wrong');
  }
};

const updateBookVotes = async (req, res) => {
  const { bookId, shouldAdd } = req.body;
  
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  if (!bookId) {
    return res.status(500).send('Must provide book id');
  }

  try {
    let updatedBook;
    if (shouldAdd) {
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      await UserVote.findOneAndUpdate(
        { userId, bookId },
        { userId, bookId, added: timestamp, count: 1 },
        { new: true, upsert: true }
      )
      updatedBook = await Book.findOneAndUpdate(
        { _id: bookId },
        {
          $inc: {
            votesCount: 1
          }
        },
        { new: true }
      ).select({ votesCount: 1 });
      if (!updatedBook) {
        updatedBook = await CustomBook.findOneAndUpdate(
          { _id: bookId },
          {
            $inc: {
              votesCount: 1
            }
          },
          { new: true }
        ).select({ votesCount: 1 });
      }
    } else {
      await UserVote.deleteOne({ bookId, userId });
      updatedBook = await Book.findOneAndUpdate(
        { _id: bookId },
        {
          $inc: {
            votesCount: -1
          }
        },
        { new: true }
      ).select({ votesCount: 1 });
      if (!updatedBook) {
        updatedBook = await CustomBook.findOneAndUpdate(
          { _id: bookId },
          {
            $inc: {
              votesCount: -1
            }
          },
          { new: true }
        ).select({ votesCount: 1 });
      }
    }
    const userVotes = await UserVote.find({ userId }).select({ bookId: 1, count: 1 });
    res.send({ votesCount: updatedBook.votesCount, userVotes });
  } catch (err) {
    console.log(err, 'err');
    return res.status(500).send('Something went wrong');
  }
};

const updateUserBook = async (req, res) => {
  const { bookId, bookStatus } = req.body;
  
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  if (!bookId) {
    return res.status(500).send('Must provide book id');
  }

  try {
    const response = {};
    if (bookStatus === 'all') {
      await UserBook.deleteOne({ bookId, userId });
    } else {
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      const data = await UserBook.findOneAndUpdate(
        { userId, bookId },
        { bookStatus, added: timestamp },
        { upsert: true, new: true }
      );
      response.bookStatus = data.bookStatus;
      response.added = data.added;
    }
    res.send(response);
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

const imageType = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png'
}

const getImageType = headers => {
  return imageType[headers['content-type']] || imageType['image/jpeg']
}

const downloadImage = async (imageSrc, categoryPath) => {
  try {
    const imagesFolderNamePrefix = 'custombooks';
    const response = await axios({
      url: imageSrc,
      method: 'GET',
      responseType: 'stream'
    })

    const dirName = '/var/www/html/images/covers';

    const coversFolder = path.resolve(dirName, imagesFolderNamePrefix);

    if (!fs.existsSync(coversFolder)) {
      fs.mkdirSync(coversFolder);
    }

    const imageTitle = `${categoryPath}_${shortid.generate()}`;
    const _path = path.resolve(dirName, imagesFolderNamePrefix, `${imageTitle}.${getImageType(response.headers)}`);
    const writer = fs.createWriteStream(_path);

    response.data.pipe(writer);

    const result = webp.cwebp(_path, path.resolve(dirName, imagesFolderNamePrefix, `${imageTitle}.webp`),'-q 80');
    return result.then(() => {
      // remove the original img
      fs.unlink(_path, (err) => {
        if (err) throw err;
      });
      return `${imagesFolderNamePrefix}/${imageTitle}`;
    });
  } catch (error) {
    console.log(error);
  }
}

const addCustomBook = async (req, res) => {
  const { title, categoryPath, coverPath, authorsList, annotation, pages, status, language } = req.body;
  
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  if (!title) {
    return res.status(500).send('Must provide book title');
  }

  if (!categoryPath) {
    return res.status(500).send('Must provide categoryPath');
  }

  if (!coverPath) {
    return res.status(500).send('Must provide coverPath');
  }

  if (authorsList.length <= 0) {
    return res.status(500).send('Must provide authorsList');
  }

  if (!annotation) {
    return res.status(500).send('Must provide annotation');
  }

  if (!pages) {
    return res.status(500).send('Must provide pages');
  }

  if (!language) {
    return res.status(500).send('Must provide language');
  }

  try {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const downloadedImage = coverPath !== 'default_cover' ? await downloadImage(coverPath, categoryPath) : 'default_cover';
    const customBook = await CustomBook.findOneAndUpdate(
      { title },
      { categoryPath, coverPath: downloadedImage, authorsList, annotation, pages, language, votesCount: 0, added: timestamp, userId },
      { upsert: true, new: true }
    );
    if (status !== 'all') {
      await UserBook.findOneAndUpdate(
        { userId, bookId: customBook._id },
        { bookStatus: status, added: timestamp },
        { upsert: true, new: true }
      );
    }
    res.send({ status: 'ok' });
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

module.exports = { getBook, getBooksList, updateUserBook, updateBookVotes, addCustomBook };
