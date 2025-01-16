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
fetchArticle = async () => {
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
        key: x.Main_keyword,
        url: x.Link
      }
    });

    allMainKeywords = allMainKeywords.sort((a, b) => b.key.length - a.key.length);

    console.log("fetchArticle", articles.length);
    const articleListDiv = document.getElementById("articleList");
    if (articleListDiv) {
      renderArticleHTML(articleListDiv);
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
    appName: "mini-zalo-app-connection",
    reportName: "SEO_Remaker_Report",
    page: `${page}`,
    pageSize: `${pageSize}`,
  };
  console.log("fetchArticleWithPaginate", config);
  try {
    //get all records API
    return ZOHO.CREATOR.API.getAllRecords(config)
      .then(async function (response, error) {
        console.log("fetchArticleWithPaginate/error ==>", error);
        console.log("fetchArticleWithPaginate/response ==>", response);
        if (response.code === 3000 && response.data.length > 0) {
          for (const angle of response.data) {
            articlesResponse.push({
              ID: angle.ID,
              Main_keyword: angle.Main_keyword,
              Title: angle.Title,
              Link: angle.Link,
              Main_content: angle.Main_content,
              Makeup_content: "",
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
        cartOnProcess = false;
      });
  } catch (err) {
    console.error("fetchArticleWithPaginate", err);
    cartOnProcess = false;
  }
};

// cartOnProcess = false;
renderArticleHTML = (articleListDiv) => {
  console.log("renderArticleHTML", articles.length);
  // if(cartOnProcess) return;
  articleListDiv.innerHTML = "";
  let i = 1;
  for (const articleRecord of articles) {
    // Tạo phần tử div chứa thông tin sản phẩm
    const articalDiv = document.createElement("div");

    const articalTitle = document.createElement("p");
    const articalTitleSpan1 = document.createElement("span");
    articalTitleSpan1.textContent = `${i++}. Tiêu đề: `;
    const articalTitleSpan2 = document.createElement("span");
    articalTitleSpan2.textContent = articleRecord.Title;
    articalTitle.appendChild(articalTitleSpan1);
    articalTitle.appendChild(articalTitleSpan2);
    articalDiv.appendChild(articalTitle);

    const articalLink = document.createElement("p");
    const articalLinkSpan1 = document.createElement("span");
    articalLinkSpan1.textContent = "Link: ";
    const articalLinkSpan2 = document.createElement("a");
    articalLinkSpan2.href = articleRecord.Link;
    articalLinkSpan2.textContent = articleRecord.Link;
    articalLink.appendChild(articalLinkSpan1);
    articalLink.appendChild(articalLinkSpan2);
    articalDiv.appendChild(articalLink);


    const articalKey = document.createElement("p");
    const articalKeySpan1 = document.createElement("span");
    articalKeySpan1.textContent = "Main keyword: ";
    const articalKeySpan2 = document.createElement("span");
    articalKeySpan2.textContent = articleRecord.Main_keyword;
    articalKey.appendChild(articalKeySpan1);
    articalKey.appendChild(articalKeySpan2);
    articalDiv.appendChild(articalKey);

    const articalContent = document.createElement("div");
    let makeup_content = articleRecord.Main_content;
    // makeup_content = makeup_content.replace(articleRecord.Main_keyword, `<span> ${articleRecord.Main_keyword} </span>`)
    const keyword_regex = new RegExp(articleRecord.Main_keyword, 'gi');
    makeup_content = makeup_content.replace(keyword_regex, match => `<span style='color:orange'>${match}</span>`);
    // allMainKeywords.forEach(element => {
    //   if (element.key === articleRecord.Main_keyword) {

    //   } else {

    //   }

    // });
    articalContent.textContent = makeup_content;
    articalDiv.appendChild(articalContent);

    articleListDiv.appendChild(articalDiv);







  }
}
