const root = document.getElementById('root');
const home = document.getElementById('tweetItems');
const custom_alert = document.getElementById('alertMessage');
const modify = document.getElementById('modifyItem');

// Routing implementation
const router = () => {
    // Array with available routes
    const routes = [
        { path: '#', view: 'Home' },
        { path: '#add', view: 'Add' },
        { path: '#edit/:id', view: 'Edit' },
        { path: '#liked', view: 'Liked' }
    ];

    // Function to check if current url is valid
    const potentialMatches = routes.map((route) => {
        let url = '/' + location.href.split('#')[1];
        return {
            route: route,
            result: url.match(pathToRegex(route.path.replace('#', '/')))
        };
    });

    // Variable to store info about current url
    let match = potentialMatches.find(
        (potentialMatch) => potentialMatch.result !== null
    );

    // If current url is not valid, redirect to home page
    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname]
        };
        window.history.replaceState(null, null, '#');
    }

    // Variables to store path (and params for edit page)
    const view = match.route.view;
    const params = getParams(match);

    // Render page depending on path
    render(view, params);

    window.scroll({
        left: 0,
        top: 0,
        behavior: 'smooth'
    });
};

// Render function
const render = (view, params) => {
    switch (view) {
        case 'Add':
            renderAdd();
            break;
        case 'Edit':
            renderEdit(Number(params.id));
            break;
        case 'Liked':
            renderLiked();
            break;
        default:
            renderMain();
            break;
    }
};

// Check if url contains a subcategory of a valid path
const pathToRegex = (path) =>
    new RegExp('^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '(.+)') + '$');

// Get subcategories of path
const getParams = (match) => {
    const values = match.result.slice(1);
    const keys = Array.from(
        match.route.path.replace('#', '/').matchAll(/:(\w+)/g)
    ).map((result) => result[1]);

    return Object.fromEntries(
        keys.map((key, i) => {
            return [key, values[i]];
        })
    );
};

// Change page
const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};

window.addEventListener('popstate', router);

// When HTML is loaded, render main page
document.addEventListener('DOMContentLoaded', () => {
    router();
});

// Render main page
const renderMain = () => {
    home.style.display = 'flex';
    custom_alert.style.display = 'none';
    modify.style.display = 'none';

    let add_btn = document.createElement('button');
    add_btn.classList = 'add_btn btn';
    add_btn.innerHTML = 'Add tweet';
    add_btn.onclick = () => {
        navigateTo('#add');
    };

    document.getElementById('navigationButtons').innerHTML = '';
    document.getElementById('navigationButtons').append(add_btn);

    renderTweets(false);

    // Change text for h1 tag
    for (
        let i = 0;
        i < document.getElementById('tweetItems').children.length;
        i++
    ) {
        if (
            document.getElementById('tweetItems').children[i].tagName === 'H1'
        ) {
            document.getElementById('tweetItems').children[i].innerText =
                'Simple Twitter';
        }
    }
};

// Render Add new tweet page
const renderAdd = () => {
    home.style.display = 'none';
    custom_alert.style.display = 'none';
    modify.style.display = 'block';
    document.getElementById('modifyItemHeader').innerText = 'Add tweet';

    document.getElementById('saveModifiedItem').onclick = () => {
        addNewTweet();
    };
    document.getElementById('cancelModification').onclick = () => {
        document.getElementById('modifyItemInput').value = '';
        navigateTo('#');
    };
};

// Render Edit tweet page
const renderEdit = (id) => {
    home.style.display = 'none';
    custom_alert.style.display = 'none';
    modify.style.display = 'block';
    document.getElementById('modifyItemHeader').innerText = 'Edit tweet';

    let textInput = document.getElementById('modifyItemInput');
    let tweets = getTweets();
    for (let i = 0; i < tweets.length; i++) {
        if (tweets[i].id === id) {
            textInput.value = tweets[i].text;
        }
    }

    document.getElementById('saveModifiedItem').onclick = () => {
        editTweet(id);
    };

    document.getElementById('cancelModification').onclick = () => {
        document.getElementById('modifyItemInput').value = '';
        navigateTo('#');
    };
};

// Render Liked tweets page
const renderLiked = () => {
    home.style.display = 'flex';
    custom_alert.style.display = 'none';
    modify.style.display = 'none';

    let back_btn = document.createElement('button');
    back_btn.classList = 'back_btn btn';
    back_btn.innerHTML = 'Back to main';
    back_btn.onclick = () => {
        navigateTo('#');
    };

    document.getElementById('navigationButtons').innerHTML = '';
    document.getElementById('navigationButtons').append(back_btn);

    // Change text for h1 tag
    for (
        let i = 0;
        i < document.getElementById('tweetItems').children.length;
        i++
    ) {
        if (
            document.getElementById('tweetItems').children[i].tagName === 'H1'
        ) {
            document.getElementById('tweetItems').children[i].innerText =
                'Liked Tweets';
        }
    }

    renderTweets(true);
};

// Add new tweet button
const addNewTweet = () => {
    let tweets = getTweets();
    let textInput = document.getElementById('modifyItemInput');
    if (validateTweetInput(textInput.value, tweets)) {
        let tweet_id =
            tweets.length === 0 ? 1 : tweets[tweets.length - 1].id + 1;
        tweets.push({ id: tweet_id, text: textInput.value, liked: false });
        setTweets(tweets);
        // After adding tweet navigate to main page
        navigateTo('#');
    }
    textInput.value = '';
};

// Edit tweet button
const editTweet = (tweet_id) => {
    let tweets = getTweets();
    let textInput = document.getElementById('modifyItemInput');
    if (validateTweetInput(textInput.value, tweets)) {
        for (let i = 0; i < tweets.length; i++) {
            if (tweets[i].id === tweet_id) {
                tweets[i].text = textInput.value;
            }
        }
        setTweets(tweets);
        // After edit navigate to main page
        navigateTo('#');
    }
    textInput.value = '';
};

