document.addEventListener('DOMContentLoaded',() => {

    //Variables
const btnComenzar = document.getElementById('comenzar');
const btnCapturar = document.getElementById('btn-captura');
const btnListo  = document.getElementById('btn-ready');
const control = document.getElementById('control');
const captureConfirm = document.getElementById('capture-confirm');
const btnUpload = document.getElementById('upload-btn-container');
const grabado = document.getElementById('lugar-grabado');
const menuCreacion = document.getElementById('inicia-creacion');
const tituloGrabado = document.getElementById('titulo-grabado');
const subirGuifo = document.getElementById('btn-upload');
const cancelarCarga = document.getElementById('cancelar-carga');
const cancelar = document.getElementById('cancelar');
const cargaSeccion = document.getElementById('carga-seccion');
const contenedorMyGuifo = document.getElementById('contenedor-titulo-gif');
const finalGuifo = document.getElementById('final-guifo');
const uploadSuccess = document.getElementById('success-field');
const copyBtn = document.getElementById('copiar-btn');
const confirmWindow = document.getElementById('confirm-window');
const repetirCaptura = document.getElementById('btn-recapture');
const downloadBtn = document.getElementById('download-btn');
const finBtn = document.getElementById('finish-btn');
const urlUpload = 'https://upload.giphy.com/v1/gifs';
const url = 'https://api.giphy.com/v1/gifs'
const apiKey = "92C28WlFwVY4NJGckPqa78E21ZlPafD2";
const hrefThemeNight = "https://github.com/fabripalavecino/Gifs-website/blob/master/styles/theme2.css";
const gifsCreados = document.getElementById('gifs-creados');
const mjeCopiado = document.getElementById('copy-msg');
const timeSquare = document.getElementsByClassName('time-square');
const loadingSquare = document.getElementsByClassName('loading-square')


theme();
const goToMyGuifos = () => location.href = 'mis-guifos.html';
const goToPrincipal = () => location.href = 'index.html';

btnComenzar.addEventListener('click', abrirGrabacion);


function theme(){

    const tema = localStorage.getItem('tema')
        const linkTema = document.querySelector('link'); 
        linkTema.href = tema;
        if(linkTema.href === hrefThemeNight) { 
        document.getElementById("logo-gifos").src = "./assets/gifOF_logo_dark.png";}
        else{
        document.getElementById("logo-gifos").src = "./assets/gifOF_logo.png";
}
}


function abrirGrabacion(){
    grabado.classList.toggle('hide');
    menuCreacion.classList.toggle('hide');
    getStreamAndRecord();

};


function getStreamAndRecord() {
let p = navigator.mediaDevices.getUserMedia({ audio: false, video: {height: {max: 480}}});
p.then(function camaraOn (mediaStream) {
  var video = document.querySelector('video');
  video.srcObject = mediaStream;
  video.play();
  return mediaStream;
});


p.catch(function(err) { console.log(err.name); });
}


btnCapturar.addEventListener('click', () =>{
    btnCapturar.classList.toggle('hide');
    control.classList.toggle('hide');
    btnListo.classList.toggle('hide');
    tiempoVideo(); 
    let p = navigator.mediaDevices.getUserMedia({ audio: false, video: {height: {max: 480}}});
    p.then(mediaStream => {
    recorder = RecordRTC(mediaStream, {
        type: 'gif',
        frameRate: 1,
        quality: 10,
        width: 360,
        hidden: 240,
        
        onGifRecordingStarted: function() {
         console.log('started')
         
       },
      }); 
      recorder.startRecording();  
});
    btnListo.addEventListener('click',() => {
        recorder.stopRecording( () => {
        blob = recorder.getBlob()
        console.log(blob)
        btnListo.classList.toggle('hide');
        captureConfirm.classList.toggle('hide');
        btnUpload.classList.toggle('hide');
        stopTimer();
        barraProgreso(timeSquare);
        repetirCaptura.addEventListener('click', () => {
            goToMyGuifos()
        });
        let gifMuestra = URL.createObjectURL(blob);
        imgPreview = document.createElement('img');
        imgPreview.classList.add('video', 'preview');
        imgPreview.src = gifMuestra;
        grabado.replaceChild(imgPreview,video)
        tituloGrabado.innerText = 'Vista Previa';
        let form = new FormData();
        form.append('file',blob,'myGif.gif');
        console.log(form.get('file'));
        subirGuifo.addEventListener('click', () => {
            control.classList.toggle('hide');
            cancelarCarga.classList.toggle('hide');
            cargaSeccion.classList.toggle('hide');
            imgPreview.classList.toggle('hide');
            tituloGrabado.innerText = 'Subiendo Guifo';
            barraProgreso(loadingSquare);
            const initUpload = {method: 'POST', mode: 'cors', body: form}
            const ApiUpload = fetch(urlUpload + '?&api_key=' + apiKey , initUpload)
            .then(res => res.json())
            .then(res => saveGifLocalStorage(res.data.id),
            setTimeout(() => {
                contenedorMyGuifo.classList.toggle('hide');
                finalGuifo.src = gifMuestra;
                grabado.classList.toggle('hide');
                uploadSuccess.classList.toggle('hide');
               // enlaceCopiado.classList.toggle('hide');
                confirmWindow.classList.toggle('hide');
                document.querySelector('.resultado-gifs').style.marginTop = '65%';
                downloadBtn.addEventListener('click', () =>{
                    downLoadGifo(blob);
                })
                copyBtn.addEventListener('click', ()=>{
                    copyUrl();
                })
            }, 4000))
            
            .catch(error => console.log(error));
        })

      
    })
})

})
    
const saveGifLocalStorage = gifId => {
    const actualGifs = JSON.parse(localStorage.getItem('myGifs')) || []
    const newGifs = [...actualGifs, gifId]
    localStorage.setItem('myGifs', JSON.stringify(newGifs))
}

const getGifById = id => {
    const urlById = `${url}/${id}?api_key=${apiKey}`
    fetch(urlById)
    .then( res => res.json())
    .then( res => {
        res.data
        const template = `
                <figure class="result-gif gif-gallery">
                    <img src="${res.data.images.downsized_large.url}" class="img-gif" alt="gif-grabado">
                    <figcaption class="gradient"></figcaption>
                </figure>
        ` 
        gifsCreados.insertAdjacentHTML('afterbegin', template)
    })
}

const getGifsById = gifsId => {   
    for(let id of gifsId){
        getGifById(id)
    }   
} 


const validarGifsId = () => {
    if (localStorage.getItem('myGifs') !== null) {
        let gifsId = JSON.parse(localStorage.myGifs);
        if (gifsId.length === 0) {
            console.log('no hay gifos creados')
        } else {
            console.log('hay gifos')
            getGifsById(gifsId)
        }
    }
}

const downLoadGifo = blob => {
    invokeSaveAsDialog(blob, 'fileName')
} 

const copyUrl = () => {
    let copy = document.createElement("input")
    copy.setAttribute("value", imgPreview.src)
    document.body.appendChild(copy)
    copy.select()
    document.execCommand("copy")
    document.body.removeChild(copy);
}

cancelar.addEventListener('click', () => {goToPrincipal();})

cancelarCarga.addEventListener('click', () => {goToMyGuifos();})

copyBtn.addEventListener('click' , ()=>{ 
    mjeCopiado.classList.toggle('hide');
    setTimeout(() => {
    mjeCopiado.classList.toggle('hide');
}, 2000);
})

finBtn.addEventListener('click', ()=>{goToMyGuifos();})
validarGifsId()

let timerGif = null;
const tiempoVideo = () => {
    const contador = document.querySelector('.contador');
    let h = 0;
    let m = 0;
    let s = 0;
    let ms = 0;
    timerGif = setInterval( () => {
        let hours = h < 10 ? '0' + h : h
        let min = m < 10 ? '0' + m : m
        let sec = s < 10 ? '0' + s : s
        let miliSec = ms < 10 ? '0' + ms : ms

        if(ms < 9) { ms += 1 }
        else if(s < 59) { ms = 0; s += 1 } 
        else if(m < 59) { ms = 0; s = 0; m += 1 }
        else if(h < 23) { ms = 0; s = 0; m = 0; h +=1 }
        
        contador.innerHTML = hours + ':' + min + ':' + sec + ':' + miliSec
    }, 100)
}

const stopTimer = () => clearInterval(timerGif)



function barraProgreso(square){
let animate =   setInterval(() => {
        for(let i = 0; i < square.length; i++){
            square[i].classList.toggle('square-pink');
    }
    }, 350);
    setTimeout(() => {
        clearInterval(animate);
        for(let i = 0; i < square.length; i++){
            square[i].classList.add('square-pink');
    }}, 3500);
    
}

})



