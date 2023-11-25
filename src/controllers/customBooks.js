const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const webp = require('webp-converter');
const CustomBook = mongoose.model('CustomBook');
const Book = mongoose.model('Book');
const UserBook = mongoose.model('UserBook');

const getCoversList = async (req, res) => {
  const { bookName, language } = req.query;

  if (!bookName) {
    return res.status(500).send('Must provide book name');
  }

  if (!language) {
    return res.status(500).send('Must provide language');
  }
  
  const query = language === 'ru' ? `${bookName} книга` : `${bookName} book`;
  const gl = language === 'ru' ? 'ru' : 'us';

  try {
    const { data } = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        gl,
        searchType: 'image',
        key: 'AIzaSyD0Gx2sBVthtxNrNGLZwQYVpGSeKaBnvUM',
        q: query,
        cx: '42a8480a652154a54',
        num: 10
      }
    });
    const items = data.items.filter(({ fileFormat }) => fileFormat === 'image/jpeg' || fileFormat === 'image/png' || fileFormat === 'image/webp')
    .map(({ link }) => {
      return {
        coverPath: link,
      }
    })
    res.send({ items });
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

    const dirName = '/var/www/html/images/covers/';

    const coversFolder = path.resolve(dirName, imagesFolderNamePrefix);

    if (!fs.existsSync(coversFolder)) {
      fs.mkdirSync(coversFolder);
    }

    const imageTitle = `${categoryPath}_${shortid.generate()}`;
    const _path = path.resolve(dirName, imagesFolderNamePrefix, `${imageTitle}.${getImageType(response.headers)}`);
    const writer = fs.createWriteStream(_path);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        const result = webp.cwebp(_path, path.resolve(dirName, imagesFolderNamePrefix, `${imageTitle}.webp`),'-q 80', logging="-v");
        return result.then(() => {
          // remove the original img
          fs.unlink(_path, (err) => {
            if (err) throw err;
          });
          resolve(`${imagesFolderNamePrefix}/${imageTitle}`)
        });
      })
      writer.on('error', reject)
    })
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

    const bookExists = await Book.findOne({ title, language }).collation( { locale: language, strength: 2 } );
    const customBookExists = await CustomBook.findOne({ title, language }).collation( { locale: language, strength: 2 } );

    console.log(bookExists, 'bookExists');
    console.log(customBookExists, 'customBookExists');

    if (bookExists || customBookExists) {
      return res.status(500).send('Book exists');
    }

    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const downloadedImage = coverPath !== 'default_cover' ? await downloadImage(coverPath, categoryPath) : 'default_cover';
    const customBook = await CustomBook.findOneAndUpdate(
      { title, userId },
      { categoryPath, coverPath: downloadedImage, authorsList, annotation, pages, language, votesCount: 0, added: timestamp },
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
    console.log(err, 'err')
    return res.status(500).send('Something went wrong');
  }
};

module.exports = { getCoversList, addCustomBook };
