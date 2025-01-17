initZohoApp = () => {
  console.log("initZohoApp");
  try {
    ZOHO.CREATOR.init().then(async function (data) {
      // Xem ai đang đăng nhập
      console.log("ZOHO.CREATOR.init data", data);
      var initparams = ZOHO.CREATOR.UTIL.getInitParams();
      console.log("initparams", initparams);
      // getExistedUser(initparams.loginUser);
      userId = initparams.loginUser;
    });
  } catch (err) {
    console.error("initZohoApp", err);
  }
};
let articles = [];
let allMainKeywords = [];
fetchArticle = async (angleQuery = '', keySearch = '') => {
  console.log("fetchArticle");
  articles = [];
  allMainKeywords = [];
  try {
    const articlesResponse = await fetchArticleWithPaginate();
    console.log("fetchArticle/articlesResponse", articlesResponse.length);
    Array.prototype.push.apply(articles, articlesResponse);
    if (articlesResponse.length === 200) {
      let page = 1;
      let lastPage = false;
      while (!lastPage) {
        const newArticlesResponse = await fetchArticleWithPaginate(++page);
        console.log("fetchArticle/newArticlesResponse", newArticlesResponse.length);
        Array.prototype.push.apply(articles, newArticlesResponse);
        if (newArticlesResponse.length < 200) {
          lastPage = true;
        }
      }
    }

    // xu ly doi mau va gan link
    allMainKeywords = articles.map(x => {
      return {
        key: x.Main_keyword.toLowerCase(),
        Link: x.Link,
        count: 0,
      }
    });

    allMainKeywords = allMainKeywords.sort((a, b) => b.key.length - a.key.length);

    console.log("fetchArticle", articles.length);
    const articleListDiv = document.getElementById("articleList");
    if (articleListDiv) {
      renderArticleHTML(articleListDiv, angleQuery, keySearch);
    }

  } catch (err) {
    console.error("fetchUserCart", err);
    cartOnProcess = false;
  }
};

fetchArticleWithPaginate = async (page = 1, pageSize = 200) => {
  console.log("fetchArticleWithPaginate", page, pageSize);
  const articlesResponse = [];
  //configuration json
  config = {
    appName: "seo-remarker",
    reportName: "SEO_Remaker_Report",
    page: `${page}`,
    pageSize: `${pageSize}`,
  };
  console.log("fetchArticleWithPaginate/config", config);
  try {
    //get all records API
    return ZOHO.CREATOR.API.getAllRecords(config)
      .then(async function (response, error) {
        console.log("fetchArticleWithPaginate/error ==>", error);
        console.log("fetchArticleWithPaginate/response ==>", response);
        if (response.code === 3000 && response.data && response.data.length > 0) {
          for (const angle of response.data) {
            articlesResponse.push({
              ID: angle.ID,
              Main_keyword: angle.Main_keyword,
              Title: angle.Title,
              Link: angle.Link,
              Main_content: angle.Main_content,
              Makeup_content: "",
              Angle: angle.Angle.ID,
            });
          }
        } else {
          console.log("fetchArticleWithPaginate/No record");
        }
        console.log("fetchArticleWithPaginate/articles", articlesResponse);
        return articlesResponse;
      })
      .catch((err) => {
        console.error("fetchArticleWithPaginate/then", err);
        return articlesResponse;
      });
  } catch (err) {
    console.error("fetchArticleWithPaginate", err);
    return articlesResponse;
  }
};

