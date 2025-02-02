$(() => {

const API_ENDPOINT = "https://restcountries.com/v3.1"
let map = $(".map")
let countries = $(".map__svg path")
let searchBar = $(".search__form")
let list = $(".search__list")
let countryArray = []
let loadingScreen = $(".country__loading-screen")
let searchField = $(".search")
let countryField = $(".country")


//You cannot imagine how hard this was to code for me
const setPosition = (countryID) => {
    let elementPositions = document.querySelector(`#${countryID}.center`).getBoundingClientRect();
    let mapPositions = document.querySelector(`.map`).getBoundingClientRect();
    let relativePositions = {}
    relativePositions.x = elementPositions.x - mapPositions.x;
    relativePositions.y = elementPositions.y - mapPositions.y;
    //Yes, Russia is so big it breaks the code
    if (countryID === "RU") {
        relativePositions.x += 400
        relativePositions.y -= 50
    }
    map.css({
        "transform-origin": `calc(${-elementPositions.x}px + 66vw - ${elementPositions.width}px / 2) calc(${-elementPositions.y}px + 50vh - ${elementPositions.height}px / 2)) 0px`,
        "transform": `translate(calc(${-relativePositions.x}px + 66vw - ${elementPositions.width}px / 2), calc(${-relativePositions.y}px + 50vh - ${elementPositions.height}px / 2))`
    })

    window.localStorage.setItem("position", countryID)
}

const initialMapPosition = () => {
    let savedPosition = localStorage.getItem("position")
    setPosition(savedPosition)
}

const initialSearchBarQuery = () => {
    searchBar[0].value = ""
}

const initialize = () => {
    initialMapPosition();
    initialSearchBarQuery();
}
initialize();

const fetchCountryData = async (selectedCountry) => {   
    loadingScreen.delay(800).fadeOut(200)
    try {
        let response = await fetch(`${API_ENDPOINT}/alpha/${selectedCountry}`)
        let countryData = await response.json();

        let nameField = $(".country__name h2")
        let flagField = $(".country__flag img")
        let coaField = $(".country__coa img")
        let capitalField = $(".country__information p .capital")
        let languageField = $(".country__information p .language")
        let populationField = $(".country__information p .population")
        let areaField = $(".country__information p .area")
        let currencyField = $(".country__information p .currency")

        $(nameField).text(countryData[0].name.official);
        flagField[0].src = countryData[0].flags.png;
        coaField[0].src = countryData[0].coatOfArms.png;
        $(capitalField).text(countryData[0].capital[0]);
        let languageArray = Object.values(countryData[0].languages);
        let languageString = languageArray.join(", ")
        $(languageField).text(languageString)
        $(populationField).text(new Intl.NumberFormat().format(countryData[0].population))
        $(areaField).text(new Intl.NumberFormat().format(countryData[0].area))
        let currencyArray = Object.entries(countryData[0].currencies);
        currencyArray = Object.values(currencyArray[0])
        $(currencyField).text(`${currencyArray[1].name} (${currencyArray[1].symbol})`)
        console.log(currencyArray)


    } catch(error) {
        loadingScreen.text(`Failed to load data because of ${error}`)
    }
}

const resetColor = () => {
    $(countries).each((index, country) => {
        $(country).removeClass("selected-country")
    })
}

const returnToSearch = () => {
    $(".country__back-button button").on("click", () => {
        countryField.hide();
        searchField.show();
        initialMapPosition();
        initialSearchBarQuery();
        list.empty();
        resetColor();
    })
}
returnToSearch();

const populateCountryArray = () => {
    countries.each((index, country) => {
        let countryName = country.attributes.name.nodeValue
        let countryID = country.id
        let countryObject = {}
        countryObject.name = countryName
        countryObject.id = countryID
        //Dimitar helped me with this by pointing out the some() method, thanks Dimitar!
        if (!countryArray.some(obj => obj.name == countryObject.name)) {
            countryArray.push(countryObject)
        }
    })
}
populateCountryArray();

const setColor = (selectedCountry) => {
    resetColor();
    //doing it with jQuery didn't work, not sure why.
    document.querySelectorAll(`#${selectedCountry}`).forEach((countryDivision) => {
        countryDivision.classList.add("selected-country")
    })
}

const createSearchResults = () => {
    $(searchBar).on("input", () => {
        let userQuery = searchBar[0].value.toLowerCase();
        let searchArray = []
        $(countryArray).each((index, country) => {
            if (userQuery && country.name.toLowerCase().includes(userQuery)) {
                searchArray.push(country.name)
            }
        })
        list.empty()
        $(searchArray).each((index, country) => {
            list.append($(`<div class="list-item">${country}<div>`))
        })
        $(".list-item").each((index, listItem) => {
            $(listItem).on("click", () => {
                let retrievedObject = countryArray[countryArray.map(item => item.name).indexOf(listItem.innerText)]
                selectedCountry = retrievedObject.id

                setPosition(selectedCountry);
                setColor(selectedCountry);
                fetchCountryData(selectedCountry);
                loadingScreen.show()
                searchField.hide();
                countryField.show();
            })
        })
    })
}
createSearchResults();

})

