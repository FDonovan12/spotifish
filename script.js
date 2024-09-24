import { PartyBlindtest, MainObject } from './objectValueBlindtest.js';
import {
    createClickEventOnButton,
    getValueFromPathname,
    getPathnameFromValue,
    researchFromYoutubeLink,
    addFormPointInfo,
    isAudience,
} from './utils.js';
import unitTest from './unitTest.js';

function testTheme(numberOne, numberTwo) {
    const result = numberOne;
    let sum = 0;
    for (let i = 0; i < numberTwo; i++) {
        sum += result;
    }
    console.log('sum :', sum);
    return sum;
}
// console.log(fileName);
const mainObject = new MainObject();
console.log(mainObject);
// let partyBlindtest = null;

createClickEventOnButton('#password', start);
start();
window.addEventListener('load', () => {
    resizeCanvas();
});
window.addEventListener('storage', () => {
    mainObject.updateStatus();
});
function start() {
    // unitTest();
    getPathnameFromValue('presenter.html');
    getValueFromPathname();
    mainObject.get();
    mainObject.partyBlindtest.save();
    mainObject.updateStatus();
    mainObject.partyBlindtest.save();

    try {
        document.querySelector('#openAudience').addEventListener('click', function () {
            window.open('audience.html', 'Audience').focus();
        });
    } catch (error) {}

    try {
        document.querySelector('#readJson').addEventListener('click', function () {
            mainObject.get(true);
            mainObject.partyBlindtest.save();
        });
    } catch (error) {}

    createClickEventOnButton('#play', mainObject.partyBlindtest.playAndPauseMusic, mainObject);
    createClickEventOnButton('#previous', mainObject.partyBlindtest.previousMusic, mainObject);
    createClickEventOnButton('#next', mainObject.partyBlindtest.nextMusic, mainObject);
    createClickEventOnButton('#downloadAnchorElem', mainObject.partyBlindtest.download, mainObject);
    createClickEventOnButton('#addParticpant', mainObject.partyBlindtest.addParticpant, mainObject);
    createClickEventOnButton('#addLinkYoutube', researchFromYoutubeLink);
    // createClickEventOnButton('#addPointInfo', addFormPointInfo);
    window.addFormPointInfo = addFormPointInfo;
    createClickEventOnButton('#validMusic', mainObject.partyBlindtest.validMusic, mainObject);
    createClickEventOnButton('#shuffleMusics', mainObject.partyBlindtest.shuffleMusics, mainObject);
    try {
        document.querySelector('#music-audio').addEventListener('ended', () => {
            setTimeout(() => {
                mainObject.partyBlindtest.nextMusic();
                mainObject.partyBlindtest.playMusic();
            }, 1000);
        });
    } catch (error) {}
    window.addEventListener('keydown', (key) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        console.log('key :', key);
        switch (key.code) {
            case 'Space':
                key.preventDefault();
                mainObject.partyBlindtest.playAndPauseMusic();
                break;
            case 'ArrowRight':
                key.preventDefault();
                mainObject.partyBlindtest.nextMusic();
                break;
            case 'ArrowLeft':
                key.preventDefault();
                mainObject.partyBlindtest.previousMusic();
                break;

            default:
                break;
        }
    });
}

function resizeCanvas() {
    const main = document.querySelector('main');
    canvas.width = main.getBoundingClientRect().width;
    canvas.height = main.getBoundingClientRect().height;
    // const style = getComputedStyle(canvas);
    // canvas.width = parseInt(style.width);
    // canvas.height = parseInt(style.height);
    console.log('canvas.width : ', canvas.width);
    console.log('canvas.height : ', canvas.height);
}

const canvas = document.getElementById('audioVisualizer');
const ctx = canvas.getContext('2d');
const audioElement = document.getElementById('music-audio');
// Créer un contexte audio
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioSource = audioContext.createMediaElementSource(audioElement);

// Créer un analyseur de fréquence
const analyser = audioContext.createAnalyser();
audioSource.connect(analyser);
analyser.connect(audioContext.destination);

