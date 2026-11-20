
let startring; // variabel för startringen
let star; // variabel för stjärnbilden
let vinkel = 0; // så mycket svartahålet har snurrat hittils 
let storlek = 50;// storleken för det svarta hålet startar på 50 pixlar
//let storlek2 = 50; // storleken för de svarta hålet i värld 2

let bakgrund; // första bakgrunden
let bakgrund2; 
let planeter; // i värld 2
let bakgrund3;
let varld3planeter;
let bakgrund4;
let bubblor;
let bakgrund5;
let varld5star;

let varld = 1; // Variabel för de olika världarna
let tillbaka = false; // Variabel för att komma tillbaka till värld 1

let stjarnor = [];
let hastighet = 2; 

let puls = 0; // puls för planeter
let puls2 = 0; // puls för stjärnor


let holeX = 300; // startpunkt för svarta hålet
let holeY = 300; 
let holeSize = 100;
let video; // Hämtar kamerabilden
let bodyPose; // Analyserar bilden och hittar kroppsdelar
let poses = []; // Sparar resultat som används för att styra svarta hålet 



let musik; // Variabel för första musiken
let musikStartad = false;



async function setup() {
// setup KÖRS EN GÅNG
// "await" - vänta tills bilderna är klara innan koden körs vidare
  bakgrund = await loadImage ('varld1bak.png');
  star = await loadImage ('stars.png');
  startring = await loadImage ('snurr.png');
  bakgrund2 = await loadImage ('varld2bak.png');
  planeter = await loadImage ('planeter.png'); // i värld 2
  bakgrund3 = await loadImage ('varld3bak.png');
  bakgrund4 = await loadImage ('varld4bak.png');
  bakgrund5 = await loadImage ('varld5bak.png');

  varld3planeter = await loadImage ('varld3planeter.png');
  bubblor = await loadImage ('bubblor.png');
  varld5star = await loadImage ('varld5star.png');
  

  
  musik = await loadSound('rymdmusik.mp3'); // laddar in musiken
  // när musiken tar slut laddas den om
  musik.onended(() => {
  musik.play();
});

  
  createCanvas(600, 600);// ytan

  //skapar 300 stjärnor och sparar de i en array
    for (let i = 0; i <300; i++) {
      stjarnor[i] = new Stjarna ();
    }

// Hittar alla kameror som är anslutna till datorn
let kameror = await navigator.mediaDevices.enumerateDevices();

// Väljer bara kamerorna
let videoKameror = kameror.filter(kamera => kamera.kind === 'videoinput');

// Visar kamerorna i konsolen
console.log(videoKameror);

// Väljer USB-kameran (om den är kamera nummer 1)
let usbKamera = videoKameror[0];

// Startar USB-kameran
video = createCapture({
  video: {
   deviceId: { exact: usbKamera.deviceId }
  },
  audio: false // spelar inte in ljud från kameran
});

video.size(640, 480);
video.hide();

// Startar bodytracking
bodyPose = await ml5.bodyPose();
bodyPose.detectStart(video, gotPoses);

//Knapp för att starta ljudet
let startKnapp = createButton('Starta installationen');

startKnapp.mousePressed(async () => {
  await userStartAudio();
  musik.play();
  musikStartad = true;
  startKnapp.remove(); // knappen förvinner när man klickat
});
}

