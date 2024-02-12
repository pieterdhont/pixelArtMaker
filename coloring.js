class ColoringField {
  constructor() {
      this.fields = [];
      this.currentColor = null; // Initieel geen kleur geselecteerd
      this.attachColorButtonHandlers();
  }

  async initFields(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;

      const area = document.getElementById('coloringArea');
      area.innerHTML = ''; // Reset het tekengebied
      this.fields = []; // Reset de veldenlijst

      for (let y = 0; y < this.height; y++) {
          const row = document.createElement('div');
          for (let x = 0; x < this.width; x++) {
              const field = this.createField(x, y);
              row.appendChild(field);
          }
          area.appendChild(row);
      }
  }

  createField(x, y) {
      const field = document.createElement('div');
      field.classList.add('color-field');
      field.style.width = `${this.cellSize}px`;
      field.style.height = `${this.cellSize}px`;
      field.style.display = 'inline-block';
      field.dataset.x = x.toString();
      field.dataset.y = y.toString();
      field.dataset.color = 'white';
      field.addEventListener('click', () => this.handleFieldClick(field));
      this.fields.push(field);
      return field;
  }

  attachColorButtonHandlers() {
      document.querySelectorAll('.color-button').forEach(button => {
          button.addEventListener('click', (e) => this.colorButtonClickHandler(e));
      });
  }

  colorButtonClickHandler(e) {
      const selectedColor = e.target.id;
      if (this.currentColor === selectedColor) {
          this.currentColor = null;
          e.target.classList.remove('selected');
          console.log("Kleurselectie is opgeheven.");
      } else {
          document.querySelectorAll('.color-button').forEach(btn => btn.classList.remove('selected'));
          this.currentColor = selectedColor;
          e.target.classList.add('selected');
          console.log(`Kleur ${this.currentColor} is geselecteerd.`);
      }
  }

  handleFieldClick(field) {
      if (this.currentColor) {
          field.style.backgroundColor = this.currentColor;
          field.dataset.color = this.currentColor;
          console.log(`Ik ben veld ${field.dataset.x}, ${field.dataset.y} en ik werd ${this.currentColor} gekleurd`);
      } else {
          console.log(`Ik ben veld ${field.dataset.x}, ${field.dataset.y} en ik ben ${field.dataset.color}`);
      }
  }

  exportToJson() {
      const exportObj = this.fields.map(field => ({ x: field.dataset.x, y: field.dataset.y, color: field.dataset.color }));
      const blob = new Blob([JSON.stringify(exportObj)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'coloring.json';
      a.click();
  }

  async importFromJson(json) {
    // Parse de JSON data
    const importObj = JSON.parse(json);

    // Bereken de breedte en hoogte gebaseerd op de geïmporteerde data
    const width = Math.max(...importObj.map(item => parseInt(item.x, 10))) + 1;
    const height = Math.max(...importObj.map(item => parseInt(item.y, 10))) + 1;

    // Reset de huidige staat voordat de nieuwe data wordt ingeladen
    this.resetState(); // Zorg ervoor dat deze methode de volledige interne staat reset
    document.querySelectorAll('.color-button').forEach(btn => btn.classList.remove('selected'));
    resetFileInput(); // Optioneel, reset het bestandsinputelement indien nodig

    // Wacht tot de nieuwe velden zijn geïnitialiseerd
    await this.initFields(width, height, this.cellWidth, this.cellHeight);

    // Pas de geïmporteerde data toe
    importObj.forEach(item => {
        const field = this.fields.find(f => f.dataset.x === item.x && f.dataset.y === item.y);
        if (field) {
            field.style.backgroundColor = item.color;
            field.dataset.color = item.color;
        }
    });
}


  resetState() {
    this.fields = [];
    this.currentColor = null;
    document.querySelectorAll('.color-button').forEach(btn => btn.classList.remove('selected'));
    // Voeg hier eventuele andere relevante staat reset logica toe
}

}

function resetFileInput() {
  const fileInput = document.getElementById('jsonFile');
  fileInput.value = ""; // Reset het bestandsinputelement
}

async function initializeField() {
  const width = parseInt(document.getElementById('width').value, 10);
  const height = parseInt(document.getElementById('height').value, 10);
  const cellSize = parseInt(document.getElementById('cellSize').value, 10);

  // Controleer of coloringField al bestaat en reset de staat indien nodig
  if (!coloringField) {
      coloringField = new ColoringField();
  } else {
      // Reset de staat hier
      coloringField.resetState(); // Zorg ervoor dat deze methode de volledige interne staat reset
  }
  await coloringField.initFields(width, height, cellSize);
  resetFileInput();
}



function exportToJson() {
  coloringField.exportToJson();
}

function handleFileImport(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = async function(e) {
          await coloringField.importFromJson(e.target.result);
      };
      reader.readAsText(file);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeField();
});

let coloringField;