// Configurer l'analyseur
analyser.fftSize = 1024; // Taille de la transformée de Fourier (détermine la résolution)
const bufferLength = analyser.frequencyBinCount; // Nombre de valeurs de fréquence
let dataArray = new Uint8Array(bufferLength); // Tableau pour stocker les données de fréquence
let previousDataArray = new Uint8Array(bufferLength);
let waves = [];

const channel = new BroadcastChannel('audio-channel');

// Fonction de visualisation
function draw(dataArray) {
    console.log('draw');
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner les barres de visualisation
    let barHeight;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const currentData = dataArray[i];
        const previousData = previousDataArray[i];
        barHeight = (currentData / 255) * canvas.height;
        const ratioZeroInData = 2.9;
        const barWidth = (canvas.width / bufferLength) * ratioZeroInData;
        if (currentData > previousData + 10) {
            waves.push({
                x: (i + 1) * barWidth - barWidth / 2, // Position X de la barre
                y: canvas.height - barHeight, // Position Y de la barre
                radius: 0, // Rayon initial de l'onde
                alpha: 1, // Opacité initiale de l'onde
                reduce: 1 / (currentData - previousData),
            });
        } else {
            ctx.shadowBlur = 0;
        }
        // Couleurs de la barre
        const r = barHeight + 50 * (i / (bufferLength * ratioZeroInData));
        const g = 150 * ((i / bufferLength) * ratioZeroInData);
        const b = 50;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, canvas.height);

        previousDataArray[i] = currentData;
        x += barWidth;
    }
    for (let j = 0; j < waves.length; j++) {
        let wave = waves[j];

        // Dessiner l'onde
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${wave.alpha})`; // Couleur blanche avec alpha
        ctx.stroke();
        ctx.closePath();

        // Agrandir le rayon et diminuer l'opacité pour l'effet de dissipation
        wave.radius += 1;
        wave.alpha -= wave.reduce;

        // Retirer l'onde une fois qu'elle est devenue complètement transparente
        if (wave.alpha <= 0) {
            waves.splice(j, 1);
            j--; // Ajuster l'indice car l'onde a été retirée
        }
    }
}

function processFrequencyData(data) {
    // Appliquer une amplification logarithmique pour accentuer les basses fréquences
    const newData = [];
    let newValue;
    for (let i = 0; i < data.length; i++) {
        // data[i] = Math.pow(data[i], 1.1); // Vous pouvez ajuster l'exposant pour plus d'effet
        const oldValue = data[i];
        newValue = oldValue;
        // newValue = Math.max(data[i] - (255 - data[i]) * 0.5, 0);
        // newValue = Math.min(Math.pow(data[i], 1.05), 255);
        // if (oldValue > 160) {
        //     newValue = Math.min(oldValue * 1.2, 255);
        // }
        newData.push(newValue);
        // data[i] = newValue; // Vous pouvez ajuster l'exposant pour plus d'effet
    }
    return newData;
}
channel.onmessage = function (event) {
    if (isAudience()) {
        const receivedData = new Uint8Array(event.data); // Recevoir les données de fréquence
        dataArray.set(receivedData); // Mettre à jour le tableau local
        draw(receivedData); // Dessiner la visualisation avec les nouvelles données
    }
};

function updateData() {
    analyser.getByteFrequencyData(dataArray);
    const processedData = processFrequencyData(dataArray);
    channel.postMessage(processedData); // Envoyer les données aux autres fenêtres
    draw(dataArray); // Dessiner dans la fenêtre maître
    // requestAnimationFrame(updateData); // Appeler la mise à jour uniquement dans la fenêtre maître
}
audioElement.onplay = function () {
    // La première fenêtre à démarrer l'audio devient la fenêtre maître
    if (!isAudience()) {
        audioContext.resume().then(() => {
            function loop() {
                if (audioElement.paused) {
                    console.log('stop loop');
                    return;
                } // Arrêter la boucle si la musique est en pause
                // analyser.getByteFrequencyData(dataArray);
                // channel.postMessage(dataArray); // Envoyer les données aux autres fenêtres
                requestAnimationFrame(loop); // Continuer la boucle
                updateData();
            }
            loop(); // Démarrer la boucle
        });
    }
};
