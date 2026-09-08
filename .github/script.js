// ========================================
// FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyCimYZGMFupJn7TB7YePbaIYxHiE48yAeU",
    authDomain: "two-truths-one-lie-f1a44.firebaseapp.com",
    projectId: "two-truths-one-lie-f1a44",
    storageBucket: "two-truths-one-lie-f1a44.firebasestorage.app",
    messagingSenderId: "181777095842",
    appId: "1:181777095842:web:266d64068265430948cbfb",
    measurementId: "G-GP6THS0JDG"
};


// ========================================
// INITIALIZE FIREBASE
// ========================================

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


// ========================================
// CREATE GAME
// ========================================

const gameForm = document.getElementById("gameForm");
const statusText = document.getElementById("status");

gameForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const playerName =
        document.getElementById("playerName").value.trim();

    const statement1 =
        document.getElementById("statement1").value.trim();

    const statement2 =
        document.getElementById("statement2").value.trim();

    const statement3 =
        document.getElementById("statement3").value.trim();

    const selectedLie =
        document.querySelector('input[name="lie"]:checked');


    // Make sure a lie was selected
    if (!selectedLie) {

        statusText.textContent =
            "⚠️ Please choose which statement is the lie.";

        return;
    }


    const lie = Number(selectedLie.value);


    statusText.textContent =
        "Saving your game...";


    try {

        await db.collection("games").add({

            playerName: playerName,

            statement1: statement1,

            statement2: statement2,

            statement3: statement3,

            lie: lie,

            createdAt:
                firebase.firestore.FieldValue.serverTimestamp()

        });


        statusText.textContent =
            "🎉 Your game has been added!";


        gameForm.reset();


        setTimeout(function () {

            statusText.textContent = "";

        }, 3000);


    } catch (error) {

        console.error(
            "Error adding game:",
            error
        );

        statusText.textContent =
            "❌ Unable to save your game.";

    }

});


// ========================================
// DISPLAY GAMES
// ========================================

const gamesContainer =
    document.getElementById("gamesContainer");


db.collection("games")
    .orderBy("createdAt", "desc")
    .onSnapshot(

        function (snapshot) {

            gamesContainer.innerHTML = "";


            // No games yet
            if (snapshot.empty) {

                gamesContainer.innerHTML = `
                    <div class="empty">
                        No games yet.
                        Be the first to create one! 🎭
                    </div>
                `;

                return;
            }


            // Display every game
            snapshot.forEach(function (doc) {

                const game = doc.data();

                createGameCard(
                    game,
                    doc.id
                );

            });

        },


        function (error) {

            console.error(
                "Error loading games:",
                error
            );

            gamesContainer.innerHTML = `
                <div class="empty">
                    ❌ Unable to load games.
                </div>
            `;

        }

    );


// ========================================
// CREATE GAME CARD
// ========================================

function createGameCard(game, id) {

    const card =
        document.createElement("div");

    card.className = "game-card";


    card.innerHTML = `

        <div class="player-name">
            🎭 ${escapeHTML(game.playerName)}
        </div>


        <div class="statement">

            <span class="number">
                1
            </span>

            <span>
                ${escapeHTML(game.statement1)}
            </span>

        </div>


        <div class="statement">

            <span class="number">
                2
            </span>

            <span>
                ${escapeHTML(game.statement2)}
            </span>

        </div>


        <div class="statement">

            <span class="number">
                3
            </span>

            <span>
                ${escapeHTML(game.statement3)}
            </span>

        </div>


        <div class="guess-title">
            🤔 Which one is the lie?
        </div>


        <div class="guess-buttons">

            <button
                onclick="guess('${id}', 1)">
                #1
            </button>

            <button
                onclick="guess('${id}', 2)">
                #2
            </button>

            <button
                onclick="guess('${id}', 3)">
                #3
            </button>

        </div>


        <button
            class="reveal-btn"
            onclick="reveal('${id}', ${game.lie})">

            👀 Reveal Answer

        </button>


        <div id="result-${id}"></div>

    `;


    gamesContainer.appendChild(card);

}


// ========================================
// GUESS THE LIE
// ========================================

function guess(id, selected) {

    // Save user's guess
    window[`guess_${id}`] =
        selected;


    const result =
        document.getElementById(
            `result-${id}`
        );


    result.innerHTML = `

        <div class="result">

            🤔 You selected
            Statement #${selected}.

            <br>

            Click
            "Reveal Answer"!

        </div>

    `;

}


// ========================================
// REVEAL ANSWER
// ========================================

function reveal(id, correctAnswer) {

    const selected =
        window[`guess_${id}`];


    const result =
        document.getElementById(
            `result-${id}`
        );


    // User hasn't guessed yet
    if (!selected) {

        result.innerHTML = `

            <div class="result">

                ⚠️ Pick an answer first!

            </div>

        `;

        return;
    }


    // Correct answer
    if (selected === correctAnswer) {

        result.innerHTML = `

            <div class="result correct">

                🎉 Correct!

                <br>

                You spotted the lie!

            </div>

        `;

    }

    // Wrong answer
    else {

        result.innerHTML = `

            <div class="result wrong">

                😭 Nope!

                <br>

                The lie was
                Statement #${correctAnswer}.

            </div>

        `;

    }

}


// ========================================
// RANDOM GAME
// ========================================

const randomButton =
    document.getElementById("randomBtn");


randomButton.addEventListener(
    "click",
    function () {

        const cards =
            document.querySelectorAll(
                ".game-card"
            );


        // No games
        if (cards.length === 0) {

            return;

        }


        // Pick random card
        const randomIndex =
            Math.floor(
                Math.random() * cards.length
            );


        // Scroll to random game
        cards[randomIndex].scrollIntoView({

            behavior: "smooth",

            block: "center"

        });


        // Small animation
        cards[randomIndex].animate(

            [

                {
                    transform: "scale(1)"
                },

                {
                    transform: "scale(1.03)"
                },

                {
                    transform: "scale(1)"
                }

            ],

            {

                duration: 500

            }

        );

    }
);


// ========================================
// HTML SECURITY
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent = text;


    return div.innerHTML;

}
