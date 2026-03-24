const searchbox = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const clearButton = document.getElementById("clear-button");
const cardContainer = document.getElementById("card-container");
const cardEnlarger = document.getElementById("card-enlarger");
const enlargerCardImage = document.getElementById("enlarger-card-image");

let isAltPressed = false;
let hoveredCard = null;
let mouseX = 0;
let mouseY = 0;

function clearCards() {
    cardContainer.setAttribute("aria-hidden", "true");
    cardContainer.innerHTML = "";
}

function attachCardHoverListeners(cardImage) {
    cardImage.addEventListener("mouseenter", function() {
        hoveredCard = this;
        if (isAltPressed) {
            showEnlargedCard(this);
        }
    });

    cardImage.addEventListener("mouseleave", function() {
        hoveredCard = null;
        hideEnlargedCard();
    });
}

function createCardElement(card) {
    const newlink = document.createElement("a");
    newlink.href = card.scryfall_uri;
    newlink.target = "_blank";

    const newcard = document.createElement("img");
    if (card.image_uris) {
        newcard.src = card.image_uris.normal;
    } else if (card.card_faces) {
        newcard.src = card.card_faces[0].image_uris.normal;
    }

    newcard.alt = `Name: ${card.name}, Mana Cost ${card.mana_cost}, Type: ${card.type_line}, Set: ${card.set_name}, Oracle: ${card.oracle_text}, ${card.power && card.toughness ? `, P/T: ${card.power}/${card.toughness}` : ""}`;
    newcard.width = 200;
    newcard.height = 280;
    newcard.classList.add("card");

    attachCardHoverListeners(newcard);
    newlink.appendChild(newcard);

    return newlink;
}

function addLoadMoreButton(nextPageUrl) {
    const loadMore = document.createElement("button");
    loadMore.type = "button";
    loadMore.textContent = "Load More";
    loadMore.addEventListener("click", function() {
        fetchData(nextPageUrl);
        loadMore.remove();
    });
    document.getElementsByTagName("main")[0].appendChild(loadMore);
}

function fetchData(query, type = 0) {
    let url = null;

    switch (type) {
        case 0:
            url = query;
            break;
        case 1:
            url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`;
            clearCards();
            break;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                alert(`Alert failed: error code ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            data.data.forEach(card => {
                cardContainer.appendChild(createCardElement(card));
            });
            cardContainer.setAttribute("aria-hidden", "false");
            if (data.has_more === true) {
                addLoadMoreButton(data.next_page);
            }
        })
        .catch(error => {
            console.log(error);
        });
}

function updateEnlargedCardPosition() {
    cardEnlarger.style.left = `${mouseX + 15}px`;
    cardEnlarger.style.top = `${mouseY + 15}px`;
}

function showEnlargedCard(cardImg) {
    enlargerCardImage.src = cardImg.src;
    enlargerCardImage.alt = cardImg.alt;
    updateEnlargedCardPosition();
    cardEnlarger.classList.add("active");
}

function hideEnlargedCard() {
    cardEnlarger.classList.remove("active");
}

document.addEventListener("mousemove", function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cardEnlarger.classList.contains("active")) {
        updateEnlargedCardPosition();
    }
});

window.addEventListener("keydown", function(e) {
    if (e.key === "Alt") {
        e.preventDefault();
        isAltPressed = true;
        if (hoveredCard) {
            showEnlargedCard(hoveredCard);
        }
    }
}, true);

window.addEventListener("keyup", function(e) {
    if (e.key === "Alt") {
        e.preventDefault();
        isAltPressed = false;
        hideEnlargedCard();
    }
}, true);

window.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        hideEnlargedCard();
        isAltPressed = false;
    }
}, true);

searchButton.addEventListener("click", function() {
    fetchData(searchbox.value, 1);
});

clearButton.addEventListener("click", function() {
    clearCards();
});

searchbox.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        fetchData(searchbox.value, 1);
    }
});