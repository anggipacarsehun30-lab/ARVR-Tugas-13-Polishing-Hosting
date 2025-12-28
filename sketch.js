let video;
let facemesh;
let predictions = [];

let model1, model2, model3;
let selectedModel = 1;

let objects = [];
let floatOffset = 0;
let rotationOffset = 0;
let holoShift = 0;

let clickSfx; // 🔊 AUDIO

function preload() {
  model1 = loadModel('Glasses_01.obj', true);
  model2 = loadModel('HeartGlasses.obj', true);
  model3 = loadModel('Sunglasses.obj', true);

  clickSfx = loadSound('button-click-289742.mp3'); // 🔊 load SFX
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  video = createCapture({ video: { facingMode: "user" } });
  video.size(windowWidth, windowHeight);
  video.hide();

  facemesh = ml5.facemesh(video);
  facemesh.on("predict", r => predictions = r);

  let topUI = select('#topUI');

  createButton("👓 Glasses").parent(topUI).mousePressed(() => {
    clickSfx.play();
    selectedModel = 1;
  });

  createButton("❤️ Heart").parent(topUI).mousePressed(() => {
    clickSfx.play();
    selectedModel = 2;
  });

  createButton("🕶 Sunglasses").parent(topUI).mousePressed(() => {
    clickSfx.play();
    selectedModel = 3;
  });

  createButton("🔄 Reset")
    .id("resetBtn")
    .mousePressed(() => {
      clickSfx.play();
      objects = [];
    });
}

function draw() {
  background(0);

  // Kamera mirror
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);
  scale(-1, 1);
  image(video, -width, 0, width, height);
  pop();

  if (predictions.length === 0 || objects.length === 0) return;

  let mesh = predictions[0].scaledMesh;
  let leftEye = mesh[33];
  let rightEye = mesh[263];

  let cx = width / 2 - (leftEye[0] + rightEye[0]) / 2;
  let cy = (leftEye[1] + rightEye[1]) / 2 - height / 2;

  let eyeDist = dist(leftEye[0], leftEye[1], rightEye[0], rightEye[1]);
  let s = map(eyeDist, 60, 220, 0.25, 0.75, true);

  floatOffset += 0.05;
  rotationOffset += 0.01;
  holoShift += 0.03;

  for (let i = 0; i < objects.length; i++) {
    let o = objects[i];
    let floatY = sin(floatOffset + i) * 6;

    let r = 120 + sin(holoShift + i) * 135;
    let g = 120 + sin(holoShift + i + 2) * 135;
    let b = 120 + sin(holoShift + i + 4) * 135;

    push();
    translate(cx + o.x, cy + o.y + floatY, o.z + eyeDist * 0.15);
    scale(s);

    rotateX(PI);
    rotateY(PI + rotationOffset);

    // 💡 LIGHTING (VISUAL POLISH)
    ambientLight(60);
    directionalLight(255, 255, 255, 0.3, 0.4, -1);
    pointLight(120, 200, 255, 0, 0, 300);

    specularMaterial(r, g, b);
    shininess(80);

    if (o.type === 1) {
      model(model1);
    } else if (o.type === 2) {
      rotateX(PI);
      rotateY(PI / 2);
      rotateZ(PI);
      model(model2);
    } else {
      model(model3);
    }

    pop();
  }
}

function mousePressed() {
  clickSfx.play(); // 🔊 tap sound

  if (mouseY < 80 || mouseY > height - 80) return;
  if (predictions.length === 0) return;

  let mesh = predictions[0].scaledMesh;
  let leftEye = mesh[33];
  let rightEye = mesh[263];

  let cx = width / 2 - (leftEye[0] + rightEye[0]) / 2;
  let cy = (leftEye[1] + rightEye[1]) / 2 - height / 2;

  objects.push({
    type: selectedModel,
    x: mouseX - width / 2 - cx,
    y: mouseY - height / 2 - cy,
    z: 60
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(windowWidth, windowHeight);
}
