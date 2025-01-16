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
        await fetchUserCart();
        await deleteUserCart();
      });
    } catch (err) {
      console.error("initZohoApp", err);
    }
  };
  let articles = [];
  fetchArticle = async () => {
    console.log("fetchArticle", userId);
    articles = [];
    //configuration json
    config = {
      appName: "mini-zalo-app-connection",
      reportName: "SEO_Remaker_Report",
      page: "1",
      pageSize: "200",
    };
    console.log("fetchArticle", config);
    try {
      //get all records API
      return ZOHO.CREATOR.API.getAllRecords(config)
        .then(async function (response, error) {
          console.log("fetchArticle/error ==>", error);
          console.log("fetchArticle/response ==>", response);
          if (response.code === 3000 && response.data.length > 0) {
            for (const angle of response.data) {
                articles.push({
                    ID: angle.ID,
                    Main_keyword: angle.Main_keyword,
                    Title: angle.Title,
                    Link: angle.Link,
                    Main_content: angle.Main_content,
                });
            }
          } else {
            console.log("fetchArticle/No record");
          }
          console.log("fetchArticle/articles", articles);
  
          const articleListDiv = document.getElementById("articleList");
          if (articleListDiv) {
            renderArticleHTML(articleListDiv);
          }
  
        })
        .catch((err) => {
          console.error("fetchArticle/then", err);
          cartOnProcess = false;
        });
    } catch (err) {
      console.error("fetchUserCart", err);
      cartOnProcess = false;
    }
  };

  
// cartOnProcess = false;
renderArticleHTML = (articleListDiv) => {
    // if(cartOnProcess) return;
    articleListDiv.innerHTML = "";
  
    for (const article of articles) {
      // Tạo phần tử div chứa thông tin sản phẩm
      const articalDiv = document.createElement("div");
  
      const articalTitle = document.createElement("p");

      const articalTitleSpan1 = document.createElement("span");
      articalTitleSpan1.textContent = "Tiêu đề: ";
      const articalTitleSpan2 = document.createElement("span");
      articalTitleSpan2.textContent = article.Title;
      articalTitle.appendChild(articalTitleSpan1);
      articalTitle.appendChild(articalTitleSpan2);
      articalDiv.appendChild(articalTitle);
      articleListDiv.appendChild(articalDiv);
    }
  }
  