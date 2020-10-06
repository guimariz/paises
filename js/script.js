const globalState = {
  allCountries: [],
  filteredCountries: [],
  loadingData: true,
  currentFilter: '',

  radioAnd: false,
  radioOr: true,

  checkboxes: [
    {
      filter: 'english',
      description: 'Inglês',
      checked: true,
    },
    {
      filter: 'french',
      description: 'Francês',
      checked: true,
    },
    {
      filter: 'portuguese',
      description: 'Português',
      checked: true,
    },
  ],
};

//Recebimento do html para manipulação
const globalDivCountries = document.querySelector('#divCountries');
const globalInputName = document.querySelector('#inputName');
const globalDivCheckboxes = document.querySelector('#checkboxes');
const globalRadioAnd = document.querySelector('#radioAnd');
const globalRadioOr = document.querySelector('#radioOr');

/*Função start async que deve ser inicializada de preferência no final do código
Deve ser async por ter um await
*/
async function start() {
  globalInputName.addEventListener('input', handleInputChange);
  globalRadioAnd.addEventListener('input', handleRadioClick);
  globalRadioOr.addEventListener('input', handleRadioClick);

  renderCheckboxes();

  await fetchAll();

  filterCountries();
}

//Função para mostra CheckBoxes em tela
function renderCheckboxes() {
  const { checkboxes } = globalState;

  const inputCheckboxes = checkboxes.map((checkbox) => {
    const { filter: id, description, checked } = checkbox;

    return `<label class="option">
        <input 
          id="${id}" 
          type="checkbox" 
          checked="${checked}"
        />
        <span>${description}</span>
      </label>`;
  });

  globalDivCheckboxes.innerHTML = inputCheckboxes.join('');

  checkboxes.forEach((checkbox) => {
    const { filter: id } = checkbox;
    const element = document.querySelector(`#${id}`);
    element.addEventListener('input', handleCheckboxClick);
  });
}

/*Função para receber os dados de todos os países de forma que possam ser
manipulados.
Essa função também tem uma validação de acentos e letra minúscula para
não haver problemas com o código
 */
async function fetchAll() {
  const url =
    'https://my-json-server.typicode.com/rrgomide/json-countries/countries';

  const resource = await fetch(url);
  const json = await resource.json();

  const jsonWithImprovedSearch = json.map((item) => {
    const { name, languages } = item;

    const lowerCaseName = name.toLocaleLowerCase();

    return {
      ...item,
      searchName: removeAccentMarksFrom(lowerCaseName)
        .split('')
        .filter((char) => char !== ' ')
        .join(''),
      searchLanguages: getOnlyLanguagesFrom(languages),
    };
  });

  globalState.allCountries = [...jsonWithImprovedSearch];
  globalState.filteredCountries = [...jsonWithImprovedSearch];

  globalState.loadingData = false;
}

//Função para validar o campo de pesquisa
function handleInputChange({ target }) {
  globalState.currentFilter = target.value.toLocaleLowerCase().trim();

  filterCountries();
}

//Função para filtrar os países de acordo com o que estiver marcado no Checkbox
function handleCheckboxClick({ target }) {
  const { id, checked } = target;
  const { checkboxes } = globalState;

  const checkboxToChange = checkboxes.find(
    (checkbox) => checkbox.filter === id
  );
  checkboxToChange.checked = checked;

  filterCountries();
}

//Função para garantir que apenas uma das opções de Radio possa ser ativada por vez
function handleRadioClick({ target }) {
  const radioId = target.id;

  globalState.radioAnd = radioId === 'radioAnd';
  globalState.radioOr = radioId === 'radioOr';

  filterCountries();
}

//Função para ordenar e colocar todos os dados em letra minúscula
function getOnlyLanguagesFrom(languages) {
  return languages.map((language) => language.toLocaleLowerCase()).sort();
}

//Função para remover acentos e caracteres especiais
function removeAccentMarksFrom(text) {
  const WITH_ACCENT_MARKS = 'áãâäàéèêëíìîïóôõöòúùûüñ'.split('');
  const WITHOUT_ACCENT_MARKS = 'aaaaaeeeeiiiiooooouuuun'.split('');

  const newText = text
    .toLocaleLowerCase()
    .split('')
    .map((char) => {
      const index = WITH_ACCENT_MARKS.indexOf(char);

      if (index > -1) {
        return WITHOUT_ACCENT_MARKS[index];
      }

      return char;
    })
    .join('');

  return newText;
}

//Função para filtrar os países de acordo com as opções marcadas
function filterCountries() {
  const { allCountries, radioOr, currentFilter, checkboxes } = globalState;
  const filterCountries = checkboxes
    .filter(({ checked }) => checked)
    .map(({ filter }) => filter)
    .sort();

  let filteredCountries = allCountries.filter(({ searchLanguages }) => {
    return radioOr
      ? filterCountries.some((item) => searchLanguages.includes(item))
      : filterCountries.join('') === searchLanguages.join('');
  });

  if (currentFilter) {
    filteredCountries = filteredCountries.filter(({ searchName }) =>
      searchName.includes(currentFilter)
    );
  }

  globalState.filteredCountries = filteredCountries;

  renderCountries();
}

//Função para renderização dos países em tela
function renderCountries() {
  const { filteredCountries } = globalState;

  const countriesToShow = filteredCountries
    .map((country) => {
      return renderCountry(country);
    })
    .join('');

  const renderedHTML = `
     <div>
       <h2>${filteredCountries.length} país(es) encontrado(s)</h2>
       <div class='row'>
         ${countriesToShow}
       </div>
     </div>
  `;

  globalDivCountries.innerHTML = renderedHTML;
}

//Função para renderizar cada país com seu nome e sua bandeira
function renderCountry(country) {
  const { name, flag, languages } = country;

  return `
    <div class='col s12 m6 l4'>
      <div class='country-card'>
        <img class='flag' src="${flag}" alt="${name}" />
        <div class='data'>
          <span>${name}</span>
          <span class='language'>
            <strong>${renderLanguages(languages)}</strong>
          </span>
        </div>
      </div>
    </div>
  `;
}

//Função para renderizar idiomas
function renderLanguages(languages) {
  const { checkboxes } = globalState;
  return languages
    .map((language) => {
      return checkboxes.find((item) => item.filter === language).description;
    })
    .join(', ');
}

start();