// DRAW körs om och om igen ca 60 gånger/sek
function draw() {
  imageMode(CORNER);

 if (poses.length > 0) { // kontrollerarar att kameran hittat minst en person

  // Välj personen som är närmast kameran
let pose = null;
let storstaAvstand = 0;

   //mappar ut axlarnaspunkter
for (let person of poses) {
  let left = person.keypoints.find(k => k.name === "left_shoulder");
  let right = person.keypoints.find(k => k.name === "right_shoulder");

  if (left && right && left.confidence > 0.1 && right.confidence > 0.1) {

    // Mäter avståndet mellan axlarna
    let avstand = dist(left.x, left.y, right.x, right.y);

    // Ignorerar personer som är för långt från kameran
if (avstand < 100) {
  continue;
}

    // Personen med störst axelavstånd väljs
    if (avstand > storstaAvstand) {
      storstaAvstand = avstand;
      pose = person;
    }
  }
}

 
if (pose) {
  let leftShoulder = pose.keypoints.find(k => k.name === "left_shoulder");
  let rightShoulder = pose.keypoints.find(k => k.name === "right_shoulder");

  if (leftShoulder && rightShoulder &&
      leftShoulder.confidence > 0.1 &&
      rightShoulder.confidence > 0.1) { // Kontrollerar att båda axlarna hittats och att kameran är tillräckligt säker



    
    // Hitta kroppens position
    holeX = lerp(holeX, width - (leftShoulder.x + rightShoulder.x) / 2, 0.1);
    holeY = lerp(holeY, (leftShoulder.y + rightShoulder.y) / 2, 0.1); // lerp = en gradvis förändring istället för en direkt förändring

    // Ändra storlek beroende på avståndet mellan axlarna
    let shoulderDistance = dist(
      leftShoulder.x, leftShoulder.y,
      rightShoulder.x, rightShoulder.y
    );

    let nyStorlek = map(shoulderDistance, 100, 250, 50, 2500); // map gör att svartahålet blir större beroende på avståndet mellan personens axlar
    nyStorlek = constrain(nyStorlek, 50, 2500); // begränsar värdet så att de svartahålet inte blir kan bli mindre än 50 eller större än 2500

    storlek = lerp(storlek, nyStorlek, 0.05); // storleken ändras gradvis mot den nya storleken
  }
}
 }
      puls += 0.05; // bestämmer hur snabbt planeterna pulserar
   puls2 += 0.1; // bestämmer hur snabbt stjärnorna pulserar

  //VÄRLD 2
let planetStorlek = 690 + sin(puls) * 10; // storleken på planeterna gånger 10 avgör pulseringens storlek

let starStorlek = 690 + sin(puls2) * 10; // storleken och pulsen för stjärnorna

// VÄRLDSBYTE

if (varld === 1) {

  // Vänster leder till värld 2
  if (storlek > 1800 && holeX < 220) {
    varld = 2;
    tillbaka = false;
  }

  // Höger leder till värld 3
  else if (storlek > 1800 && holeX > 380) {
    varld = 3;
    tillbaka = false;
  }

} else {

  // Personen måste först backa från kameran
  if (storlek < 500) {
    tillbaka = true;
  }

  // Personen närmar sig kameran igen
  if (tillbaka && storlek > 1800) {

    // Mitten leder tillbaka till värld 1
    if (holeX >= 220 && holeX <= 380) {
      varld = 1;
      tillbaka = false;
    }

    // Från värld 2 och 3 kan man resa vidare
    else if (varld === 2 || varld === 3) {

      // Vänster leder till värld 4
      if (holeX < 220) {
        varld = 4;
        tillbaka = false;
      }

      // Höger leder till värld 5
      else if (holeX > 380) {
        varld = 5;
        tillbaka = false;
      }
    }
  }
}

if (varld === 2){ //storleken för att byta bakgrundsbild
  imageMode(CORNER); // ritar bakgrunden från vänster hörn
  image (bakgrund2, 0, 0, width, height); // byter bakgrundsbild




  //Bakgrundsbild 2
push();
imageMode(CENTER);
image(star, 300, 300, starStorlek, starStorlek);
image(planeter, 300, 300, planetStorlek, planetStorlek);
pop(); // planeterna hamnar i mitten av canvas

  
   //svart hål för värld 2
   push();
  translate (holeX, height / 2); 
  rotate (vinkel); // snurra allt som ritas efter detta
  imageMode(CENTER); //rita bilden i mitten
  image (startring, 0, 0, storlek, storlek); // ritar startringen 
  pop (); //återställer så att 0,0 är uppe i vänstra hörnet igen, som ett stopp och push = start

   if (storlek > 600){ // stjärnorna börjar synas vid 600 pixlar
    for (let i = 0; i < stjarnor.length; i++) {
      stjarnor[i].uppdatera();
      stjarnor[i].visa();
    }
  }
}

  // VÄRLD 3
  else if (varld === 3) {

  imageMode(CORNER);
  image(bakgrund3, 0, 0, width, height);
    
    push();
imageMode(CENTER);
image(varld3planeter, 300, 300, starStorlek, starStorlek);
pop(); // planeterna hamnar i mitten av canvas

  

  // Svart hål för värld 3
  push();
  translate(holeX, height / 2);
  rotate(vinkel);
  imageMode(CENTER);
  image(startring, 0, 0, storlek, storlek);
  pop();

     if (storlek > 600){ // stjärnorna börjar synas vid 600 pixlar
    for (let i = 0; i < stjarnor.length; i++) {
      stjarnor[i].uppdatera();
      stjarnor[i].visa();
    }
  }
  }

    // VÄRLD 4
else if (varld === 4) {

  // Bakgrund för värld 4
  imageMode(CORNER);
  image(bakgrund4, 0, 0, width, height);

  push();
imageMode(CENTER);
image(bubblor, 300, 300, starStorlek, starStorlek);
pop(); // planeterna hamnar i mitten av canvas

  

  // Svarta hålet
  push();
  translate(holeX, height / 2);
  rotate(vinkel);
  imageMode(CENTER);
  image(startring, 0, 0, storlek, storlek);
  pop();

  // Stjärnorna börjar röra sig när hålet växer
  if (storlek > 600) {
    for (let i = 0; i < stjarnor.length; i++) {
      stjarnor[i].uppdatera();
      stjarnor[i].visa();
    }
  }
}

// VÄRLD 5
else if (varld === 5) {

  // Bakgrund för värld 5
  imageMode(CORNER);
  image(bakgrund5, 0, 0, width, height);

  push();
imageMode(CENTER);
image(varld5star, 300, 300, starStorlek, starStorlek);
pop(); // planeterna hamnar i mitten av canvas

  

  // Svarta hålet
  push();
  translate(holeX, height / 2);
  rotate(vinkel);
  imageMode(CENTER);
  image(startring, 0, 0, storlek, storlek);
  pop();

  // Stjärnorna börjar röra sig när hålet växer
  if (storlek > 600) {
    for (let i = 0; i < stjarnor.length; i++) {
      stjarnor[i].uppdatera();
      stjarnor[i].visa();
    }
  }
}
    
  // VÄRLD 1
  else {
  image (bakgrund, 0, 0, width, height); // första bakgrunden
  image (star, 0, 0, width, height);
    
  //svarta hål för värld 1
   push();
  translate (holeX, height / 2); 
  rotate (vinkel); // snurra allt som ritas efter detta
 imageMode(CENTER); //rita bilden i mitten
  image (startring, 0, 0, storlek, storlek); // ritar startringen 
  pop (); //återställer så att 0,0 är uppe i vänstra hörnet igen, som ett stopp och push = start

 if (storlek > 600){ // stjärnorna börjar synas vid 600 pixlar
    for (let i = 0; i < stjarnor.length; i++) {
      stjarnor[i].uppdatera();
      stjarnor[i].visa();
    }
  }

  }



storlek = max(storlek, 50); // Hindrar svarta hålet från att bli mindre än 50

storlek = max(storlek, 50); // svartahålet kan som minst bli 50 pixlar
  
hastighet = 2 + storlek * 0.05; //ökar hastigheten på stjärnorna när de svarta hålet blir större.

// Musiken blir snabbare när svarta hålet växer
let musikHastighet = map(storlek, 50, 1800, 1, 2);
musikHastighet = constrain(musikHastighet, 1, 2);
musik.rate(musikHastighet);


  

  //Startring
  vinkel += 0.01 + storlek * 0.0001; //start rotationen börjar på 0,01 0ch ökar baserat på storleken av bilden 


}



