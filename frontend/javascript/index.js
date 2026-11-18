const getMethod = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Hiba: " + response.status);
        }
        return response.json();
    }
    catch(error) {
        throw new Error("Hiba: " + error.message);
    }
}

const elemekBetolt = (tomb) => {
    const select = document.getElementById('elemek-select');

    for (let i = 0; i < tomb.length; i++) {
        let opt = document.createElement('option');
        opt.value = tomb[i].elemneve;
        opt.textContent = tomb[i].elemneve;

        select.appendChild(opt);
    }
}

const tablaBetolt = (tomb, div, felfedezo) => {
    const adatok = ['rendszam', 'vegyjel', 'elemneve', 'felfedezve', 'gaz'];
    div.replaceChildren();

    //?table thead betölt

    const table = document.createElement('table');
    table.classList = "table table-bordered text-center table-striped align-middle shadow-sm mt-3 w-50 mx-auto";
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');
    
    for (let i = 0; i < adatok.length; i++) {
        let th = document.createElement('th');

        if (adatok[i] == "felfedezve" && felfedezo == true) {
            let ujTd = document.createElement('th')
            ujTd.textContent = "felfedezo";
            tr.appendChild(ujTd);
        }
        th.textContent = adatok[i];
        tr.appendChild(th);
    }
    thead.appendChild(tr);

    //?table tbody test betölt

    for (let i = 0; i < tomb.length; i++) {
        let tr = document.createElement('tr');

        for (let j = 0; j < adatok.length; j++) {
            let td = document.createElement('td');
            td.textContent = tomb[i][adatok[j]];

            if (adatok[j] == "felfedezve" && felfedezo == true) {
                let ujTd = document.createElement('td')
                if (tomb[i].felfedezo == null) {
                    ujTd.textContent = "ismeretlen";
                }
                else {
                    ujTd.textContent = tomb[i].felfedezo;
                }
                tr.appendChild(ujTd);
            }

            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    div.appendChild(table);
}

document.addEventListener('DOMContentLoaded', async () =>{
    try {
        const response = await getMethod('/api/getallelem');
        console.log(response);
        elemekBetolt(response.results.felfedez);

        document.getElementById('elem-btn').addEventListener('click', async () => {
            try {
                let keresett_input = document.getElementById('elem-input').value;
                const keresett = await getMethod('/api/getelem/' + keresett_input);
                console.log(keresett);

                if (keresett.success == true) {
                    tablaBetolt(keresett.results, document.getElementById('keresett-elem-tabla'), true);
                }
                else if (keresett.success = false){
                    document.getElementById('keresett-elem-tabla').replaceChildren();
                    throw new Error(keresett.results);
                }
            }
            catch (error) {
                document.getElementById('keresett-elem-tabla').textContent = error.message;
            }
        });
        
        const felfedezetlen = await getMethod('/api/ismeretlen');
        tablaBetolt(felfedezetlen.results, document.getElementById('felfedezetlen-elem'), false);

    }
    catch(error) {
        console.log(error.message);
    }
});