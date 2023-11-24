const axios = require('axios');

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

module.exports = { getCoversList };
