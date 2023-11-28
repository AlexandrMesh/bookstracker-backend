const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const webp = require('webp-converter');
const { validationResult } = require('express-validator');
const CustomBook = mongoose.model('CustomBook');
const UserBook = mongoose.model('UserBook');

const getCoversList = async (req, res) => {
  const { bookName, language } = req.query;
  
  const result = validationResult(req);
  if (result.isEmpty()) {
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
  } else {
    res.status(500).send({ errors: result.array({ onlyFirstError: true }) });
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

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      const downloadedImage = coverPath !== 'default_cover' ? await downloadImage(coverPath, categoryPath) : 'default_cover';
      const customBook = new CustomBook({ title, userId, categoryPath, coverPath: downloadedImage, authorsList, annotation, pages, language, votesCount: 0, added: timestamp });
      await customBook.save();
      if (status !== 'all') {
        const userBook = new UserBook({ userId, bookId: customBook._id, bookStatus: status, added: timestamp });
        await userBook.save();
      }
      return res.send({ status: 'ok' });
    } catch (err) {
      return res.status(500).send('Something went wrong');
    }
  } else {
    return res.status(500).send({ errors: result.array({ onlyFirstError: true }) });
  }
};

module.exports = { getCoversList, addCustomBook };
