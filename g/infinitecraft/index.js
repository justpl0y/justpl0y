const mergeRules = {};

const sidebar = document.getElementById("sidebar");
const canvas = document.getElementById("canvas");

function createDraggableClone(element, event) {
  const clone = element.cloneNode(true);
  clone.classList.add("element");
  clone.style.position = "absolute";
  canvas.appendChild(clone);

  const rect = element.getBoundingClientRect();
  const offsetX = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
  const offsetY = (event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

  function moveElement(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - offsetX;
    const y = clientY - offsetY;
    clone.style.left = `${x}px`;
    clone.style.top = `${y}px`;
  }

  function endDrag() {
    document.removeEventListener("mousemove", moveElement);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", moveElement);
    document.removeEventListener("touchend", endDrag);
    clone.addEventListener("mousedown", startDrag);
    clone.addEventListener("touchstart", startDrag);
  }

  moveElement(event);
  document.addEventListener("mousemove", moveElement);
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchmove", moveElement);
  document.addEventListener("touchend", endDrag);
}

function startDrag(event) {
  const element = event.target;
  const rect = element.getBoundingClientRect();
  const offsetX = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
  const offsetY = (event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

  function moveElement(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - offsetX;
    const y = clientY - offsetY;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }

  function endDrag() {
    document.removeEventListener("mousemove", moveElement);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", moveElement);
    document.removeEventListener("touchend", endDrag);
  }

  moveElement(event);
  document.addEventListener("mousemove", moveElement);
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchmove", moveElement);
  document.addEventListener("touchend", endDrag);
}

const elements = document.querySelectorAll(".element");
elements.forEach((element) => {
  element.addEventListener("mousedown", function (event) {
    createDraggableClone(element, event);
  });
  element.addEventListener("touchstart", function (event) {
    createDraggableClone(element, event);
  });
});

canvas.addEventListener("mousedown", function (event) {
  const element = event.target;
  if (element.classList.contains("element")) {
    startDrag(event);
  }
});
canvas.addEventListener("touchstart", function (event) {
  const element = event.target;
  if (element.classList.contains("element")) {
    startDrag(event);
  }
});

document.getElementById("clean-button").addEventListener("click", function () {
  document.getElementById("canvas").innerHTML = "";
});
