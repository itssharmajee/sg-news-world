const API_Key = "248412db4d5b4162a9c301a1c4ad8de3";
const url = "https://newsapi.org/v2/everything?q=";

let currentPage = 1; // To track the current page for API calls
let currentQuery = "India"; // Default query
let isLoading = false; // To prevent multiple fetch calls
let totalArticlesLoaded = 0; // Total articles fetched so far
const ARTICLES_PER_LOAD = 30; // Number of articles to load at a time

window.addEventListener("load", () => fetchNews(currentQuery));

function reload() {
    window.location.reload();
}

async function fetchNews(query, page = 1) {
    if (isLoading) return; // Prevent multiple calls
    isLoading = true;

    try {
        const res = await fetch(`${url}${query}&apiKey=${API_Key}&page=${page}`);
        const data = await res.json();
        console.log(data);

        // Calculate the articles to display for this fetch
        const articles = data.articles.slice(0, ARTICLES_PER_LOAD);
        bindData(articles);

        totalArticlesLoaded += articles.length; // Update total articles count
    } catch (error) {
        console.error("Error fetching news:", error);
    } finally {
        isLoading = false;
    }
}

function bindData(articles) {
    const cardsContainer = document.querySelector(".cards-container");
    const newsCardTemplate = document.getElementById('template-news-card');

    articles.forEach(article => {
        if (!article.urlToImage) return;

        const cardClone = newsCardTemplate.content.cloneNode(true);

        fillDataInCard(cardClone, article);

        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImage = cardClone.querySelector('#news-image');
    const newsTitle = cardClone.querySelector('#news-title');
    const newsSource = cardClone.querySelector('#news-source');
    const newsDesc = cardClone.querySelector('#news-desc');

    newsImage.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", { timeZone: "Asia/Jakarta" });

    newsSource.innerHTML = `${article.source.name} . ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

let letCurSelectedNav = null;

function onNavItemClick(id) {
    resetState();
    currentQuery = id;
    fetchNews(id);

    const navItem = document.getElementById(id);
    letCurSelectedNav?.classList.remove("active");
    letCurSelectedNav = navItem;
    letCurSelectedNav.classList.add("active");
}

const searchBtn = document.getElementById("search-button");
const searchInput = document.getElementById("news-input");

searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (!query) return;

    resetState();
    currentQuery = query;

    fetchNews(query);
    letCurSelectedNav?.classList.remove("active");
    letCurSelectedNav = null;
});

// Lazy Loading: Detect when the user scrolls near the bottom
window.addEventListener("scroll", () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    // Check if the user is near the bottom of the page
    if (scrollHeight - scrollTop <= clientHeight + 100 && !isLoading) {
        currentPage += 1; // Increment page number
        fetchNews(currentQuery, currentPage); // Fetch more articles
    }
});

function resetState() {
    currentPage = 1;
    totalArticlesLoaded = 0;
    document.querySelector(".cards-container").innerHTML = ""; // Clear all articles
}
