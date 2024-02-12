class ColoringField {
  #fields = [];
  #currentColor = null;
  
  constructor() {
      this.#attachEventListeners();
  }

  #attachEventListeners() {
      document.getElementById('newSheetBtn').addEventListener('click', () => this.#initializeField());
      document.getElementById('coloringArea').addEventListener('click', (e) => this.#handleFieldClick(e.target));
      document.getElementById('exportBtn').addEventListener('click', () => this.#exportToJson());
      document.getElementById('jsonFile').addEventListener('change', (event) => this.#handleFileImport(event));
      document.querySelector('.color-buttons').addEventListener('click', (e) => this.#colorButtonClickHandler(e.target));
  }

  async #initializeField() {
      const width = parseInt(document.getElementById('width').value, 10);
      const height = parseInt(document.getElementById('height').value, 10);
      const cellSize = parseInt(document.getElementById('cellSize').value, 10);
      
      if (width <= 0 || height <= 0 || cellSize <= 0) {
          alert("Voer waarden groter dan 0 in.");
          return;
      }

      this.resetFileInput();
      
      const area = document.getElementById('coloringArea');
      area.innerHTML = '';
      this.#fields = [];
      
      for (let y = 0; y < height; y++) {
          const row = document.createElement('div');
          for (let x = 0; x < width; x++) {
              row.appendChild(this.#createField(x, y, cellSize));
          }
          area.appendChild(row);
      }
  }

  #createField(x, y, cellSize) {
      const field = document.createElement('div');
      field.classList.add('color-field');
      field.style.width = `${cellSize}px`;
      field.style.height = `${cellSize}px`;
      field.dataset.x = x;
      field.dataset.y = y;
      field.dataset.color = 'white';
      this.#fields.push(field);
      return field;
  }

  #colorButtonClickHandler(button) {
      if (button.classList.contains('color-button')) {
          const selectedColor = button.id;
          this.#currentColor = (this.#currentColor === selectedColor) ? null : selectedColor;
          document.querySelectorAll('.color-button').forEach(btn => btn.classList.toggle('selected', btn === button && this.#currentColor === selectedColor));
      }
  }

  #handleFieldClick(field) {
      if (field.classList.contains('color-field') && this.#currentColor) {
          field.style.backgroundColor = this.#currentColor;
          field.dataset.color = this.#currentColor;
          console.log(`Ik ben veld ${field.dataset.x}, ${field.dataset.y} en ik werd ${this.#currentColor} gekleurd`);
        } else {
            console.log(`Ik ben veld ${field.dataset.x}, ${field.dataset.y} en ik ben ${field.dataset.color}`);
        }
    }

  #exportToJson() {
      const exportObj = this.#fields.map(({ dataset: { x, y, color } }) => ({ x, y, color }));
      const jsonString = JSON.stringify(exportObj, null, 2);
      console.log(jsonString);
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'coloringField.json';
      a.click();
  }

  async #handleFileImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
              await this.#importFromJson(e.target.result);
              document.getElementById('fileNameDisplay').textContent = file.name;
          } catch (err) {
              alert('Fout bij het importeren van JSON: ' + err);
          }
      };
      reader.readAsText(file);
  }

  async #importFromJson(json) {
    // Parse de JSON data
    const importObj = JSON.parse(json);

    // Bereken de breedte en hoogte gebaseerd op de geïmporteerde data
    const width = Math.max(...importObj.map(item => parseInt(item.x, 10))) + 1;
    const height = Math.max(...importObj.map(item => parseInt(item.y, 10))) + 1;

    // Reset de huidige staat voordat de nieuwe data wordt ingeladen
    this.resetState(); 
    document.querySelectorAll('.color-button').forEach(btn => btn.classList.remove('selected'));
    this.resetFileInput(); 

    // Wacht tot de nieuwe velden zijn geïnitialiseerd
    await this.#initializeField(width, height, this.cellWidth, this.cellSize);

    // Pas de geïmporteerde data toe
    importObj.forEach(item => {
        const field = this.#fields.find(f => f.dataset.x === item.x && f.dataset.y === item.y);
        if (field) {
            field.style.backgroundColor = item.color;
            field.dataset.color = item.color;
        }
    });
}

resetFileInput() {
  const fileInput = document.getElementById('jsonFile'); // This should target the input element, not the display span
  const fileNameDisplay = document.getElementById('fileNameDisplay'); // This is the span where the file name is displayed
  fileInput.value = ""; // This will reset the file input element
  fileNameDisplay.textContent = "Geen bestand gekozen"; // This will reset the text of the span
}

  resetState() {
      this.#fields = [];
      this.#currentColor = null;
      document.querySelectorAll('.color-button').forEach(btn => btn.classList.remove('selected'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ColoringField();
});
