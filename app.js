// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();
const loadNews = (function () {
  const url = 'https://newsapi.org/v2/';
  const apiKey = '8cd4ecb050fb420db08ec77f0f9b83f9';
  return {
    topHeadlines(country, category, cb) {
      http.get(`${url}top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
    },
    everything(element, cb) {
      http.get(`${url}everything?q=${element}&apiKey=${apiKey}`, cb);
    }
  }
}());

const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchSelect = form.elements['search'];
const categorySelect = form.elements['category'];
const container = document.querySelector('.row.grid-container');


//  init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  downloadNews();
});

form.addEventListener('submit', e => {
  e.preventDefault();
  downloadNews();
})

function downloadNews() {
  addPreloader();
  let country = countrySelect.value;
  let elem = searchSelect.value;
  let category = categorySelect.value;
  if (elem) {
    loadNews.everything(elem, (err, news) => {
      createListNews(err, news.articles);
    })
  } else {
    loadNews.topHeadlines(country, category, (err, news) => {
      createListNews(err, news.articles);
    })
  }
}

function createListNews(err, news) {
  removePreloader();
  if (err) {
    M.toast({ html: err })
    return
  }
  if (news.length === 0) {
    M.toast({ html: 'Нету новостей по данному запросу' })
    return
  }
  cleanerContainer();
  let fragment = '';
  news.forEach(news => {
    fragment += createItemNew(news);
  })
  container.insertAdjacentHTML('afterbegin', fragment);
}

function createItemNew({ urlToImage, title, description, url }) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFhRacd4-SIfAeKjv2tsrlimW9z7cvqpcCgO0_KugS2_6r-RJWr7cWpImue7wS9YRhZ_U&usqp=CAU'}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

function cleanerContainer() {
  container.innerHTML = '';
}

function addPreloader(){
  document.body.insertAdjacentHTML('afterbegin', '<div class="progress"><div div class= "indeterminate" ></div > </div >')
}

function removePreloader(){
  const loader = document.querySelector('.progress');
  if (loader){
    loader.remove();
  }
}