// cartOnProcess = false;
renderArticleHTML = (articleListDiv, angleQueryID = '', keySearch = '') => {
  console.log("renderArticleHTML", articles.length);
  // if(cartOnProcess) return;
  articleListDiv.innerHTML = "";
  let i = 1;
  for (const articleRecord of articles) {
    // Tạo phần tử div chứa thông tin sản phẩm

    const urlEdit = `https://creatorapp.zoho.com/tsxcorp/seo-remarker/#Form:SEO_Remaker?recLinkID=${articleRecord.ID}&viewLinkName=SEO_Remaker_Report`;
    const articleDiv = document.createElement("div");
    articleDiv.className = "p-8 m-[24px] rounded-2xl border border-[#EBEBEB] bg-[#FFF] shadow-lg";
    const articleTitle = document.createElement("p");
    articleTitle.className = "pb-2";
    const articleTitleSpan1 = document.createElement("span");
    articleTitleSpan1.textContent = `${i}. Tiêu đề: `;
    articleTitleSpan1.className = "font-semibold text-lg";
    const articleTitleSpan2 = document.createElement("span");
    articleTitleSpan2.className = "text-lg";
    articleTitleSpan2.textContent = articleRecord.Title;
    const articleEditButton = document.createElement("button");
    articleEditButton.textContent = "Edit";
    articleTitleSpan2.className = "pl-5";
    articleEditButton.addEventListener('click', function () {
      window.open(urlEdit, '_blank');
      // document.getElementById('popupForm').classList.add('active');
    });

    articleTitle.appendChild(articleTitleSpan1);
    articleTitle.appendChild(articleTitleSpan2);
    articleTitle.appendChild(articleEditButton);
    articleDiv.appendChild(articleTitle);


    const articleLink = document.createElement("p");
    articleLink.className = "pb-2";
    const articleLinkSpan1 = document.createElement("span");
    articleLinkSpan1.textContent = "Link: ";
    articleLinkSpan1.className = "font-semibold text-lg";
    const articleLinkSpan2 = document.createElement("a");
    articleLinkSpan2.className = "text-blue text-lg"
    articleLinkSpan2.href = articleRecord.Link;
    articleLinkSpan2.textContent = articleRecord.Link;
    articleLink.appendChild(articleLinkSpan1);
    articleLink.appendChild(articleLinkSpan2);
    articleDiv.appendChild(articleLink);


    const articleKey = document.createElement("p");
    articleKey.className = "pb-2";
    const articleKeySpan1 = document.createElement("span");
    articleKeySpan1.textContent = "Main keyword: ";
    articleKeySpan1.className = "font-semibold text-lg";
    const articleKeySpan2 = document.createElement("span");
    articleKeySpan2.textContent = articleRecord.Main_keyword;
    articleKeySpan2.className = "text-lg";
    articleKey.appendChild(articleKeySpan1);
    articleKey.appendChild(articleKeySpan2);
    articleDiv.appendChild(articleKey);

    const articleContent = document.createElement("div");
    articleContent.className = "pt-2 text-base";
    let makeup_content = articleRecord.Main_content;
    // makeup_content = makeup_content.replace(articleRecord.Main_keyword, `<span> ${articleRecord.Main_keyword} </span>`)
    const keyword_regex = new RegExp(articleRecord.Main_keyword, 'gi');
    makeup_content = makeup_content.replace(keyword_regex, match => `<span style='color:orange'>${match}</span>`);
    allMainKeywords.forEach(element => {
      if (element.key.includes(articleRecord.Main_keyword)) {

      } else {
        const regex = new RegExp(`\\b${element.key}\\b`, 'gi');
        let isFirst = false;
        makeup_content = makeup_content.replace(regex, match => {
          if (!isFirst) {
            isFirst = true
            return `<a style="color:blue;text-decoration: underline;" href="${element.Link}">${match}</a>`;
          } else {
            return `<span style='color:pink'>${match}</span>`;
          }
        });
      }
    });
    articleContent.innerHTML = makeup_content;
    articleDiv.appendChild(articleContent);

    // const articleEdit = document.createElement("a");
    // articleEdit.href = `https://creatorapp.zoho.com/tsxcorp/seo-remarker/#Form:SEO_Remaker?recLinkID=${articleRecord.ID}&viewLinkName=SEO_Remaker_Report`;
    // articleEdit.target = "_blank";
    // articleEdit.appendChild(articleDiv);
    if (!angleQueryID || angleQueryID.length === 0 || articleRecord.Angle === angleQueryID) {
      if (!keySearch || keySearch.length === 0 || containsKeyword(articleRecord.Title, keySearch)) {
        i++;
        articleListDiv.appendChild(articleDiv);
      }
    }
  }
}

containsKeyword = (text, keyword) => {
  const regex = new RegExp(keyword, 'i');
  return regex.test(text);
}