//STJÄRNOR

// Skapar stjärnorna
function Stjarna() { // Skapar en stjärnsymbol 
  this.x = random(-width, width); // Slumpmässigt placerar stjärnorna i X och Y led
  this.y = random(-height, height);
  this.djup = random(width); // Placerar slumpmässigt stjärnorna på ett visst djup
  this.tidigareDjup = this.djup; // Kommer ihåg stjärnans start djup för att rita ett streck 

  //Uppdatera stjärnornas rörelse
  this.uppdatera = function() {
    this.djup = this.djup - hastighet; //minskar stjärnans djup för varje uppdatering, det gör att stjärnan ser ut att komma närmare oss
    if (this.djup < 1) { // när stjärnan kommit för nära får den en ny slumpmässig position
      this.djup = width;
      this.x = random(-width, width);
      this.y = random(-height, height);
      this.tidigareDjup = this.djup;
    }
  };

  
  //Rita stjärnorna
  this.visa = function() {
    fill(255); //färg på cirklar i vit.
    noStroke();

    //prickarna
    let xPosition = map(this.x / this.djup, 0, 1, 0, width) + width / 2; // width/2 gör att de kommer från mitten av canvasen.
    let yPosition = map(this.y / this.djup, 0, 1, 0, height) + height / 2; // width/2 gör att de kommer från mitten av canvasen.

    
    let storlekStjarna = map(this.djup, 0, width, 16, 0); // Bestämmar stjärnornas storlek, långt bort = mindre, närmare = större
    ellipse(xPosition, yPosition, storlekStjarna, storlekStjarna); // skapar en rund cirkel

    //Skapar strecken efter stjärnorna
    let tidigareX = map(this.x / this.tidigareDjup, 0, 1, 0, width) + width / 2; // utgåt från stjärnans tidigare djup 
    let tidigareY = map(this.y / this.tidigareDjup, 0, 1, 0, height) + height / 2;
    this.tidigareDjup = this.djup;
    

    stroke(255); //skapar vita sträck efter stjärnorna.
    line(tidigareX, tidigareY, xPosition, yPosition); //skapar linjer efter cirklarna i x och y-led. 
  };

}


//Bodytracking
function gotPoses(results) { // Samlar in information om personen som syns i kameran
  poses = results; // sparar informationen för bodytracking
 // console.log(poses);
}