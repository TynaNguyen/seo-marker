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
    const articalEdit = document.createElement("a");
    articalEdit.href = `https://creatorapp.zoho.com/tsxcorp/seo-remarker/#Form:SEO_Remaker?recLinkID=${element.ID}&viewLinkName=SEO_Remaker_Report`;
    articalEdit.target = "_blank";
    const articalDiv = document.createElement("div");
    articalDiv.className = "p-8 m-[24px] rounded-2xl border border-[#EBEBEB] bg-[#FFF] shadow-lg";
    const articalTitle = document.createElement("p");
    articalTitle.className = "pb-2";
    const articalTitleSpan1 = document.createElement("span");
    articalTitleSpan1.textContent = `${i}. Tiêu đề: `;
    articalTitleSpan1.className = "font-semibold text-lg";
    const articalTitleSpan2 = document.createElement("span");
    articalTitleSpan2.className = "text-lg";
    articalTitleSpan2.textContent = articleRecord.Title;
    articalTitle.appendChild(articalTitleSpan1);
    articalTitle.appendChild(articalTitleSpan2);
    articalDiv.appendChild(articalTitle);
    articalEdit.appendChild(articalDiv);

    const articalLink = document.createElement("p");
    articalLink.className = "pb-2";
    const articalLinkSpan1 = document.createElement("span");
    articalLinkSpan1.textContent = "Link: ";
    articalLinkSpan1.className = "font-semibold text-lg";
    const articalLinkSpan2 = document.createElement("a");
    articalLinkSpan2.className = "text-blue text-lg"
    articalLinkSpan2.href = articleRecord.Link;
    articalLinkSpan2.textContent = articleRecord.Link;
    articalLink.appendChild(articalLinkSpan1);
    articalLink.appendChild(articalLinkSpan2);
    articalDiv.appendChild(articalLink);


    const articalKey = document.createElement("p");
    articalKey.className = "pb-2";
    const articalKeySpan1 = document.createElement("span");
    articalKeySpan1.textContent = "Main keyword: ";
    articalKeySpan1.className = "font-semibold text-lg";
    const articalKeySpan2 = document.createElement("span");
    articalKeySpan2.textContent = articleRecord.Main_keyword;
    articalKeySpan2.className = "text-lg";
    articalKey.appendChild(articalKeySpan1);
    articalKey.appendChild(articalKeySpan2);
    articalDiv.appendChild(articalKey);

    const articalContent = document.createElement("div");
    articalContent.className = "pt-2 text-base";
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
    articalContent.innerHTML = makeup_content;
    articalDiv.appendChild(articalContent);
    if (!angleQueryID || angleQueryID.length === 0 || articleRecord.Angle === angleQueryID) {
      if (!keySearch || keySearch.length === 0 || containsKeyword(articleRecord.Title, keySearch)) {
        i++;
        articleListDiv.appendChild(articalDiv);
      }
    }






  }
}

containsKeyword = (text, keyword) => {
  const regex = new RegExp(keyword, 'i');
  return regex.test(text);
}