// Render tweet element
const renderSingleTweet = (tweet_element) => {
    const list = document.getElementById('list');
    let tweet_wrapper = document.createElement('li');
    tweet_wrapper.className = 'tweet';

    let tweet = document.createElement('div');
    tweet.className = 'tweet_content';
    tweet.id = tweet_element.id;
    tweet.onclick = () => {
        navigateTo('#edit/' + tweet_element.id);
    };

    let tweet_text = document.createElement('span');
    tweet_text.className = 'tweet_text';
    tweet_text.innerText = tweet_element.text;
    tweet_text.style.background = tweet_element.liked ? '#012e0c' : '#fff';
    tweet_text.style.color = tweet_element.liked ? '#fff' : '#000';

    let tweet_btn = document.createElement('button');
    tweet_btn.classList = 'btn tweet_btn like_btn';
    tweet_btn.innerText = tweet_element.liked ? 'Unlike' : 'Like';

    let tweet_delete_btn = document.createElement('button');
    tweet_delete_btn.classList = 'btn tweet_btn delete_btn';
    tweet_delete_btn.innerText = 'Remove';

    let tweet_btns = document.createElement('div');
    tweet_btns.className = 'tweet_buttons';

    tweet_btns.append(tweet_btn);
    tweet_btns.append(tweet_delete_btn);

    tweet_btn.addEventListener('click', () => {
        likeTweet(tweet_element.id);
    });

    tweet_delete_btn.addEventListener('click', () => {
        deleteTweet(tweet_element.id);
    });

    tweet.append(tweet_text);
    tweet_wrapper.append(tweet);
    tweet_wrapper.append(tweet_btns);

    list.append(tweet_wrapper);
};

// Render list of tweets
const renderTweets = (isLiked) => {
    const list = document.getElementById('list');
    list.innerHTML = '';
    let likedTweets = [];
    // localStorage should not be empty
    if (localStorage.getItem('tweets') !== null) {
        let tweets = getTweets();
        for (let i = 0; i < tweets.length; i++) {
            // Check for liked tweets
            if (tweets[i].liked) {
                likedTweets.push(tweets[i]);
            }
            // If current page 'Liked Tweets' then render only liked tweets
            // Else render all
            if (isLiked) {
                if (tweets[i].liked) {
                    renderSingleTweet(tweets[i]);
                }
            } else {
                renderSingleTweet(tweets[i]);
            }
        }
    }
    if (!isLiked) {
        showLiked(likedTweets);
    }
};

// If there are liked tweets show 'Go to liked' button
const showLiked = (likedTweets) => {
    if (likedTweets.length === 0) {
        if (document.querySelector('.likedTweets')) {
            document.querySelector('.likedTweets').remove();
        }
        return;
    }
    if (!document.querySelector('.likedTweets')) {
        let liked_btn = document.createElement('button');
        liked_btn.classList = 'likedTweets btn';
        liked_btn.innerText = 'Go to liked';
        liked_btn.onclick = () => {
            navigateTo('#liked');
        };

        document.getElementById('navigationButtons').append(liked_btn);
    }
};

// Get info about tweets from localStorage
const getTweets = () => {
    let tweets = [];
    if (localStorage.getItem('tweets') !== null) {
        tweets = JSON.parse(localStorage.getItem('tweets'));
    }
    return tweets;
};

// Set info about tweets in localStorage
const setTweets = (tweets) => {
    localStorage.setItem('tweets', JSON.stringify(tweets));
};

// Like tweet function
const likeTweet = (id) => {
    let tweets = getTweets();
    for (let i = 0; i < tweets.length; i++) {
        if (tweets[i].id === id) {
            tweets[i].liked = !tweets[i].liked;
            if (tweets[i].liked) {
                showAlert(`Hooray! You liked tweet with id ${id}!`);
            } else {
                showAlert(`Sorry you no longer like tweet with id ${id}`);
            }
        }
    }

    setTweets(tweets);
    // If current page is 'Liked Tweets' then render only liked tweets
    // Else render all
    if (window.location.hash === '#liked') {
        renderTweets(true);
    } else {
        renderTweets(false);
    }
};

// Function to delete tweet
const deleteTweet = (id) => {
    let tweets = getTweets();
    for (let i = 0; i < tweets.length; i++) {
        if (tweets[i].id === id) {
            tweets.splice(i, 1);
            i--;
        }
    }

    setTweets(tweets);
    // If current page is 'Liked Tweets' then render only liked tweets
    // Else render all
    if (window.location.hash === '#liked') {
        renderTweets(true);
    } else {
        renderTweets(false);
    }
};

// Function to validate tweet text
const validateTweetInput = (textInput, tweets) => {
    // Valid tweet should not be a duplicate, empty or be more than 140 symbols in length
    const max_size = 140;
    if (textInput === '') {
        showAlert('Tweet should not be empty!');
        return false;
    }
    if (textInput.length > max_size) {
        showAlert('Tweet max length is 140 symbols!');
        return false;
    }
    for (let i = 0; i < tweets.length; i++) {
        if (tweets[i].text === textInput) {
            showAlert(`Error! You can't tweet about that`);
            return false;
        }
    }

    return true;
};

// Show alert and hide it 2 sec after
const showAlert = (text) => {
    const time = 2000;
    let msg = document.getElementById('alertMessage');
    let msg_text = document.getElementById('alertMessageText');
    msg.style.display = 'block';
    msg_text.innerText = text;
    setTimeout(() => {
        msg.style.display = 'none';
        msg_text.innerText = '';
    }, time);
};
